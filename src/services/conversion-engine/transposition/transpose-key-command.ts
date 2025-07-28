/**
 * Transpose Key Command implementation using Command pattern
 * Provides undo/redo functionality for key transposition
 */

import { ITransposeCommand, IKeyTransposer } from '../../../types/interfaces/core-interfaces';
import { CanonicalSongModel } from '../../../types/canonical-model';

/**
 * Command for transposing a song from one key to another with undo support
 */
export class TransposeKeyCommand implements ITransposeCommand {
  private originalKey: string;
  private targetKey: string;
  private semitones: number;
  private affectedChords: Array<{
    sectionIndex: number;
    lineIndex: number;
    chordIndex: number;
    originalChord: any;
    transposedChord: any;
  }> = [];
  private originalMetadata: any;
  private executed = false;

  constructor(
    private canonicalModel: CanonicalSongModel,
    private fromKey: string,
    private toKey: string,
    private transposer: IKeyTransposer
  ) {
    this.originalKey = fromKey;
    this.targetKey = toKey;
    this.semitones = this.transposer.getKeyDistance(fromKey, toKey);
    this.originalMetadata = { ...canonicalModel.metadata };
  }

  /**
   * Execute the transposition command
   */
  async execute(): Promise<void> {
    if (this.executed) {
      throw new Error('Command has already been executed');
    }

    this.affectedChords = [];

    // Transpose all chords in the song
    for (let sectionIndex = 0; sectionIndex < this.canonicalModel.sections.length; sectionIndex++) {
      const section = this.canonicalModel.sections[sectionIndex];
      
      for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
        const line = section.lines[lineIndex];
        
        if (line.type === 'text' && 'chords' in line) {
          const textLine = line as any; // Type assertion for chords property
          
          for (let chordIndex = 0; chordIndex < textLine.chords.length; chordIndex++) {
            const chordPlacement = textLine.chords[chordIndex];
            const originalChord = { ...chordPlacement.chord };
            
            // Transpose the chord
            const transposedChord = this.transposer.transposeChord(
              chordPlacement.chord,
              this.semitones,
              this.targetKey
            );
            
            // Store the change for undo
            this.affectedChords.push({
              sectionIndex,
              lineIndex,
              chordIndex,
              originalChord,
              transposedChord
            });
            
            // Apply the transposition
            chordPlacement.chord = transposedChord;
          }
        }
      }
    }

    // Update the song metadata
    this.canonicalModel.metadata = {
      ...this.canonicalModel.metadata,
      originalKey: this.targetKey,
      transposedFrom: this.originalKey,
      transpositionSemitones: this.semitones,
      lastTransposed: new Date().toISOString()
    };

    this.executed = true;
  }

  /**
   * Undo the transposition command
   */
  async undo(): Promise<void> {
    if (!this.executed) {
      throw new Error('Cannot undo a command that has not been executed');
    }

    // Restore all original chords
    for (const change of this.affectedChords) {
      const section = this.canonicalModel.sections[change.sectionIndex];
      const line = section.lines[change.lineIndex] as any;
      const chordPlacement = line.chords[change.chordIndex];
      
      chordPlacement.chord = change.originalChord;
    }

    // Restore original metadata
    this.canonicalModel.metadata = { ...this.originalMetadata };

    this.executed = false;
    this.affectedChords = [];
  }

  /**
   * Get a description of this command
   */
  getDescription(): string {
    return `Transpose from ${this.originalKey} to ${this.targetKey} (${this.semitones} semitones)`;
  }

  /**
   * Check if this command can be undone
   */
  canUndo(): boolean {
    return this.executed;
  }

  /**
   * Get the number of chords affected by this transposition
   */
  getAffectedChordCount(): number {
    return this.affectedChords.length;
  }

  /**
   * Get the semitone distance of this transposition
   */
  getSemitones(): number {
    return this.semitones;
  }

  /**
   * Get the original key
   */
  getOriginalKey(): string {
    return this.originalKey;
  }

  /**
   * Get the target key
   */
  getTargetKey(): string {
    return this.targetKey;
  }

  /**
   * Check if this command has been executed
   */
  isExecuted(): boolean {
    return this.executed;
  }

  /**
   * Get a summary of the changes made
   */
  getChangeSummary(): {
    sectionsAffected: number;
    linesAffected: number;
    chordsAffected: number;
    semitones: number;
    fromKey: string;
    toKey: string;
  } {
    const uniqueSections = new Set(this.affectedChords.map(c => c.sectionIndex));
    const uniqueLines = new Set(this.affectedChords.map(c => `${c.sectionIndex}-${c.lineIndex}`));

    return {
      sectionsAffected: uniqueSections.size,
      linesAffected: uniqueLines.size,
      chordsAffected: this.affectedChords.length,
      semitones: this.semitones,
      fromKey: this.originalKey,
      toKey: this.targetKey
    };
  }

  /**
   * Create a preview of what this command would do without executing it
   */
  preview(): {
    description: string;
    changes: Array<{
      sectionName: string;
      lineNumber: number;
      originalChord: string;
      transposedChord: string;
    }>;
  } {
    const changes: Array<{
      sectionName: string;
      lineNumber: number;
      originalChord: string;
      transposedChord: string;
    }> = [];

    // Preview all chord changes
    for (let sectionIndex = 0; sectionIndex < this.canonicalModel.sections.length; sectionIndex++) {
      const section = this.canonicalModel.sections[sectionIndex];
      
      for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
        const line = section.lines[lineIndex];
        
        if (line.type === 'text' && 'chords' in line) {
          const textLine = line as any;
          
          for (const chordPlacement of textLine.chords) {
            const transposedChord = this.transposer.transposeChord(
              chordPlacement.chord,
              this.semitones,
              this.targetKey
            );
            
            changes.push({
              sectionName: section.type || 'Unknown',
              lineNumber: lineIndex + 1,
              originalChord: chordPlacement.chord.originalNotation,
              transposedChord: transposedChord.originalNotation
            });
          }
        }
      }
    }

    return {
      description: this.getDescription(),
      changes
    };
  }

  /**
   * Validate that this command can be executed
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.canonicalModel) {
      errors.push('Canonical model is required');
    }

    if (!this.originalKey || !this.targetKey) {
      errors.push('Both original and target keys are required');
    }

    if (this.originalKey === this.targetKey) {
      errors.push('Original and target keys cannot be the same');
    }

    if (this.executed) {
      errors.push('Command has already been executed');
    }

    try {
      this.transposer.getKeyDistance(this.originalKey, this.targetKey);
    } catch (error) {
      errors.push(`Invalid key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}