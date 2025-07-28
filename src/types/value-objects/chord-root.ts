/**
 * Domain-specific value object for chord roots with proper validation
 * Follows Domain-Driven Design principles
 * 
 * @example
 * ```typescript
 * const root = new ChordRoot('C#');
 * console.log(root.isSharp()); // true
 * console.log(root.transpose(2).getValue()); // 'D#'
 * ```
 * 
 * @since 2.0.0
 * @author SOLID Refactoring Team
 */

/**
 * Chord root value object that ensures valid chord root notes.
 * 
 * This class implements the Value Object pattern from Domain-Driven Design,
 * ensuring that chord roots are always valid and providing useful operations
 * for musical analysis and transposition.
 * 
 * @class ChordRoot
 * @implements {ValueObject}
 * 
 * @example Basic usage
 * ```typescript
 * const root = new ChordRoot('F#');
 * console.log(root.getValue()); // 'F#'
 * console.log(root.isSharp()); // true
 * ```
 * 
 * @example Transposition
 * ```typescript
 * const cRoot = new ChordRoot('C');
 * const dRoot = cRoot.transpose(2);
 * console.log(dRoot.getValue()); // 'D'
 * ```
 * 
 * @example Enharmonic equivalents
 * ```typescript
 * const cSharp = new ChordRoot('C#');
 * const dFlat = cSharp.getEnharmonicEquivalent();
 * console.log(dFlat?.getValue()); // 'Db'
 * ```
 */
export class ChordRoot {
  private static readonly VALID_ROOTS = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
  ];

  private readonly value: string;

  constructor(value: string) {
    this.value = this.normalize(value);
    this.validate();
  }

  private normalize(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new Error('Chord root must be a non-empty string');
    }
    return value.trim();
  }

  private validate(): void {
    if (!ChordRoot.VALID_ROOTS.includes(this.value)) {
      throw new Error(`Invalid chord root: ${this.value}. Must be one of: ${ChordRoot.VALID_ROOTS.join(', ')}`);
    }
  }

  /**
   * Get the string representation of the chord root
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get the raw value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check equality with another ChordRoot
   */
  equals(other: ChordRoot): boolean {
    return this.value === other.value;
  }

  /**
   * Check if this is a sharp note
   */
  isSharp(): boolean {
    return this.value.includes('#');
  }

  /**
   * Check if this is a flat note
   */
  isFlat(): boolean {
    return this.value.includes('b');
  }

  /**
   * Check if this is a natural note (no accidentals)
   */
  isNatural(): boolean {
    return !this.isSharp() && !this.isFlat();
  }

  /**
   * Get the enharmonic equivalent (if applicable)
   */
  getEnharmonicEquivalent(): ChordRoot | null {
    const enharmonicMap: Record<string, string> = {
      'C#': 'Db',
      'Db': 'C#',
      'D#': 'Eb',
      'Eb': 'D#',
      'F#': 'Gb',
      'Gb': 'F#',
      'G#': 'Ab',
      'Ab': 'G#',
      'A#': 'Bb',
      'Bb': 'A#'
    };

    const equivalent = enharmonicMap[this.value];
    return equivalent ? new ChordRoot(equivalent) : null;
  }

  /**
   * Get the chromatic index (0-11) of this chord root
   */
  getChromaticIndex(): number {
    const chromaticMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    return chromaticMap[this.value];
  }

  /**
   * Create a ChordRoot from a chromatic index
   */
  static fromChromaticIndex(index: number, preferFlats = false): ChordRoot {
    if (index < 0 || index > 11) {
      throw new Error(`Chromatic index must be between 0 and 11, got: ${index}`);
    }

    const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    const notes = preferFlats ? flatNotes : sharpNotes;
    return new ChordRoot(notes[index]);
  }

  /**
   * Transpose this chord root by a number of semitones
   */
  transpose(semitones: number, preferFlats = false): ChordRoot {
    const currentIndex = this.getChromaticIndex();
    let newIndex = (currentIndex + semitones) % 12;
    if (newIndex < 0) {
      newIndex += 12;
    }
    return ChordRoot.fromChromaticIndex(newIndex, preferFlats);
  }

  /**
   * Check if a string is a valid chord root
   */
  static isValid(value: string): boolean {
    try {
      new ChordRoot(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all valid chord roots
   */
  static getAllValidRoots(): string[] {
    return [...ChordRoot.VALID_ROOTS];
  }
}