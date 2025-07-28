/**
 * Nashville Chord Builder implementation using Builder pattern
 * Provides fluent interface for Nashville chord construction
 */

import { 
  INashvilleChord, 
  NashvilleQuality, 
  RhythmicSymbol 
} from '../../../types/interfaces/core-interfaces';
import { NashvilleNumber } from '../../../types/value-objects/nashville-number';

/**
 * Concrete Nashville chord implementation
 */
class NashvilleChord implements INashvilleChord {
  constructor(
    public readonly number: number,
    public readonly quality: NashvilleQuality,
    public readonly accidental: '#' | 'b' | undefined,
    public readonly extensions: string[],
    public readonly bassNumber: number | undefined,
    public readonly bassAccidental: '#' | 'b' | undefined,
    public readonly rhythmicSymbols: RhythmicSymbol[]
  ) {}
}

/**
 * Builder for creating Nashville chord objects with fluent interface
 */
export class NashvilleChordBuilder {
  private number?: number;
  private quality: NashvilleQuality = NashvilleQuality.MAJOR;
  private accidental?: '#' | 'b';
  private extensions: string[] = [];
  private bassNumber?: number;
  private bassAccidental?: '#' | 'b';
  private rhythmicSymbols: RhythmicSymbol[] = [];

  /**
   * Set the Nashville number (1-7)
   */
  setNumber(number: number): NashvilleChordBuilder {
    const nashvilleNumber = new NashvilleNumber(number);
    this.number = nashvilleNumber.getValue();
    return this;
  }

  /**
   * Set the chord quality
   */
  setQuality(quality: NashvilleQuality): NashvilleChordBuilder {
    this.quality = quality;
    return this;
  }

  /**
   * Set the accidental
   */
  setAccidental(accidental?: '#' | 'b'): NashvilleChordBuilder {
    this.accidental = accidental;
    return this;
  }

  /**
   * Set the extensions
   */
  setExtensions(extensions: string[]): NashvilleChordBuilder {
    this.extensions = [...extensions];
    return this;
  }

  /**
   * Add a single extension
   */
  addExtension(extension: string): NashvilleChordBuilder {
    if (!this.extensions.includes(extension)) {
      this.extensions.push(extension);
    }
    return this;
  }

  /**
   * Set the bass number
   */
  setBassNumber(bassNumber?: number): NashvilleChordBuilder {
    if (bassNumber !== undefined) {
      const nashvilleBass = new NashvilleNumber(bassNumber);
      this.bassNumber = nashvilleBass.getValue();
    } else {
      this.bassNumber = undefined;
    }
    return this;
  }

  /**
   * Set the bass accidental
   */
  setBassAccidental(bassAccidental?: '#' | 'b'): NashvilleChordBuilder {
    this.bassAccidental = bassAccidental;
    return this;
  }

  /**
   * Set rhythmic symbols
   */
  setRhythmicSymbols(symbols: RhythmicSymbol[]): NashvilleChordBuilder {
    this.rhythmicSymbols = [...symbols];
    return this;
  }

  /**
   * Add a rhythmic symbol
   */
  addRhythmicSymbol(
    symbol: '◆' | '^' | '.' | '<' | '>',
    position: 'before' | 'after',
    meaning?: string
  ): NashvilleChordBuilder {
    const rhythmicSymbol: RhythmicSymbol = {
      symbol,
      position,
      meaning: meaning || this.getDefaultSymbolMeaning(symbol)
    };
    
    this.rhythmicSymbols.push(rhythmicSymbol);
    return this;
  }

  /**
   * Build the Nashville chord object
   */
  build(): INashvilleChord {
    this.validateChord();
    
    return new NashvilleChord(
      this.number!,
      this.quality,
      this.accidental,
      [...this.extensions],
      this.bassNumber,
      this.bassAccidental,
      [...this.rhythmicSymbols]
    );
  }

  /**
   * Reset the builder to initial state
   */
  reset(): NashvilleChordBuilder {
    this.number = undefined;
    this.quality = NashvilleQuality.MAJOR;
    this.accidental = undefined;
    this.extensions = [];
    this.bassNumber = undefined;
    this.bassAccidental = undefined;
    this.rhythmicSymbols = [];
    return this;
  }

  /**
   * Create a copy of this builder
   */
  clone(): NashvilleChordBuilder {
    const clone = new NashvilleChordBuilder();
    clone.number = this.number;
    clone.quality = this.quality;
    clone.accidental = this.accidental;
    clone.extensions = [...this.extensions];
    clone.bassNumber = this.bassNumber;
    clone.bassAccidental = this.bassAccidental;
    clone.rhythmicSymbols = [...this.rhythmicSymbols];
    return clone;
  }

  /**
   * Build a major Nashville chord (convenience method)
   */
  buildMajor(number: number): INashvilleChord {
    return this.reset()
      .setNumber(number)
      .setQuality(NashvilleQuality.MAJOR)
      .build();
  }

  /**
   * Build a minor Nashville chord (convenience method)
   */
  buildMinor(number: number): INashvilleChord {
    return this.reset()
      .setNumber(number)
      .setQuality(NashvilleQuality.MINOR)
      .build();
  }

  /**
   * Build a diminished Nashville chord (convenience method)
   */
  buildDiminished(number: number): INashvilleChord {
    return this.reset()
      .setNumber(number)
      .setQuality(NashvilleQuality.DIMINISHED)
      .build();
  }

