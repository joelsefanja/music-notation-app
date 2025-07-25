import { KeyTransposer } from '../key-transposer';
import { Chord } from '../../types';

describe('KeyTransposer', () => {
  describe('transposeNote', () => {
    it('should transpose notes up by semitones', () => {
      expect(KeyTransposer.transposeNote('C', 1)).toBe('C#');
      expect(KeyTransposer.transposeNote('C', 2)).toBe('D');
      expect(KeyTransposer.transposeNote('C', 12)).toBe('C');
      expect(KeyTransposer.transposeNote('F', 1)).toBe('F#');
    });

    it('should transpose notes down by semitones', () => {
      expect(KeyTransposer.transposeNote('C', -1)).toBe('B');
      expect(KeyTransposer.transposeNote('D', -2)).toBe('C');
      expect(KeyTransposer.transposeNote('F', -1)).toBe('E');
    });

    it('should handle sharp and flat notes', () => {
      expect(KeyTransposer.transposeNote('F#', 1)).toBe('G');
      expect(KeyTransposer.transposeNote('Bb', 1)).toBe('B');
      expect(KeyTransposer.transposeNote('C#', -1)).toBe('C');
    });

    it('should use flats for flat keys', () => {
      expect(KeyTransposer.transposeNote('C', 1, 'F')).toBe('Db');
      expect(KeyTransposer.transposeNote('D', 1, 'Bb')).toBe('Eb');
    });

    it('should use sharps for sharp keys', () => {
      expect(KeyTransposer.transposeNote('C', 1, 'G')).toBe('C#');
      expect(KeyTransposer.transposeNote('D', 1, 'A')).toBe('D#');
    });

    it('should throw error for invalid notes', () => {
      expect(() => KeyTransposer.transposeNote('H', 1)).toThrow('Invalid note');
      expect(() => KeyTransposer.transposeNote('', 1)).toThrow('Invalid note');
    });
  });

  describe('transposeChord', () => {
    it('should transpose basic chords', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        position: 0
      };

      const transposed = KeyTransposer.transposeChord(chord, 2);
      expect(transposed.root).toBe('D');
      expect(transposed.quality).toBe('maj');
      expect(transposed.extensions).toEqual([]);
    });

    it('should transpose chords with extensions', () => {
      const chord: Chord = {
        root: 'A',
        quality: 'min',
        extensions: ['7'],
        position: 0
      };

      const transposed = KeyTransposer.transposeChord(chord, 3);
      expect(transposed.root).toBe('C');
      expect(transposed.quality).toBe('min');
      expect(transposed.extensions).toEqual(['7']);
    });

    it('should transpose slash chords', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        bassNote: 'E',
        position: 0
      };

      const transposed = KeyTransposer.transposeChord(chord, 2);
      expect(transposed.root).toBe('D');
      expect(transposed.bassNote).toBe('F#');
    });

    it('should preserve chord position', () => {
      const chord: Chord = {
        root: 'F',
        quality: 'maj',
        extensions: [],
        position: 10
      };

      const transposed = KeyTransposer.transposeChord(chord, 1);
      expect(transposed.position).toBe(10);
    });
  });

  describe('getKeyDistance', () => {
    it('should calculate distance between major keys', () => {
      expect(KeyTransposer.getKeyDistance('C', 'D')).toBe(2);
      expect(KeyTransposer.getKeyDistance('C', 'G')).toBe(7);
      expect(KeyTransposer.getKeyDistance('G', 'C')).toBe(5);
    });

    it('should calculate distance between minor keys', () => {
      expect(KeyTransposer.getKeyDistance('Am', 'Bm')).toBe(2);
      expect(KeyTransposer.getKeyDistance('Am', 'Em')).toBe(7);
    });

    it('should calculate distance between major and minor keys', () => {
      expect(KeyTransposer.getKeyDistance('C', 'Am')).toBe(9);
      expect(KeyTransposer.getKeyDistance('Am', 'C')).toBe(3);
    });

    it('should handle sharp and flat keys', () => {
      expect(KeyTransposer.getKeyDistance('C', 'F#')).toBe(6);
      expect(KeyTransposer.getKeyDistance('C', 'Bb')).toBe(10);
    });

    it('should throw error for invalid keys', () => {
      expect(() => KeyTransposer.getKeyDistance('Invalid', 'C')).toThrow('Invalid key');
      expect(() => KeyTransposer.getKeyDistance('C', 'Invalid')).toThrow('Invalid key');
    });
  });

  describe('transposeChords', () => {
    it('should transpose array of chords', () => {
      const chords: Chord[] = [
        { root: 'C', quality: 'maj', extensions: [], position: 0 },
        { root: 'A', quality: 'min', extensions: [], position: 5 },
        { root: 'F', quality: 'maj', extensions: [], position: 10 }
      ];

      const transposed = KeyTransposer.transposeChords(chords, 2);
      expect(transposed).toHaveLength(3);
      expect(transposed[0].root).toBe('D');
      expect(transposed[1].root).toBe('B');
      expect(transposed[2].root).toBe('G');
    });
  });

  describe('transposeToKey', () => {
    it('should transpose chords from one key to another', () => {
      const chords: Chord[] = [
        { root: 'C', quality: 'maj', extensions: [], position: 0 },
        { root: 'A', quality: 'min', extensions: [], position: 5 }
      ];

      const transposed = KeyTransposer.transposeToKey(chords, 'C', 'D');
      expect(transposed[0].root).toBe('D');
      expect(transposed[1].root).toBe('B');
    });
  });

  describe('getChordsInKey', () => {
    it('should return chords in major key', () => {
      const chords = KeyTransposer.getChordsInKey('C');
      expect(chords).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    });

    it('should return chords in minor key', () => {
      const chords = KeyTransposer.getChordsInKey('Am');
      expect(chords).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G']);
    });

    it('should include seventh chords when requested', () => {
      const chords = KeyTransposer.getChordsInKey('C', true);
      expect(chords).toContain('Cmaj7');
      expect(chords).toContain('Dm7');
      expect(chords).toContain('G7');
    });

    it('should handle sharp keys', () => {
      const chords = KeyTransposer.getChordsInKey('G');
      expect(chords).toContain('G');
      expect(chords).toContain('Am');
      expect(chords).toContain('F#°');
    });

    it('should handle flat keys', () => {
      const chords = KeyTransposer.getChordsInKey('F');
      expect(chords).toContain('F');
      expect(chords).toContain('Bb');
      expect(chords).toContain('E°');
    });

    it('should throw error for unknown keys', () => {
      expect(() => KeyTransposer.getChordsInKey('Invalid')).toThrow('Unknown key');
    });
  });

  describe('isChordInKey', () => {
    it('should identify diatonic chords in major keys', () => {
      const cMajor: Chord = { root: 'C', quality: 'maj', extensions: [], position: 0 };
      const dMinor: Chord = { root: 'D', quality: 'min', extensions: [], position: 0 };
      const fSharp: Chord = { root: 'F#', quality: 'maj', extensions: [], position: 0 };

      expect(KeyTransposer.isChordInKey(cMajor, 'C')).toBe(true);
      expect(KeyTransposer.isChordInKey(dMinor, 'C')).toBe(true);
      expect(KeyTransposer.isChordInKey(fSharp, 'C')).toBe(false);
    });

    it('should identify diatonic chords in minor keys', () => {
      const aMinor: Chord = { root: 'A', quality: 'min', extensions: [], position: 0 };
      const cMajor: Chord = { root: 'C', quality: 'maj', extensions: [], position: 0 };
      const dMajor: Chord = { root: 'D', quality: 'maj', extensions: [], position: 0 };

      expect(KeyTransposer.isChordInKey(aMinor, 'Am')).toBe(true);
      expect(KeyTransposer.isChordInKey(cMajor, 'Am')).toBe(true);
      expect(KeyTransposer.isChordInKey(dMajor, 'Am')).toBe(false);
    });
  });
});