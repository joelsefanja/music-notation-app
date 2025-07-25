import { Chord } from '../types';
import { NASHVILLE_MAJOR_MAPPINGS, NASHVILLE_MINOR_MAPPINGS, MAJOR_KEY_SIGNATURES, MINOR_KEY_SIGNATURES } from '../constants/chord-mappings';
import { ChordParser } from './chord-parser';

/**
 * Utility class for converting between standard chord notation and Nashville Number System
 */
export class NashvilleConverter {
  /**
   * Convert a chord to Nashville Number System notation
   * @param chord - Chord object to convert
   * @param key - Key signature for the conversion
   * @returns Nashville number representation
   */
  static chordToNashville(chord: Chord, key: string): string {
    const isMinorKey = key.endsWith('m');
    const mappings = isMinorKey ? NASHVILLE_MINOR_MAPPINGS[key] : NASHVILLE_MAJOR_MAPPINGS[key];
    
    if (!mappings) {
      throw new Error(`Unsupported key: ${key}`);
    }

    // Get the Nashville number for the root note
    let nashvilleNumber = mappings[chord.root];
    
    if (!nashvilleNumber) {
      // Handle chromatic chords (not in key)
      nashvilleNumber = this.getChromaticNashvilleNumber(chord.root, key);
    }

    // Apply chord quality modifications
    nashvilleNumber = this.applyQualityToNashville(nashvilleNumber, chord.quality, isMinorKey);
    
    // Add extensions
    if (chord.extensions.length > 0) {
      nashvilleNumber += chord.extensions.join('');
    }
    
    // Handle slash chords
    if (chord.bassNote) {
      const bassNashville = mappings[chord.bassNote] || this.getChromaticNashvilleNumber(chord.bassNote, key);
      nashvilleNumber += `/${bassNashville}`;
    }
    
    return nashvilleNumber;
  }

  /**
   * Convert Nashville number back to chord notation
   * @param nashvilleNumber - Nashville number string
   * @param key - Key signature for the conversion
   * @returns Chord object
   */
  static nashvilleToChord(nashvilleNumber: string, key: string): Chord {
    const isMinorKey = key.endsWith('m');
    const keySignature = isMinorKey ? MINOR_KEY_SIGNATURES[key] : MAJOR_KEY_SIGNATURES[key];
    
    if (!keySignature) {
      throw new Error(`Unsupported key: ${key}`);
    }

    // Parse slash chord if present
    const [mainPart, bassPart] = nashvilleNumber.split('/');
    
    // Parse the main Nashville number
    const { number, quality, extensions } = this.parseNashvilleNumber(mainPart);
    
    // Convert number to note
    const root = this.nashvilleNumberToNote(number, keySignature, isMinorKey);
    
    // Handle bass note if present
    let bassNote: string | undefined;
    if (bassPart) {
      const bassNumber = this.parseNashvilleNumber(bassPart).number;
      bassNote = this.nashvilleNumberToNote(bassNumber, keySignature, isMinorKey);
    }
    
    return {
      root,
      quality,
      extensions,
      bassNote,
      position: 0
    };
  }

  /**
   * Get Nashville number for chromatic (out-of-key) chords
   * @param note - Note to convert
   * @param key - Key signature
   * @returns Nashville number with accidentals
   */
  private static getChromaticNashvilleNumber(note: string, key: string): string {
    const isMinorKey = key.endsWith('m');
    const keySignature = isMinorKey ? MINOR_KEY_SIGNATURES[key] : MAJOR_KEY_SIGNATURES[key];
    
    if (!keySignature) {
      throw new Error(`Unsupported key: ${key}`);
    }

    // Find the closest diatonic note and calculate the accidental
    const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = chromaticNotes.indexOf(note);
    
    if (noteIndex === -1) {
      throw new Error(`Invalid note: ${note}`);
    }

    // Find the closest scale degree
    for (let i = 0; i < keySignature.length; i++) {
      const scaleNote = keySignature[i];
      const scaleIndex = chromaticNotes.indexOf(scaleNote);
      
      if (scaleIndex === noteIndex) {
        return (i + 1).toString();
      }
      
      // Check for sharp/flat relationships
      const nextScaleIndex = (scaleIndex + 1) % 12;
      const prevScaleIndex = (scaleIndex - 1 + 12) % 12;
      
      if (nextScaleIndex === noteIndex) {
        return `#${i + 1}`;
      }
      
      if (prevScaleIndex === noteIndex) {
        return `b${i + 1}`;
      }
    }
    
    return '?'; // Fallback for complex chromatic relationships
  }

  /**
   * Apply chord quality to Nashville number
   * @param nashvilleNumber - Base Nashville number
   * @param quality - Chord quality
   * @param isMinorKey - Whether the key is minor
   * @returns Modified Nashville number
   */
  private static applyQualityToNashville(nashvilleNumber: string, quality: string, isMinorKey: boolean): string {
    // Remove existing quality indicators
    let cleanNumber = nashvilleNumber.replace(/[m°+]/g, '');
    
    switch (quality) {
      case 'maj':
        return cleanNumber; // Major chords don't need additional notation
      case 'min':
        return cleanNumber + 'm';
      case 'dim':
        return cleanNumber + '°';
      case 'aug':
        return cleanNumber + '+';
      case 'sus4':
      case 'sus2':
        return cleanNumber + quality;
      default:
        return cleanNumber;
    }
  }

