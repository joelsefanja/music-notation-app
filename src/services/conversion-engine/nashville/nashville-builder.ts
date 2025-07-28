/**
 * Nashville Builder implementation using Builder pattern
 * Provides fluent interface for Nashville notation construction
 */

import { 
  INashvilleBuilder, 
  INashvilleNotation, 
  INashvilleChord, 
  RhythmicSymbol, 
  BarLine 
} from '../../../types/interfaces/core-interfaces';
import { NashvilleNumber } from '../../../types/value-objects/nashville-number';
import { NashvilleChordBuilder } from '../chord/nashville-chord-builder';

/**
 * Concrete Nashville notation implementation
 */
class NashvilleNotation implements INashvilleNotation {
  constructor(
    public readonly key: string,
    public readonly timeSignature: string | undefined,
    public readonly chords: INashvilleChord[],
    public readonly rhythmicSymbols: RhythmicSymbol[],
    public readonly barLines: BarLine[],
    public readonly includeRhythm: boolean,
    public readonly includeBarLines: boolean
  ) {}
}

/**
 * Builder for creating Nashville notation with fluent interface
 */
export class NashvilleBuilder implements INashvilleBuilder {
  private key?: string;
  private timeSignature?: string;
  private chords: INashvilleChord[] = [];
  private rhythmicSymbols: RhythmicSymbol[] = [];
  private barLines: BarLine[] = [];
  private includeRhythm = false;
  private includeBarLines = false;

  /**
   * Set the key for the Nashville notation
   */
  setKey(key: string): INashvilleBuilder {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
    this.key = key.trim();
    return this;
  }

  /**
   * Set the time signature
   */
  setTimeSignature(timeSignature: string): INashvilleBuilder {
    if (!timeSignature || typeof timeSignature !== 'string') {
      throw new Error('Time signature must be a non-empty string');
    }
    
    // Validate time signature format (e.g., "4/4", "3/4", "6/8")
    if (!/^\d+\/\d+$/.test(timeSignature.trim())) {
      throw new Error('Time signature must be in format "numerator/denominator" (e.g., "4/4")');
    }
    
    this.timeSignature = timeSignature.trim();
    return this;
  }

  /**
   * Add a chord progression using Nashville numbers
   */
  addChordProgression(progression: number[]): INashvilleBuilder {
    if (!Array.isArray(progression) || progression.length === 0) {
      throw new Error('Progression must be a non-empty array of numbers');
    }

    const chordBuilder = new NashvilleChordBuilder();
    
    for (const number of progression) {
      // Validate Nashville number
      if (!NashvilleNumber.isValid(number)) {
        throw new Error(`Invalid Nashville number: ${number}. Must be between 1 and 7.`);
      }

      // Create a basic major chord for each number
      const chord = chordBuilder.buildMajor(number);
      this.chords.push(chord);
    }

    return this;
  }

  /**
   * Add a single Nashville chord
   */
  addChord(chord: INashvilleChord): INashvilleBuilder {
    if (!chord) {
      throw new Error('Chord cannot be null or undefined');
    }
    this.chords.push(chord);
    return this;
  }

  /**
   * Add multiple Nashville chords
   */
  addChords(chords: INashvilleChord[]): INashvilleBuilder {
    if (!Array.isArray(chords)) {
      throw new Error('Chords must be an array');
    }
    
    for (const chord of chords) {
      this.addChord(chord);
    }
    
    return this;
  }

  /**
   * Set whether to include rhythmic notation
   */
  setRhythmicNotation(enabled: boolean): INashvilleBuilder {
    this.includeRhythm = enabled;
    return this;
  }

  /**
   * Set whether to include bar notation
   */
  setBarNotation(enabled: boolean): INashvilleBuilder {
    this.includeBarLines = enabled;
    return this;
  }

  /**
   * Add a rhythmic symbol
   */
  addRhythmicSymbol(
    symbol: '◆' | '^' | '.' | '<' | '>',
    position: 'before' | 'after',
    meaning?: string
  ): INashvilleBuilder {
    const rhythmicSymbol: RhythmicSymbol = {
      symbol,
      position,
      meaning: meaning || this.getDefaultSymbolMeaning(symbol)
    };
    
    this.rhythmicSymbols.push(rhythmicSymbol);
    return this;
  }