  /**
   * Build an augmented Nashville chord (convenience method)
   */
  buildAugmented(number: number): INashvilleChord {
    return this.reset()
      .setNumber(number)
      .setQuality(NashvilleQuality.AUGMENTED)
      .build();
  }

  /**
   * Build a suspended Nashville chord (convenience method)
   */
  buildSuspended(number: number, suspensionType?: string): INashvilleChord {
    const builder = this.reset()
      .setNumber(number)
      .setQuality(NashvilleQuality.SUSPENDED);
    
    if (suspensionType) {
      builder.addExtension(suspensionType);
    }
    
    return builder.build();
  }

  /**
   * Build a Nashville chord with 7th extension (convenience method)
   */
  buildWith7th(number: number, quality: NashvilleQuality = NashvilleQuality.MAJOR): INashvilleChord {
    return this.reset()
      .setNumber(number)
      .setQuality(quality)
      .addExtension('7')
      .build();
  }

  /**
   * Build a Nashville chord with slash bass (convenience method)
   */
  buildWithBass(
    number: number, 
    quality: NashvilleQuality, 
    bassNumber: number,
    bassAccidental?: '#' | 'b'
  ): INashvilleChord {
    return this.reset()
      .setNumber(number)
      .setQuality(quality)
      .setBassNumber(bassNumber)
      .setBassAccidental(bassAccidental)
      .build();
  }

  /**
   * Build a Nashville chord with rhythmic notation (convenience method)
   */
  buildWithRhythm(
    number: number,
    quality: NashvilleQuality,
    rhythmicPattern: Array<{ symbol: '◆' | '^' | '.' | '<' | '>'; position: 'before' | 'after' }>
  ): INashvilleChord {
    const builder = this.reset()
      .setNumber(number)
      .setQuality(quality);
    
    for (const pattern of rhythmicPattern) {
      builder.addRhythmicSymbol(pattern.symbol, pattern.position);
    }
    
    return builder.build();
  }

  /**
   * Parse a Nashville chord string and build the chord
   */
  parseAndBuild(nashvilleString: string): INashvilleChord {
    const parsed = this.parseNashvilleString(nashvilleString);
    
    return this.reset()
      .setNumber(parsed.number)
      .setQuality(parsed.quality)
      .setAccidental(parsed.accidental)
      .setExtensions(parsed.extensions)
      .setBassNumber(parsed.bassNumber)
      .setBassAccidental(parsed.bassAccidental)
      .setRhythmicSymbols(parsed.rhythmicSymbols)
      .build();
  }

  private validateChord(): void {
    if (this.number === undefined) {
      throw new Error('Nashville chord must have a number');
    }

    if (this.bassNumber !== undefined && this.bassNumber === this.number) {
      throw new Error('Bass number cannot be the same as the chord number');
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

  private parseNashvilleString(nashvilleString: string): {
    number: number;
    quality: NashvilleQuality;
    accidental?: '#' | 'b';
    extensions: string[];
    bassNumber?: number;
    bassAccidental?: '#' | 'b';
    rhythmicSymbols: RhythmicSymbol[];
  } {
    // This is a simplified parser - in a real implementation, this would be more robust
    const match = nashvilleString.match(/^([◆^.<>]*)([#b]?)([1-7])([m°+]?)([^/]*)(?:\/([#b]?)([1-7]))?([◆^.<>]*)$/);
    
    if (!match) {
      throw new Error(`Invalid Nashville chord format: ${nashvilleString}`);
    }

    const [, beforeSymbols, accidental, numberStr, qualityStr, extensionsStr, bassAccidental, bassNumberStr, afterSymbols] = match;

    const number = parseInt(numberStr, 10);
    const quality = this.parseQuality(qualityStr);
    const extensions = extensionsStr ? [extensionsStr] : [];
    const bassNumber = bassNumberStr ? parseInt(bassNumberStr, 10) : undefined;
    const rhythmicSymbols = this.parseRhythmicSymbols(beforeSymbols, afterSymbols);

    return {
      number,
      quality,
      accidental: (accidental as '#' | 'b') || undefined,
      extensions,
      bassNumber,
      bassAccidental: (bassAccidental as '#' | 'b') || undefined,
      rhythmicSymbols
    };
  }

  private parseQuality(qualityStr: string): NashvilleQuality {
    switch (qualityStr) {
      case 'm':
        return NashvilleQuality.MINOR;
      case '°':
        return NashvilleQuality.DIMINISHED;
      case '+':
        return NashvilleQuality.AUGMENTED;
      default:
        return NashvilleQuality.MAJOR;
    }
  }

  private parseRhythmicSymbols(beforeSymbols: string, afterSymbols: string): RhythmicSymbol[] {
    const symbols: RhythmicSymbol[] = [];

    for (const symbol of beforeSymbols) {
      if (this.isValidRhythmicSymbol(symbol)) {
        symbols.push({
          symbol: symbol as '◆' | '^' | '.' | '<' | '>',
          position: 'before',
          meaning: this.getDefaultSymbolMeaning(symbol as '◆' | '^' | '.' | '<' | '>')
        });
      }
    }

    for (const symbol of afterSymbols) {
      if (this.isValidRhythmicSymbol(symbol)) {
        symbols.push({
          symbol: symbol as '◆' | '^' | '.' | '<' | '>',
          position: 'after',
          meaning: this.getDefaultSymbolMeaning(symbol as '◆' | '^' | '.' | '<' | '>')
        });
      }
    }

    return symbols;
  }

  private isValidRhythmicSymbol(char: string): boolean {
    return ['◆', '^', '.', '<', '>'].includes(char);
  }
}