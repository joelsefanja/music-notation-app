/**
 * Key Transposer implementation with Command pattern
 * Handles chord and key transposition with undo/redo functionality
 */

import { 
  IKeyTransposer, 
  ITransposeCommand, 
  IChord 
} from '../../../types/interfaces/core-interfaces';
import { ChordRoot } from '../../../types/value-objects/chord-root';
import { CanonicalSongModel } from '../../../types/canonical-model';
import { TransposeKeyCommand } from './transpose-key-command';

/**
 * Enhanced key transposer service with command pattern support
 */
export class KeyTransposer implements IKeyTransposer {
  /**
   * Keys that prefer flat notation
   */
  private static readonly FLAT_KEYS = new Set([
    'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
    'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'
  ]);

  /**
   * Circle of fifths for key relationships
   */
  private static readonly CIRCLE_OF_FIFTHS = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'
  ];

  /**
   * Transpose a chord by a given number of semitones
   */
  transposeChord(chord: IChord, semitones: number, targetKey?: string): IChord {
    const transposedRoot = this.transposeNote(chord.root, semitones, targetKey);
    const transposedBassNote = chord.bassNote 
      ? this.transposeNote(chord.bassNote, semitones, targetKey)
      : undefined;

    // Create new chord with transposed notes
    return {
      root: transposedRoot,
      quality: chord.quality,
      extensions: [...chord.extensions],
      bassNote: transposedBassNote,
      position: chord.position,
      originalNotation: this.buildTransposedNotation(chord, transposedRoot, transposedBassNote),
      nashvilleNumber: chord.nashvilleNumber
    };
  }

  /**
   * Transpose a single note by a given number of semitones
   */
  transposeNote(note: string, semitones: number, targetKey?: string): string {
    const chordRoot = new ChordRoot(note);
    const preferFlats = targetKey ? KeyTransposer.FLAT_KEYS.has(targetKey) : false;
    
    return chordRoot.transpose(semitones, preferFlats).getValue();
  }

  /**
   * Get the distance in semitones between two keys
   */
  getKeyDistance(fromKey: string, toKey: string): number {
    const fromRoot = this.getKeyRoot(fromKey);
    const toRoot = this.getKeyRoot(toKey);
    
    const fromChordRoot = new ChordRoot(fromRoot);
    const toChordRoot = new ChordRoot(toRoot);
    
    let distance = toChordRoot.getChromaticIndex() - fromChordRoot.getChromaticIndex();
    
    // Normalize to 0-11 range
    if (distance < 0) {
      distance += 12;
    }
    
    return distance;
  }

  /**
   * Create a transpose command for a canonical song model
   */
  createTransposeCommand(
    model: CanonicalSongModel, 
    fromKey: string, 
    toKey: string
  ): ITransposeCommand {
    return new TransposeKeyCommand(model, fromKey, toKey, this);
  }

  /**
   * Transpose multiple chords at once
   */
  transposeChords(chords: IChord[], semitones: number, targetKey?: string): IChord[] {
    return chords.map(chord => this.transposeChord(chord, semitones, targetKey));
  }

  /**
   * Transpose chords from one key to another
   */
  transposeToKey(chords: IChord[], fromKey: string, toKey: string): IChord[] {
    const semitones = this.getKeyDistance(fromKey, toKey);
    return this.transposeChords(chords, semitones, toKey);
  }

  /**
   * Get the relative minor/major key
   */
  getRelativeKey(key: string): string {
    const isMinor = key.endsWith('m');
    const root = this.getKeyRoot(key);
    const rootChord = new ChordRoot(root);
    
    if (isMinor) {
      // Get relative major (minor third up)
      const relativeMajor = rootChord.transpose(3);
      return relativeMajor.getValue();
    } else {
      // Get relative minor (minor third down)
      const relativeMinor = rootChord.transpose(-3);
      return relativeMinor.getValue() + 'm';
    }
  }

  /**
   * Get the parallel minor/major key
   */
  getParallelKey(key: string): string {
    const isMinor = key.endsWith('m');
    const root = this.getKeyRoot(key);
    
    return isMinor ? root : root + 'm';
  }

  /**
   * Check if two keys are enharmonically equivalent
   */
  areKeysEnharmonic(key1: string, key2: string): boolean {
    const root1 = new ChordRoot(this.getKeyRoot(key1));
    const root2 = new ChordRoot(this.getKeyRoot(key2));
    
    const isMinor1 = key1.endsWith('m');
    const isMinor2 = key2.endsWith('m');
    
    return root1.getChromaticIndex() === root2.getChromaticIndex() && 
           isMinor1 === isMinor2;
  }

  /**
   * Get the key signature (number of sharps/flats)
   */
  getKeySignature(key: string): { sharps: number; flats: number; accidentals: string[] } {
    const root = this.getKeyRoot(key);
    const isMinor = key.endsWith('m');
    
    // Convert minor to relative major for key signature calculation
    const majorKey = isMinor ? this.getRelativeKey(key) : key;
    
    const keySignatures: Record<string, { sharps: number; flats: number; accidentals: string[] }> = {
      'C': { sharps: 0, flats: 0, accidentals: [] },
      'G': { sharps: 1, flats: 0, accidentals: ['F#'] },
      'D': { sharps: 2, flats: 0, accidentals: ['F#', 'C#'] },
      'A': { sharps: 3, flats: 0, accidentals: ['F#', 'C#', 'G#'] },
      'E': { sharps: 4, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#'] },
      'B': { sharps: 5, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#'] },
      'F#': { sharps: 6, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
      'C#': { sharps: 7, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] },
      'F': { sharps: 0, flats: 1, accidentals: ['Bb'] },
      'Bb': { sharps: 0, flats: 2, accidentals: ['Bb', 'Eb'] },
      'Eb': { sharps: 0, flats: 3, accidentals: ['Bb', 'Eb', 'Ab'] },
      'Ab': { sharps: 0, flats: 4, accidentals: ['Bb', 'Eb', 'Ab', 'Db'] },
      'Db': { sharps: 0, flats: 5, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
      'Gb': { sharps: 0, flats: 6, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
      'Cb': { sharps: 0, flats: 7, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] }
    };
    
    return keySignatures[majorKey] || { sharps: 0, flats: 0, accidentals: [] };
  }

  /**
   * Get the scale degrees for a key
   */
  getScaleDegrees(key: string): string[] {
    const root = this.getKeyRoot(key);
    const isMinor = key.endsWith('m');
    const rootChord = new ChordRoot(root);
    const preferFlats = KeyTransposer.FLAT_KEYS.has(key);
    
    const intervals = isMinor 
      ? [0, 2, 3, 5, 7, 8, 10] // Natural minor scale
      : [0, 2, 4, 5, 7, 9, 11]; // Major scale
    
    return intervals.map(interval => 
      rootChord.transpose(interval, preferFlats).getValue()
    );
  }

  /**
   * Get chord function in a key (I, ii, iii, etc.)
   */
  getChordFunction(chord: IChord, key: string): string {
    const scaleDegrees = this.getScaleDegrees(key);
    const chordRoot = new ChordRoot(chord.root);
    const isMinor = key.endsWith('m');
    
    const degreeIndex = scaleDegrees.findIndex(degree => {
      const degreeChord = new ChordRoot(degree);
      return chordRoot.getChromaticIndex() === degreeChord.getChromaticIndex();
    });
    
    if (degreeIndex === -1) {
      return 'N/A'; // Not in key
    }
    
    const romanNumerals = isMinor
      ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
      : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    
    return romanNumerals[degreeIndex];
  }

  /**
   * Suggest the best enharmonic spelling for a key
   */
  suggestBestEnharmonicSpelling(key: string): string {
    const root = this.getKeyRoot(key);
    const isMinor = key.endsWith('m');
    
    try {
      const chordRoot = new ChordRoot(root);
      const enharmonic = chordRoot.getEnharmonicEquivalent();
      
      if (!enharmonic) {
        return key; // No enharmonic equivalent
      }
      
      const originalKey = key;
      const enharmonicKey = enharmonic.getValue() + (isMinor ? 'm' : '');
      
      // Prefer keys with fewer accidentals
      const originalSignature = this.getKeySignature(originalKey);
      const enharmonicSignature = this.getKeySignature(enharmonicKey);
      
      const originalAccidentals = originalSignature.sharps + originalSignature.flats;
      const enharmonicAccidentals = enharmonicSignature.sharps + enharmonicSignature.flats;
      
      return enharmonicAccidentals < originalAccidentals ? enharmonicKey : originalKey;
    } catch {
      return key;
    }
  }

  /**
   * Get common chord progressions in a key
   */
  getCommonProgressions(key: string): { name: string; chords: string[] }[] {
    const scaleDegrees = this.getScaleDegrees(key);
    const isMinor = key.endsWith('m');
    
    if (isMinor) {
      return [
        { name: 'i-VI-VII', chords: [scaleDegrees[0] + 'm', scaleDegrees[5], scaleDegrees[6]] },
        { name: 'i-iv-V', chords: [scaleDegrees[0] + 'm', scaleDegrees[3] + 'm', scaleDegrees[4]] },
        { name: 'i-VII-VI-VII', chords: [scaleDegrees[0] + 'm', scaleDegrees[6], scaleDegrees[5], scaleDegrees[6]] }
      ];
    } else {
      return [
        { name: 'I-V-vi-IV', chords: [scaleDegrees[0], scaleDegrees[4], scaleDegrees[5] + 'm', scaleDegrees[3]] },
        { name: 'ii-V-I', chords: [scaleDegrees[1] + 'm', scaleDegrees[4], scaleDegrees[0]] },
        { name: 'I-vi-ii-V', chords: [scaleDegrees[0], scaleDegrees[5] + 'm', scaleDegrees[1] + 'm', scaleDegrees[4]] }
      ];
    }
  }

  /**
   * Extract the root note from a key string
   */
  private getKeyRoot(key: string): string {
    return key.replace(/m$/, '');
  }

  /**
   * Build transposed notation for a chord
   */
  private buildTransposedNotation(
    originalChord: IChord, 
    newRoot: string, 
    newBassNote?: string
  ): string {
    let notation = newRoot;
    
    // Add quality
    switch (originalChord.quality) {
      case 'min':
        notation += 'm';
        break;
      case 'dim':
        notation += 'dim';
        break;
      case 'aug':
        notation += 'aug';
        break;
      case 'sus':
        notation += 'sus';
        break;
      case 'dom':
        notation += '7';
        break;
    }
    
    // Add extensions
    notation += originalChord.extensions.map(ext => {
      if (ext.type === 'add') {
        return `add${ext.value}`;
      }
      return ext.value;
    }).join('');
    
    // Add bass note
    if (newBassNote) {
      notation += `/${newBassNote}`;
    }
    
    return notation;
  }
}