  /**
   * Add multiple rhythmic symbols
   */
  addRhythmicSymbols(symbols: RhythmicSymbol[]): INashvilleBuilder {
    if (!Array.isArray(symbols)) {
      throw new Error('Symbols must be an array');
    }
    
    this.rhythmicSymbols.push(...symbols);
    return this;
  }

  /**
   * Add a bar line
   */
  addBarLine(position: number, type: 'single' | 'double' | 'repeat_start' | 'repeat_end' = 'single'): INashvilleBuilder {
    if (typeof position !== 'number' || position < 0) {
      throw new Error('Bar line position must be a non-negative number');
    }
    
    const barLine: BarLine = { position, type };
    this.barLines.push(barLine);
    return this;
  }

  /**
   * Add multiple bar lines
   */
  addBarLines(barLines: BarLine[]): INashvilleBuilder {
    if (!Array.isArray(barLines)) {
      throw new Error('Bar lines must be an array');
    }
    
    this.barLines.push(...barLines);
    return this;
  }

  /**
   * Build the Nashville notation object
   */
  build(): INashvilleNotation {
    this.validateNotation();
    
    return new NashvilleNotation(
      this.key!,
      this.timeSignature,
      [...this.chords],
      [...this.rhythmicSymbols],
      [...this.barLines],
      this.includeRhythm,
      this.includeBarLines
    );
  }

  /**
   * Reset the builder to initial state
   */
  reset(): INashvilleBuilder {
    this.key = undefined;
    this.timeSignature = undefined;
    this.chords = [];
    this.rhythmicSymbols = [];
    this.barLines = [];
    this.includeRhythm = false;
    this.includeBarLines = false;
    return this;
  }

  /**
   * Create a copy of this builder
   */
  clone(): NashvilleBuilder {
    const clone = new NashvilleBuilder();
    clone.key = this.key;
    clone.timeSignature = this.timeSignature;
    clone.chords = [...this.chords];
    clone.rhythmicSymbols = [...this.rhythmicSymbols];
    clone.barLines = [...this.barLines];
    clone.includeRhythm = this.includeRhythm;
    clone.includeBarLines = this.includeBarLines;
    return clone;
  }

  /**
   * Build a simple progression (convenience method)
   */
  buildSimpleProgression(key: string, progression: number[]): INashvilleNotation {
    return this.reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(progression)
      .build();
  }

  /**
   * Build a progression with rhythm (convenience method)
   */
  buildRhythmicProgression(
    key: string, 
    progression: number[], 
    timeSignature = '4/4'
  ): INashvilleNotation {
    return this.reset()
      .setKey(key)
      .setTimeSignature(timeSignature)
      .addChordProgression(progression)
      .setRhythmicNotation(true)
      .setBarNotation(true)
      .build();
  }

  /**
   * Build a progression with custom chords
   */
  buildCustomProgression(key: string, chords: INashvilleChord[]): INashvilleNotation {
    // Extract Nashville numbers from the INashvilleChord objects
    // This assumes that INashvilleChord has a 'number' property.
    const nashvilleNumbers = chords.map(chord => {
      // Add a check to ensure 'chord.number' exists and is valid
      if (chord && typeof chord.number === 'number' && NashvilleNumber.isValid(chord.number)) {
        return chord.number;
      } else {
        // Handle cases where chord.number might be missing or invalid.
        throw new Error(`Invalid or missing Nashville number in chord: ${JSON.stringify(chord)}`);
      }
    });

    return this.reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(nashvilleNumbers) // Use the existing interface method
      .build();
  }