  /**
   * Parse a Nashville number string into components
   * @param nashvilleString - Nashville number to parse
   * @returns Object with number, quality, and extensions
   */
  private static parseNashvilleNumber(nashvilleString: string): { number: string; quality: string; extensions: string[] } {
    let remaining = nashvilleString.trim();
    let number = '';
    let quality = 'maj';
    const extensions: string[] = [];

    // Extract accidentals and number first
    const numberMatch = remaining.match(/^([#b]?\d+)/);
    if (numberMatch) {
      number = numberMatch[1];
      remaining = remaining.substring(number.length);
      
      // Check for quality indicators that are NOT part of extensions
      // Be careful not to consume 'm' from 'maj7'
      if (remaining.startsWith('m') && !remaining.startsWith('maj')) {
        quality = 'min';
        remaining = remaining.substring(1);
      } else if (remaining.startsWith('°')) {
        quality = 'dim';
        remaining = remaining.substring(1);
      } else if (remaining.startsWith('+')) {
        quality = 'aug';
        remaining = remaining.substring(1);
      }
    }

    // Extract additional quality indicators
    if (remaining.startsWith('sus')) {
      if (remaining.startsWith('sus4')) {
        quality = 'sus4';
        remaining = remaining.substring(4);
      } else if (remaining.startsWith('sus2')) {
        quality = 'sus2';
        remaining = remaining.substring(4);
      } else {
        quality = 'sus4';
        remaining = remaining.substring(3);
      }
    }

    // Extract extensions (remaining string)
    if (remaining.length > 0) {
      // The remaining string should be the extension as-is
      extensions.push(remaining);
    }

    return { number, quality, extensions };
  }

  /**
   * Convert Nashville number to actual note
   * @param nashvilleNumber - Nashville number (e.g., "1", "#4", "b7", "b3")
   * @param keySignature - Array of notes in the key
   * @param isMinorKey - Whether the key is minor
   * @returns Actual note name
   */
  private static nashvilleNumberToNote(nashvilleNumber: string, keySignature: string[], isMinorKey: boolean): string {
    // Handle special minor key cases first
    if (isMinorKey) {
      if (nashvilleNumber === 'b3') {
        return keySignature[2]; // Third degree of minor key
      }
      if (nashvilleNumber === 'b6') {
        return keySignature[5]; // Sixth degree of minor key
      }
      if (nashvilleNumber === 'b7') {
        return keySignature[6]; // Seventh degree of minor key
      }
    }

    // Parse accidentals and degree
    const match = nashvilleNumber.match(/^([#b]?)(\d+)/);
    if (!match) {
      throw new Error(`Invalid Nashville number: ${nashvilleNumber}`);
    }

    const [, accidental, degreeStr] = match;
    const degree = parseInt(degreeStr, 10);
    
    if (degree < 1 || degree > 7) {
      throw new Error(`Invalid scale degree: ${degree}`);
    }

    // Get the base note from the key signature
    const baseNote = keySignature[degree - 1];
    
    if (!accidental) {
      return baseNote;
    }

    // Apply accidental
    const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseIndex = chromaticNotes.indexOf(baseNote);
    
    if (baseIndex === -1) {
      throw new Error(`Invalid base note: ${baseNote}`);
    }

    let newIndex = baseIndex;
    if (accidental === '#') {
      newIndex = (baseIndex + 1) % 12;
    } else if (accidental === 'b') {
      newIndex = (baseIndex - 1 + 12) % 12;
    }

    return chromaticNotes[newIndex];
  }

  /**
   * Convert an array of chords to Nashville notation
   * @param chords - Array of chords to convert
   * @param key - Key signature
   * @returns Array of Nashville number strings
   */
  static chordsToNashville(chords: Chord[], key: string): string[] {
    return chords.map(chord => this.chordToNashville(chord, key));
  }

  /**
   * Convert an array of Nashville numbers to chords
   * @param nashvilleNumbers - Array of Nashville numbers
   * @param key - Key signature
   * @returns Array of Chord objects
   */
  static nashvilleToChords(nashvilleNumbers: string[], key: string): Chord[] {
    return nashvilleNumbers.map(number => this.nashvilleToChord(number, key));
  }

  /**
   * Check if a key is supported for Nashville conversion
   * @param key - Key to check
   * @returns True if key is supported
   */
  static isSupportedKey(key: string): boolean {
    const isMinorKey = key.endsWith('m');
    const mappings = isMinorKey ? NASHVILLE_MINOR_MAPPINGS : NASHVILLE_MAJOR_MAPPINGS;
    return key in mappings;
  }
}