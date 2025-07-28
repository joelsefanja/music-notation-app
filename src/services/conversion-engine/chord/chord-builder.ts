/**
 * Chord Builder implementation using Builder pattern
 * Provides fluent interface for chord construction
 */

import { 
  IChordBuilder, 
  IChord, 
  ChordQuality, 
  ChordExtension 
} from '../../../types/interfaces/core-interfaces';
import { ChordRoot } from '../../../types/value-objects/chord-root';

/**
 * Concrete chord implementation
 */
class Chord implements IChord {
  constructor(
    public readonly root: string,
    public readonly quality: ChordQuality,
    public readonly extensions: ChordExtension[],
    public readonly bassNote: string | undefined,
    public readonly originalNotation: string,
    public readonly nashvilleNumber: string | undefined,
    public readonly position: number
  ) {}
}

/**
 * Builder for creating chord objects with fluent interface
 */
export class ChordBuilder implements IChordBuilder {
  private root?: string;
  private quality: ChordQuality = ChordQuality.MAJOR;
  private extensions: ChordExtension[] = [];
  private bassNote?: string;
  private originalNotation = '';
  private nashvilleNumber?: string;
  private position = 0;

  /**
   * Set the chord root
   */
  setRoot(root: string): IChordBuilder {
    const chordRoot = new ChordRoot(root);
    this.root = chordRoot.getValue();
    return this;
  }

  /**
   * Set the chord quality
   */
  setQuality(quality: ChordQuality): IChordBuilder {
    this.quality = quality;
    return this;
  }

  /**
   * Set the chord extensions
   */
  setExtensions(extensions: ChordExtension[]): IChordBuilder {
    this.extensions = [...extensions];
    return this;
  }

  /**
   * Add a single extension
   */
  addExtension(extension: ChordExtension): IChordBuilder {
    this.extensions.push(extension);
    return this;
  }

  /**
   * Add an extension by type and value
   */
  addExtensionByValue(
    type: 'add' | 'sus' | 'maj' | 'min' | 'dim' | 'aug',
    value: string
  ): IChordBuilder {
    this.extensions.push({
      type,
      value,
      position: this.extensions.length
    });
    return this;
  }

  /**
   * Set the bass note
   */
  setBassNote(bassNote?: string): IChordBuilder {
    if (bassNote) {
      const bassRoot = new ChordRoot(bassNote);
      this.bassNote = bassRoot.getValue();
    } else {
      this.bassNote = undefined;
    }
    return this;
  }

  /**
   * Set the position in text
   */
  setPosition(position: number): IChordBuilder {
    if (position < 0) {
      throw new Error('Position must be non-negative');
    }
    this.position = position;
    return this;
  }

  /**
   * Set the original notation
   */
  setOriginalNotation(notation: string): IChordBuilder {
    this.originalNotation = notation;
    return this;
  }

  /**
   * Set the Nashville number representation
   */
  setNashvilleNumber(number?: string): IChordBuilder {
    this.nashvilleNumber = number;
    return this;
  }

  /**
   * Build the chord object
   */
  build(): IChord {
    this.validateChord();
    
    return new Chord(
      this.root!,
      this.quality,
      [...this.extensions],
      this.bassNote,
      this.originalNotation,
      this.nashvilleNumber,
      this.position
    );
  }

  /**
   * Reset the builder to initial state
   */
  reset(): IChordBuilder {
    this.root = undefined;
    this.quality = ChordQuality.MAJOR;
    this.extensions = [];
    this.bassNote = undefined;
    this.originalNotation = '';
    this.nashvilleNumber = undefined;
    this.position = 0;
    return this;
  }

  /**
   * Create a copy of this builder
   */
  clone(): ChordBuilder {
    const clone = new ChordBuilder();
    clone.root = this.root;
    clone.quality = this.quality;
    clone.extensions = [...this.extensions];
    clone.bassNote = this.bassNote;
    clone.originalNotation = this.originalNotation;
    clone.nashvilleNumber = this.nashvilleNumber;
    clone.position = this.position;
    return clone;
  }

