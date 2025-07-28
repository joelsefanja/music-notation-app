/**
 * Unit tests for KeyTransposer
 * Tests key transposition logic and chord manipulation
 */

import { KeyTransposer } from '../../../services/conversion-engine/transposition/key-transposer';
import { ChordQuality } from '../../../types/interfaces/core-interfaces';

describe('KeyTransposer', () => {
  let keyTransposer: KeyTransposer;

  beforeEach(() => {
    keyTransposer = new KeyTransposer();
  });

  describe('transposeNote', () => {
    it('should transpose notes correctly with positive semitones', () => {
      expect(keyTransposer.transposeNote('C', 2)).toBe('D');
      expect(keyTransposer.transposeNote('G', 5)).toBe('C');
      expect(keyTransposer.transposeNote('A', 3)).toBe('C');
    });

    it('should transpose notes correctly with negative semitones', () => {
      expect(keyTransposer.transposeNote('D', -2)).toBe('C');
      expect(keyTransposer.transposeNote('C', -1)).toBe('B');
      expect(keyTransposer.transposeNote('F', -5)).toBe('C');
    });

    it('should handle octave wrapping', () => {
      expect(keyTransposer.transposeNote('B', 1)).toBe('C');
      expect(keyTransposer.transposeNote('C', -1)).toBe('B');
      expect(keyTransposer.transposeNote('A', 15)).toBe('C'); // 15 = 12 + 3
    });

    it('should prefer flats when target key uses flats', () => {
      expect(keyTransposer.transposeNote('C', 1, 'F')).toBe('Db');
      expect(keyTransposer.transposeNote('C', 3, 'Bb')).toBe('Eb');
    });

    it('should prefer sharps when target key uses sharps', () => {
      expect(keyTransposer.transposeNote('C', 1, 'G')).toBe('C#');
      expect(keyTransposer.transposeNote('C', 3, 'D')).toBe('D#');
    });

    it('should throw error for invalid note', () => {
      expect(() => {
        keyTransposer.transposeNote('X', 1);
      }).toThrow('Invalid chord root: X');
    });
  });

  describe('transposeChord', () => {
    it('should transpose chord root', () => {
      const chord = {
        root: 'C',
        quality: ChordQuality.MAJOR,
        extensions: [],
        bassNote: undefined,
        position: 0,
        originalNotation: 'C'
      };

      const transposed = keyTransposer.transposeChord(chord, 2);

      expect(transposed.root).toBe('D');
      expect(transposed.quality).toBe(ChordQuality.MAJOR);
      expect(transposed.originalNotation).toBe('D');
    });

    it('should transpose chord with bass note', () => {
      const chord = {
        root: 'C',
        quality: ChordQuality.MAJOR,
        extensions: [],
        bassNote: 'E',
        position: 0,
        originalNotation: 'C/E'
      };

      const transposed = keyTransposer.transposeChord(chord, 2);

      expect(transposed.root).toBe('D');
      expect(transposed.bassNote).toBe('F#');
      expect(transposed.originalNotation).toBe('D/F#');
    });

    it('should preserve chord quality and extensions', () => {
      const chord = {
        root: 'F',
        quality: ChordQuality.MINOR,
        extensions: [
          { type: 'dom' as const, value: '7', position: 0 },
          { type: 'add' as const, value: '9', position: 1 }
        ],
        bassNote: undefined,
        position: 5,
        originalNotation: 'Fm7add9'
      };

      const transposed = keyTransposer.transposeChord(chord, 4);

      expect(transposed.root).toBe('A');
      expect(transposed.quality).toBe(ChordQuality.MINOR);
      expect(transposed.extensions).toHaveLength(2);
      expect(transposed.extensions[0].value).toBe('7');
      expect(transposed.extensions[1].value).toBe('9');
      expect(transposed.position).toBe(5);
      expect(transposed.originalNotation).toBe('Am7add9');
    });

    it('should preserve Nashville number', () => {
      const chord = {
        root: 'C',
        quality: ChordQuality.MAJOR,
        extensions: [],
        bassNote: undefined,
        position: 0,
        originalNotation: 'C',
        nashvilleNumber: '1'
      };

      const transposed = keyTransposer.transposeChord(chord, 7);

      expect(transposed.root).toBe('G');
      expect(transposed.nashvilleNumber).toBe('1');
    });
  });

  describe('getKeyDistance', () => {
    it('should calculate correct distances for major keys', () => {
      expect(keyTransposer.getKeyDistance('C', 'D')).toBe(2);
      expect(keyTransposer.getKeyDistance('C', 'G')).toBe(7);
      expect(keyTransposer.getKeyDistance('G', 'C')).toBe(5);
      expect(keyTransposer.getKeyDistance('F', 'C')).toBe(7);
    });

    it('should calculate correct distances for minor keys', () => {
      expect(keyTransposer.getKeyDistance('Am', 'Dm')).toBe(5);
      expect(keyTransposer.getKeyDistance('Em', 'Am')).toBe(5);
      expect(keyTransposer.getKeyDistance('Cm', 'Fm')).toBe(5);
    });

    it('should handle mixed major/minor keys', () => {
      expect(keyTransposer.getKeyDistance('C', 'Am')).toBe(9);
      expect(keyTransposer.getKeyDistance('Am', 'C')).toBe(3);
    });

    it('should return 0 for same key', () => {
      expect(keyTransposer.getKeyDistance('C', 'C')).toBe(0);
      expect(keyTransposer.getKeyDistance('Am', 'Am')).toBe(0);
    });

    it('should throw error for invalid keys', () => {
      expect(() => {
        keyTransposer.getKeyDistance('X', 'C');
      }).toThrow('Invalid chord root: X');

      expect(() => {
        keyTransposer.getKeyDistance('C', 'Y');
      }).toThrow('Invalid chord root: Y');
    });
  });

  describe('transposeChords', () => {
    it('should transpose multiple chords', () => {
      const chords = [
        {
          root: 'C',
          quality: ChordQuality.MAJOR,
          extensions: [],
          bassNote: undefined,
          position: 0,
          originalNotation: 'C'
        },
        {
          root: 'F',
          quality: ChordQuality.MAJOR,
          extensions: [],
          bassNote: undefined,
          position: 1,
          originalNotation: 'F'
        },
        {
          root: 'G',
          quality: ChordQuality.MAJOR,
          extensions: [],
          bassNote: undefined,
          position: 2,
          originalNotation: 'G'
        }
      ];

      const transposed = keyTransposer.transposeChords(chords, 2);

      expect(transposed).toHaveLength(3);
      expect(transposed[0].root).toBe('D');
      expect(transposed[1].root).toBe('G');
      expect(transposed[2].root).toBe('A');
    });

    it('should return empty array for empty input', () => {
      const result = keyTransposer.transposeChords([], 5);
      expect(result).toEqual([]);
    });
  });

  describe('transposeToKey', () => {
    it('should transpose chords from one key to another', () => {
      const chords = [
        {
          root: 'C',
          quality: ChordQuality.MAJOR,
          extensions: [],
          bassNote: undefined,
          position: 0,
          originalNotation: 'C'
        },
        {
          root: 'A',
          quality: ChordQuality.MINOR,
          extensions: [],
          bassNote: undefined,
          position: 1,
          originalNotation: 'Am'
        }
      ];

      const transposed = keyTransposer.transposeToKey(chords, 'C', 'G');

      expect(transposed[0].root).toBe('G');
      expect(transposed[1].root).toBe('E');
    });
  });

  describe('getRelativeKey', () => {
    it('should get relative minor from major key', () => {
      expect(keyTransposer.getRelativeKey('C')).toBe('Am');
      expect(keyTransposer.getRelativeKey('G')).toBe('Em');
      expect(keyTransposer.getRelativeKey('F')).toBe('Dm');
    });

    it('should get relative major from minor key', () => {
      expect(keyTransposer.getRelativeKey('Am')).toBe('C');
      expect(keyTransposer.getRelativeKey('Em')).toBe('G');
      expect(keyTransposer.getRelativeKey('Dm')).toBe('F');
    });

    it('should handle sharp and flat keys', () => {
      expect(keyTransposer.getRelativeKey('D')).toBe('Bm');
      expect(keyTransposer.getRelativeKey('Bb')).toBe('Gm');
      expect(keyTransposer.getRelativeKey('F#m')).toBe('A');
    });
  });

  describe('getParallelKey', () => {
    it('should get parallel minor from major key', () => {
      expect(keyTransposer.getParallelKey('C')).toBe('Cm');
      expect(keyTransposer.getParallelKey('G')).toBe('Gm');
      expect(keyTransposer.getParallelKey('F#')).toBe('F#m');
    });

    it('should get parallel major from minor key', () => {
      expect(keyTransposer.getParallelKey('Am')).toBe('A');
      expect(keyTransposer.getParallelKey('Dm')).toBe('D');
      expect(keyTransposer.getParallelKey('F#m')).toBe('F#');
    });
  });

  describe('areKeysEnharmonic', () => {
    it('should identify enharmonic major keys', () => {
      expect(keyTransposer.areKeysEnharmonic('C#', 'Db')).toBe(true);
      expect(keyTransposer.areKeysEnharmonic('F#', 'Gb')).toBe(true);
      expect(keyTransposer.areKeysEnharmonic('A#', 'Bb')).toBe(true);
    });

    it('should identify enharmonic minor keys', () => {
      expect(keyTransposer.areKeysEnharmonic('C#m', 'Dbm')).toBe(true);
      expect(keyTransposer.areKeysEnharmonic('F#m', 'Gbm')).toBe(true);
    });

    it('should return false for non-enharmonic keys', () => {
      expect(keyTransposer.areKeysEnharmonic('C', 'D')).toBe(false);
      expect(keyTransposer.areKeysEnharmonic('Am', 'Bm')).toBe(false);
    });

    it('should return false for different modes', () => {
      expect(keyTransposer.areKeysEnharmonic('C', 'Cm')).toBe(false);
      expect(keyTransposer.areKeysEnharmonic('C#', 'Dbm')).toBe(false);
    });
  });

  describe('getKeySignature', () => {
    it('should return correct key signatures for major keys', () => {
      expect(keyTransposer.getKeySignature('C')).toEqual({
        sharps: 0,
        flats: 0,
        accidentals: []
      });

      expect(keyTransposer.getKeySignature('G')).toEqual({
        sharps: 1,
        flats: 0,
        accidentals: ['F#']
      });

      expect(keyTransposer.getKeySignature('F')).toEqual({
        sharps: 0,
        flats: 1,
        accidentals: ['Bb']
      });
    });

    it('should return correct key signatures for minor keys', () => {
      expect(keyTransposer.getKeySignature('Am')).toEqual({
        sharps: 0,
        flats: 0,
        accidentals: []
      });

      expect(keyTransposer.getKeySignature('Em')).toEqual({
        sharps: 1,
        flats: 0,
        accidentals: ['F#']
      });

      expect(keyTransposer.getKeySignature('Dm')).toEqual({
        sharps: 0,
        flats: 1,
        accidentals: ['Bb']
      });
    });
  });

  describe('getScaleDegrees', () => {
    it('should return correct scale degrees for major keys', () => {
      const cMajorScale = keyTransposer.getScaleDegrees('C');
      expect(cMajorScale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);

      const gMajorScale = keyTransposer.getScaleDegrees('G');
      expect(gMajorScale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    });

    it('should return correct scale degrees for minor keys', () => {
      const aMinorScale = keyTransposer.getScaleDegrees('Am');
      expect(aMinorScale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);

      const eMinorScale = keyTransposer.getScaleDegrees('Em');
      expect(eMinorScale).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
    });

    it('should prefer flats for flat keys', () => {
      const fMajorScale = keyTransposer.getScaleDegrees('F');
      expect(fMajorScale).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
    });
  });

  describe('getChordFunction', () => {
    it('should return correct Roman numerals for major key', () => {
      const cChord = {
        root: 'C',
        quality: ChordQuality.MAJOR,
        extensions: [],
        bassNote: undefined,
        position: 0,
        originalNotation: 'C'
      };

      expect(keyTransposer.getChordFunction(cChord, 'C')).toBe('I');
      expect(keyTransposer.getChordFunction(cChord, 'F')).toBe('V');
    });

    it('should return correct Roman numerals for minor key', () => {
      const aChord = {
        root: 'A',
        quality: ChordQuality.MINOR,
        extensions: [],
        bassNote: undefined,
        position: 0,
        originalNotation: 'Am'
      };

      expect(keyTransposer.getChordFunction(aChord, 'Am')).toBe('i');
    });

    it('should return N/A for chords not in key', () => {
      const fSharpChord = {
        root: 'F#',
        quality: ChordQuality.MAJOR,
        extensions: [],
        bassNote: undefined,
        position: 0,
        originalNotation: 'F#'
      };

      expect(keyTransposer.getChordFunction(fSharpChord, 'C')).toBe('N/A');
    });
  });

  describe('suggestBestEnharmonicSpelling', () => {
    it('should prefer keys with fewer accidentals', () => {
      expect(keyTransposer.suggestBestEnharmonicSpelling('C#')).toBe('Db');
      // F# and Gb both have 6 accidentals, so original should be returned
      expect(keyTransposer.suggestBestEnharmonicSpelling('F#')).toBe('F#');
    });

    it('should return original key when no better option exists', () => {
      expect(keyTransposer.suggestBestEnharmonicSpelling('C')).toBe('C');
      expect(keyTransposer.suggestBestEnharmonicSpelling('G')).toBe('G');
    });
  });

  describe('getCommonProgressions', () => {
    it('should return common progressions for major keys', () => {
      const progressions = keyTransposer.getCommonProgressions('C');
      
      expect(progressions).toContainEqual({
        name: 'I-V-vi-IV',
        chords: ['C', 'G', 'Am', 'F']
      });

      expect(progressions).toContainEqual({
        name: 'ii-V-I',
        chords: ['Dm', 'G', 'C']
      });
    });

    it('should return common progressions for minor keys', () => {
      const progressions = keyTransposer.getCommonProgressions('Am');
      
      expect(progressions).toContainEqual({
        name: 'i-VI-VII',
        chords: ['Am', 'F', 'G']
      });

      expect(progressions).toContainEqual({
        name: 'i-iv-V',
        chords: ['Am', 'Dm', 'E']
      });
    });
  });

  describe('error handling', () => {
    it('should handle invalid chord roots gracefully', () => {
      expect(() => {
        keyTransposer.transposeNote('X', 1);
      }).toThrow();
    });

    it('should handle invalid keys in getKeyDistance', () => {
      expect(() => {
        keyTransposer.getKeyDistance('Invalid', 'C');
      }).toThrow();
    });
  });
});