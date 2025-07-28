/**
 * Domain-specific value object for Nashville numbers with proper validation
 * Follows Domain-Driven Design principles
 */

/**
 * Nashville number value object that ensures valid scale degrees
 */
export class NashvilleNumber {
  private static readonly MIN_NUMBER = 1;
  private static readonly MAX_NUMBER = 7;
  private static readonly ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  private static readonly ROMAN_NUMERALS_MINOR = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

  private readonly value: number;

  constructor(value: number) {
    this.value = value;
    this.validate();
  }

  private validate(): void {
    if (!Number.isInteger(this.value)) {
      throw new Error(`Nashville number must be an integer, got: ${this.value}`);
    }

    if (this.value < NashvilleNumber.MIN_NUMBER || this.value > NashvilleNumber.MAX_NUMBER) {
      throw new Error(
        `Nashville number must be between ${NashvilleNumber.MIN_NUMBER} and ${NashvilleNumber.MAX_NUMBER}, got: ${this.value}`
      );
    }
  }

  /**
   * Get the numeric value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Convert to Roman numeral representation
   */
  toRomanNumeral(isMinor = false): string {
    const numerals = isMinor ? NashvilleNumber.ROMAN_NUMERALS_MINOR : NashvilleNumber.ROMAN_NUMERALS;
    return numerals[this.value - 1];
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return this.value.toString();
  }

  /**
   * Check equality with another NashvilleNumber
   */
  equals(other: NashvilleNumber): boolean {
    return this.value === other.value;
  }

  /**
   * Check if this is a tonic (1)
   */
  isTonic(): boolean {
    return this.value === 1;
  }

  /**
   * Check if this is a subdominant (4)
   */
  isSubdominant(): boolean {
    return this.value === 4;
  }

  /**
   * Check if this is a dominant (5)
   */
  isDominant(): boolean {
    return this.value === 5;
  }

  /**
   * Get the scale degree name
   */
  getScaleDegreeName(): string {
    const names = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading Tone'];
    return names[this.value - 1];
  }

  /**
   * Get the function in major key context
   */
  getFunctionInMajor(): 'tonic' | 'subdominant' | 'dominant' | 'predominant' | 'mediant' {
    switch (this.value) {
      case 1:
      case 3:
      case 6:
        return 'tonic';
      case 2:
      case 4:
        return 'subdominant';
      case 5:
      case 7:
        return 'dominant';
      default:
        return 'mediant';
    }
  }

  /**
   * Get the function in minor key context
   */
  getFunctionInMinor(): 'tonic' | 'subdominant' | 'dominant' | 'predominant' | 'mediant' {
    switch (this.value) {
      case 1:
      case 3:
      case 6:
        return 'tonic';
      case 2:
      case 4:
        return 'subdominant';
      case 5:
      case 7:
        return 'dominant';
      default:
        return 'mediant';
    }
  }

  /**
   * Get the relative position to another Nashville number
   */
  getIntervalTo(other: NashvilleNumber): number {
    let interval = other.value - this.value;
    if (interval < 0) {
      interval += 7;
    }
    return interval;
  }

  /**
   * Transpose by a given interval (in scale degrees)
   */
  transpose(interval: number): NashvilleNumber {
    let newValue = ((this.value - 1 + interval) % 7) + 1;
    if (newValue <= 0) {
      newValue += 7;
    }
    return new NashvilleNumber(newValue);
  }

  /**
   * Create from Roman numeral
   */
  static fromRomanNumeral(roman: string): NashvilleNumber {
    const upperRoman = roman.toUpperCase();
    const index = NashvilleNumber.ROMAN_NUMERALS.indexOf(upperRoman);
    
    if (index === -1) {
      throw new Error(`Invalid Roman numeral: ${roman}`);
    }
    
    return new NashvilleNumber(index + 1);
  }

  /**
   * Create from string representation
   */
  static fromString(str: string): NashvilleNumber {
    const num = parseInt(str, 10);
    if (isNaN(num)) {
      throw new Error(`Cannot parse Nashville number from string: ${str}`);
    }
    return new NashvilleNumber(num);
  }

  /**
   * Check if a number is a valid Nashville number
   */
  static isValid(value: number): boolean {
    return Number.isInteger(value) && 
           value >= NashvilleNumber.MIN_NUMBER && 
           value <= NashvilleNumber.MAX_NUMBER;
  }

  /**
   * Check if a string represents a valid Nashville number
   */
  static isValidString(str: string): boolean {
    // Check if string is exactly a valid integer (no decimals, no extra characters)
    if (!/^\d+$/.test(str)) {
      return false;
    }
    const num = parseInt(str, 10);
    return !isNaN(num) && NashvilleNumber.isValid(num);
  }

  /**
   * Get all valid Nashville numbers
   */
  static getAllValidNumbers(): number[] {
    return Array.from({ length: 7 }, (_, i) => i + 1);
  }

  /**
   * Get the typical chord quality for this scale degree in major key
   */
  getTypicalQualityInMajor(): 'major' | 'minor' | 'diminished' {
    switch (this.value) {
      case 1:
      case 4:
      case 5:
        return 'major';
      case 2:
      case 3:
      case 6:
        return 'minor';
      case 7:
        return 'diminished';
      default:
        return 'major';
    }
  }

  /**
   * Get the typical chord quality for this scale degree in minor key
   */
  getTypicalQualityInMinor(): 'major' | 'minor' | 'diminished' | 'augmented' {
    switch (this.value) {
      case 1:
      case 4:
        return 'minor';
      case 2:
      case 7:
        return 'diminished';
      case 3:
      case 6:
        return 'major';
      case 5:
        return 'major'; // Often major in minor keys (dominant)
      default:
        return 'minor';
    }
  }
}