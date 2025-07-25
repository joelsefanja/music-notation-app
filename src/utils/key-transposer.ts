import { Chord } from '../types';
import { CHROMATIC_NOTES, MAJOR_KEY_SIGNATURES, MINOR_KEY_SIGNATURES } from '../constants/chord-mappings';
import { ChordParser } from './chord-parser';

/**
 * Utility class for transposing chords and keys
 */
export class KeyTransposer {
  /**
   * Transpose a chord by a given number of semitones
   * @param chord - Chord object to transpose
   * @param semitones - Number of semitones to transpose (positive = up, negative = down)
   * @param targetKey - Optional target key to determine sharp/flat preference
   * @returns New transposed Chord object
   */
  static transposeChord(chord: Chord, semitones: number, targetKey?: string): Chord {
    const transposedRoot = this.transposeNote(chord.root, semitones, targetKey);
    const transposedBassNote = chord.bassNote 
      ? this.transposeNote(chord.bassNote, semitones, targetKey)
      : undefined;

    return {
      ...chord,
      root: transposedRoot,
      bassNote: transposedBassNote
    };
  }

  /**
   * Transpose a single note by a given number of semitones
   * @param note - Note to transpose (e.g., 'C', 'F#', 'Bb')
   * @param semitones - Number of semitones to transpose
   * @param targetKey - Optional target key to determine sharp/flat preference
   * @returns Transposed note
   */
  static transposeNote(note: string, semitones: number, targetKey?: string): string {
    const noteIndex = this.getNoteIndex(note);
    if (noteIndex === -1) {
      throw new Error(`Invalid note: ${note}`);
    }

    // Calculate new index with proper wrapping
    let newIndex = (noteIndex + semitones) % 12;
    if (newIndex < 0) {
      newIndex += 12;
    }

    // Determine whether to use sharps or flats based on target key
    const useFlats = this.shouldUseFlats(targetKey);
    const chromaticScale = useFlats ? 
      ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] :
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    return chromaticScale[newIndex];
  }

  /**
   * Get the chromatic index of a note (0-11)
   * @param note - Note to get index for
   * @returns Index in chromatic scale, or -1 if invalid
   */
  private static getNoteIndex(note: string): number {
    // Handle both sharp and flat representations
    const sharpIndex = CHROMATIC_NOTES.indexOf(note);
    if (sharpIndex !== -1) return sharpIndex;

    const flatIndex = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf(note);
    return flatIndex;
  }

  /**
   * Determine if flats should be used based on target key
   * @param targetKey - Target key signature
   * @returns True if flats should be used
   */
  private static shouldUseFlats(targetKey?: string): boolean {
    if (!targetKey) return false;
    
    // Keys that typically use flats
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];
    return flatKeys.includes(targetKey);
  }

  /**
   * Calculate semitone difference between two keys
   * @param fromKey - Source key
   * @param toKey - Target key
   * @returns Number of semitones difference
   */
  static getKeyDistance(fromKey: string, toKey: string): number {
    const fromRoot = this.getKeyRoot(fromKey);
    const toRoot = this.getKeyRoot(toKey);
    
    const fromIndex = this.getNoteIndex(fromRoot);
    const toIndex = this.getNoteIndex(toRoot);
    
    if (fromIndex === -1 || toIndex === -1) {
      throw new Error(`Invalid key: ${fromKey} or ${toKey}`);
    }

    let distance = toIndex - fromIndex;
    if (distance < 0) {
      distance += 12;
    }
    
    return distance;
  }

  /**
   * Extract the root note from a key signature
   * @param key - Key signature (e.g., 'C', 'Am', 'F#', 'Bbm')
   * @returns Root note
   */
  private static getKeyRoot(key: string): string {
    // Remove 'm' for minor keys
    return key.replace(/m$/, '');
  }

  /**
   * Transpose an array of chords
   * @param chords - Array of chords to transpose
   * @param semitones - Number of semitones to transpose
   * @param targetKey - Optional target key for sharp/flat preference
   * @returns Array of transposed chords
   */
  static transposeChords(chords: Chord[], semitones: number, targetKey?: string): Chord[] {
    return chords.map(chord => this.transposeChord(chord, semitones, targetKey));
  }

  /**
   * Transpose from one key to another
   * @param chords - Array of chords to transpose
   * @param fromKey - Source key
   * @param toKey - Target key
   * @returns Array of transposed chords
   */
  static transposeToKey(chords: Chord[], fromKey: string, toKey: string): Chord[] {
    const semitones = this.getKeyDistance(fromKey, toKey);
    return this.transposeChords(chords, semitones, toKey);
  }

  /**
   * Get all chords in a given key
   * @param key - Key signature
   * @param includeSevenths - Whether to include seventh chords
   * @returns Array of chords in the key
   */
  static getChordsInKey(key: string, includeSevenths: boolean = false): string[] {
    const isMinor = key.endsWith('m');
    const keySignature = isMinor ? MINOR_KEY_SIGNATURES[key] : MAJOR_KEY_SIGNATURES[key];
    
    if (!keySignature) {
      throw new Error(`Unknown key: ${key}`);
    }

    const chords: string[] = [];
    
    if (isMinor) {
      // Minor key chord progression: i, ii°, III, iv, v, VI, VII
      const qualities = ['m', '°', '', 'm', 'm', '', ''];
      keySignature.forEach((note, index) => {
        chords.push(note + qualities[index]);
        if (includeSevenths) {
          if (index === 1) {
            chords.push(note + 'ø7'); // Half-diminished seventh
          } else if (qualities[index] === 'm') {
            chords.push(note + 'm7');
          } else {
            chords.push(note + '7');
          }
        }
      });
    } else {
      // Major key chord progression: I, ii, iii, IV, V, vi, vii°
      const qualities = ['', 'm', 'm', '', '', 'm', '°'];
      keySignature.forEach((note, index) => {
        chords.push(note + qualities[index]);
        if (includeSevenths) {
          if (index === 6) {
            chords.push(note + 'ø7'); // Half-diminished seventh
          } else if (index === 0 || index === 3) {
            chords.push(note + 'maj7'); // Major seventh for I and IV
          } else if (qualities[index] === 'm') {
            chords.push(note + 'm7');
          } else {
            chords.push(note + '7');
          }
        }
      });
    }

    return chords;
  }

  /**
   * Determine if a chord belongs to a given key
   * @param chord - Chord to check
   * @param key - Key signature
   * @returns True if chord is diatonic to the key
   */
  static isChordInKey(chord: Chord, key: string): boolean {
    const chordsInKey = this.getChordsInKey(key, true);
    const chordString = ChordParser.chordToString(chord);
    
    return chordsInKey.some(keyChord => {
      // Exact string comparison
      if (keyChord === chordString) {
        return true;
      }
      
      // Check if the chord matches the base chord (without extensions)
      const baseChord = chord.root + (chord.quality === 'maj' ? '' : (chord.quality === 'min' ? 'm' : chord.quality));
      
      // Only match if the chord quality is exactly the same as expected in the key
      return keyChord === baseChord;
    });
  }
}