  /**
   * Set multiple properties at once
   */
  setProperties(properties: {
    root?: string;
    quality?: ChordQuality;
    extensions?: ChordExtension[];
    bassNote?: string;
    originalNotation?: string;
    nashvilleNumber?: string;
    position?: number;
  }): IChordBuilder {
    if (properties.root !== undefined) this.setRoot(properties.root);
    if (properties.quality !== undefined) this.setQuality(properties.quality);
    if (properties.extensions !== undefined) this.setExtensions(properties.extensions);
    if (properties.bassNote !== undefined) this.setBassNote(properties.bassNote);
    if (properties.originalNotation !== undefined) this.setOriginalNotation(properties.originalNotation);
    if (properties.nashvilleNumber !== undefined) this.setNashvilleNumber(properties.nashvilleNumber);
    if (properties.position !== undefined) this.setPosition(properties.position);
    return this;
  }

  /**
   * Build a major chord (convenience method)
   */
  buildMajor(root: string, originalNotation?: string): IChord {
    return this.reset()
      .setRoot(root)
      .setQuality(ChordQuality.MAJOR)
      .setOriginalNotation(originalNotation || root)
      .build();
  }

  /**
   * Build a minor chord (convenience method)
   */
  buildMinor(root: string, originalNotation?: string): IChord {
    return this.reset()
      .setRoot(root)
      .setQuality(ChordQuality.MINOR)
      .setOriginalNotation(originalNotation || `${root}m`)
      .build();
  }

  /**
   * Build a dominant 7th chord (convenience method)
   */
  buildDominant7(root: string, originalNotation?: string): IChord {
    return this.reset()
      .setRoot(root)
      .setQuality(ChordQuality.DOMINANT)
      .setOriginalNotation(originalNotation || `${root}7`)
      .build();
  }

  /**
   * Build a major 7th chord (convenience method)
   */
  buildMajor7(root: string, originalNotation?: string): IChord {
    return this.reset()
      .setRoot(root)
      .setQuality(ChordQuality.MAJOR)
      .addExtensionByValue('maj', 'maj7')
      .setOriginalNotation(originalNotation || `${root}maj7`)
      .build();
  }

  /**
   * Build a minor 7th chord (convenience method)
   */
  buildMinor7(root: string, originalNotation?: string): IChord {
    return this.reset()
      .setRoot(root)
      .setQuality(ChordQuality.MINOR)
      .addExtensionByValue('min', 'm7')
      .setOriginalNotation(originalNotation || `${root}m7`)
      .build();
  }

  /**
   * Build a suspended chord (convenience method)
   */
  buildSuspended(root: string, suspensionType: '2' | '4' = '4', originalNotation?: string): IChord {
    return this.reset()
      .setRoot(root)
      .setQuality(ChordQuality.SUSPENDED)
      .addExtensionByValue('sus', suspensionType)
      .setOriginalNotation(originalNotation || `${root}sus${suspensionType}`)
      .build();
  }

  private validateChord(): void {
    if (!this.root) {
      throw new Error('Chord must have a root note');
    }

    if (!this.originalNotation) {
      this.originalNotation = this.generateDefaultNotation();
    }

    // Validate extensions
    for (const extension of this.extensions) {
      if (!extension.type || !extension.value) {
        throw new Error('All extensions must have type and value');
      }
    }

    // Validate bass note if present
    if (this.bassNote && !ChordRoot.isValid(this.bassNote)) {
      throw new Error(`Invalid bass note: ${this.bassNote}`);
    }
  }

  private generateDefaultNotation(): string {
    let notation = this.root!;
    
    // Add quality
    switch (this.quality) {
      case ChordQuality.MINOR:
        notation += 'm';
        break;
      case ChordQuality.DIMINISHED:
        notation += 'dim';
        break;
      case ChordQuality.AUGMENTED:
        notation += 'aug';
        break;
      case ChordQuality.SUSPENDED:
        notation += 'sus';
        break;
      case ChordQuality.DOMINANT:
        notation += '7';
        break;
    }

    // Add extensions
    notation += this.extensions.map(ext => ext.value).join('');

    // Add bass note
    if (this.bassNote) {
      notation += `/${this.bassNote}`;
    }

    return notation;
  }
}