  /**
   * Add common chord progressions
   */
  addCommonProgression(progressionName: string): INashvilleBuilder {
    const progressions: Record<string, number[]> = {
      'I-V-vi-IV': [1, 5, 6, 4],
      'vi-IV-I-V': [6, 4, 1, 5],
      'ii-V-I': [2, 5, 1],
      'I-vi-ii-V': [1, 6, 2, 5],
      'I-IV-V-I': [1, 4, 5, 1],
      'vi-ii-V-I': [6, 2, 5, 1],
      'I-iii-vi-IV': [1, 3, 6, 4],
      'blues': [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 1]
    };

    const progression = progressions[progressionName];
    if (!progression) {
      throw new Error(`Unknown progression: ${progressionName}. Available: ${Object.keys(progressions).join(', ')}`);
    }

    return this.addChordProgression(progression);
  }

  /**
   * Set up for a specific musical style
   */
  setupForStyle(style: 'country' | 'pop' | 'jazz' | 'blues' | 'rock'): INashvilleBuilder {
    switch (style) {
      case 'country':
        this.setTimeSignature('4/4')
          .setRhythmicNotation(true)
          .setBarNotation(true);
        break;
      case 'pop':
        this.setTimeSignature('4/4')
          .setRhythmicNotation(false)
          .setBarNotation(true);
        break;
      case 'jazz':
        this.setTimeSignature('4/4')
          .setRhythmicNotation(true)
          .setBarNotation(true);
        break;
      case 'blues':
        this.setTimeSignature('4/4')
          .setRhythmicNotation(true)
          .setBarNotation(true);
        break;
      case 'rock':
        this.setTimeSignature('4/4')
          .setRhythmicNotation(false)
          .setBarNotation(true);
        break;
      default:
        throw new Error(`Unknown style: ${style}`);
    }
    return this;
  }


  /**
   * Add repeat markers
   */
  addRepeatSection(startPosition: number, endPosition: number): INashvilleBuilder {
    this.addBarLine(startPosition, 'repeat_start');
    this.addBarLine(endPosition, 'repeat_end');
    return this;
  }

  private validateNotation(): void {
    if (!this.key) {
      throw new Error('Nashville notation must have a key');
    }

    if (this.chords.length === 0) {
      throw new Error('Nashville notation must have at least one chord');
    }

    // Validate bar lines are in order
    const sortedBarLines = [...this.barLines].sort((a, b) => a.position - b.position);
    for (let i = 0; i < sortedBarLines.length - 1; i++) {
      if (sortedBarLines[i].position === sortedBarLines[i + 1].position) {
        throw new Error(`Duplicate bar line at position ${sortedBarLines[i].position}`);
      }
    }

    // Validate repeat markers are paired
    const repeatStarts = this.barLines.filter(bl => bl.type === 'repeat_start').length;
    const repeatEnds = this.barLines.filter(bl => bl.type === 'repeat_end').length;
    if (repeatStarts !== repeatEnds) {
      throw new Error('Repeat start and end markers must be paired');
    }
  }

  private getDefaultSymbolMeaning(symbol: '◆' | '^' | '.' | '<' | '>'): string {
    const meanings = {
      '◆': 'Diamond - whole note or sustained',
      '^': 'Caret - accent or emphasis',
      '.': 'Dot - staccato or short',
      '<': 'Less than - crescendo start',
      '>': 'Greater than - decrescendo start'
    };
    return meanings[symbol];
  }

  /**
   * Add bar lines for a given number of measures
   */
  addMeasureBarLines(measures: number, beatsPerMeasure = 4): INashvilleBuilder {
    for (let i = 1; i <= measures; i++) {
      this.addBarLine(i * beatsPerMeasure, 'single');
    }
    return this;
  }

  /**
   * Get current state summary
   */
  getSummary(): {
    key?: string;
    timeSignature?: string;
    chordCount: number;
    rhythmicSymbolCount: number;
    barLineCount: number;
    includeRhythm: boolean;
    includeBarLines: boolean;
  } {
    return {
      key: this.key,
      timeSignature: this.timeSignature,
      chordCount: this.chords.length,
      rhythmicSymbolCount: this.rhythmicSymbols.length,
      barLineCount: this.barLines.length,
      includeRhythm: this.includeRhythm,
      includeBarLines: this.includeBarLines
    };
  }
}
