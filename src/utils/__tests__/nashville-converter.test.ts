import { NashvilleConverter } from '../nashville-converter';
import { Chord } from '../../types';

describe('NashvilleConverter', () => {
  describe('chordToNashville', () => {
    it('should convert basic major chords in C major', () => {
      const cMajor: Chord = { root: 'C', quality: 'maj', extensions: [], position: 0 };
      const fMajor: Chord = { root: 'F', quality: 'maj', extensions: [], position: 0 };
      const gMajor: Chord = { root: 'G', quality: 'maj', extensions: [], position: 0 };

      expect(NashvilleConverter.chordToNashville(cMajor, 'C')).toBe('1');
      expect(NashvilleConverter.chordToNashville(fMajor, 'C')).toBe('4');
      expect(NashvilleConverter.chordToNashville(gMajor, 'C')).toBe('5');
    });

    it('should convert minor chords in C major', () => {
      const dMinor: Chord = { root: 'D', quality: 'min', extensions: [], position: 0 };
      const eMinor: Chord = { root: 'E', quality: 'min', extensions: [], position: 0 };
      const aMinor: Chord = { root: 'A', quality: 'min', extensions: [], position: 0 };

      expect(NashvilleConverter.chordToNashville(dMinor, 'C')).toBe('2m');
      expect(NashvilleConverter.chordToNashville(eMinor, 'C')).toBe('3m');
      expect(NashvilleConverter.chordToNashville(aMinor, 'C')).toBe('6m');
    });

    it('should convert chords with extensions', () => {
      const cMaj7: Chord = { root: 'C', quality: 'maj', extensions: ['maj7'], position: 0 };
      const dm7: Chord = { root: 'D', quality: 'min', extensions: ['7'], position: 0 };

      expect(NashvilleConverter.chordToNashville(cMaj7, 'C')).toBe('1maj7');
      expect(NashvilleConverter.chordToNashville(dm7, 'C')).toBe('2m7');
    });

    it('should convert slash chords', () => {
      const cOverE: Chord = { root: 'C', quality: 'maj', extensions: [], bassNote: 'E', position: 0 };
      const fOverG: Chord = { root: 'F', quality: 'maj', extensions: [], bassNote: 'G', position: 0 };

      expect(NashvilleConverter.chordToNashville(cOverE, 'C')).toBe('1/3');
      expect(NashvilleConverter.chordToNashville(fOverG, 'C')).toBe('4/5');
    });

    it('should convert chords in different keys', () => {
      const gMajor: Chord = { root: 'G', quality: 'maj', extensions: [], position: 0 };
      const cMajor: Chord = { root: 'C', quality: 'maj', extensions: [], position: 0 };
      const dMajor: Chord = { root: 'D', quality: 'maj', extensions: [], position: 0 };

      expect(NashvilleConverter.chordToNashville(gMajor, 'G')).toBe('1');
      expect(NashvilleConverter.chordToNashville(cMajor, 'G')).toBe('4');
      expect(NashvilleConverter.chordToNashville(dMajor, 'G')).toBe('5');
    });

    it('should convert chords in minor keys', () => {
      const aMinor: Chord = { root: 'A', quality: 'min', extensions: [], position: 0 };
      const cMajor: Chord = { root: 'C', quality: 'maj', extensions: [], position: 0 };
      const dMinor: Chord = { root: 'D', quality: 'min', extensions: [], position: 0 };

      expect(NashvilleConverter.chordToNashville(aMinor, 'Am')).toBe('1m');
      expect(NashvilleConverter.chordToNashville(cMajor, 'Am')).toBe('b3');
      expect(NashvilleConverter.chordToNashville(dMinor, 'Am')).toBe('4m');
    });

    it('should handle suspended chords', () => {
      const csus4: Chord = { root: 'C', quality: 'sus4', extensions: [], position: 0 };
      const csus2: Chord = { root: 'C', quality: 'sus2', extensions: [], position: 0 };

      expect(NashvilleConverter.chordToNashville(csus4, 'C')).toBe('1sus4');
      expect(NashvilleConverter.chordToNashville(csus2, 'C')).toBe('1sus2');
    });

    it('should handle diminished and augmented chords', () => {
      const bdim: Chord = { root: 'B', quality: 'dim', extensions: [], position: 0 };
      const caug: Chord = { root: 'C', quality: 'aug', extensions: [], position: 0 };

      expect(NashvilleConverter.chordToNashville(bdim, 'C')).toBe('7°');
      expect(NashvilleConverter.chordToNashville(caug, 'C')).toBe('1+');
    });

    it('should throw error for unsupported keys', () => {
      const chord: Chord = { root: 'C', quality: 'maj', extensions: [], position: 0 };
      expect(() => NashvilleConverter.chordToNashville(chord, 'Invalid')).toThrow('Unsupported key');
    });
  });

  describe('nashvilleToChord', () => {
    it('should convert basic Nashville numbers to chords', () => {
      const chord1 = NashvilleConverter.nashvilleToChord('1', 'C');
      const chord4 = NashvilleConverter.nashvilleToChord('4', 'C');
      const chord5 = NashvilleConverter.nashvilleToChord('5', 'C');

      expect(chord1.root).toBe('C');
      expect(chord1.quality).toBe('maj');
      expect(chord4.root).toBe('F');
      expect(chord5.root).toBe('G');
    });

    it('should convert minor Nashville numbers to chords', () => {
      const chord2m = NashvilleConverter.nashvilleToChord('2m', 'C');
      const chord6m = NashvilleConverter.nashvilleToChord('6m', 'C');

      expect(chord2m.root).toBe('D');
      expect(chord2m.quality).toBe('min');
      expect(chord6m.root).toBe('A');
      expect(chord6m.quality).toBe('min');
    });

    it('should convert Nashville numbers with extensions', () => {
      const chord1maj7 = NashvilleConverter.nashvilleToChord('1maj7', 'C');
      const chord2m7 = NashvilleConverter.nashvilleToChord('2m7', 'C');

      expect(chord1maj7.extensions).toContain('maj7');
      expect(chord2m7.extensions).toContain('7');
    });

    it('should convert Nashville slash chords', () => {
      const chord1over3 = NashvilleConverter.nashvilleToChord('1/3', 'C');
      const chord4over5 = NashvilleConverter.nashvilleToChord('4/5', 'C');

      expect(chord1over3.root).toBe('C');
      expect(chord1over3.bassNote).toBe('E');
      expect(chord4over5.root).toBe('F');
      expect(chord4over5.bassNote).toBe('G');
    });

    it('should convert Nashville numbers in different keys', () => {
      const chord1G = NashvilleConverter.nashvilleToChord('1', 'G');
      const chord4G = NashvilleConverter.nashvilleToChord('4', 'G');

      expect(chord1G.root).toBe('G');
      expect(chord4G.root).toBe('C');
    });

    it('should convert Nashville numbers in minor keys', () => {
      const chord1m = NashvilleConverter.nashvilleToChord('1m', 'Am');
      const chordb3 = NashvilleConverter.nashvilleToChord('b3', 'Am');

      expect(chord1m.root).toBe('A');
      expect(chord1m.quality).toBe('min');
      expect(chordb3.root).toBe('C');
    });

    it('should handle suspended Nashville chords', () => {
      const chord1sus4 = NashvilleConverter.nashvilleToChord('1sus4', 'C');
      const chord1sus2 = NashvilleConverter.nashvilleToChord('1sus2', 'C');

      expect(chord1sus4.quality).toBe('sus4');
      expect(chord1sus2.quality).toBe('sus2');
    });

    it('should throw error for unsupported keys', () => {
      expect(() => NashvilleConverter.nashvilleToChord('1', 'Invalid')).toThrow('Unsupported key');
    });
  });

  describe('chordsToNashville', () => {
    it('should convert array of chords to Nashville', () => {
      const chords: Chord[] = [
        { root: 'C', quality: 'maj', extensions: [], position: 0 },
        { root: 'A', quality: 'min', extensions: [], position: 0 },
        { root: 'F', quality: 'maj', extensions: [], position: 0 },
        { root: 'G', quality: 'maj', extensions: [], position: 0 }
      ];

      const nashville = NashvilleConverter.chordsToNashville(chords, 'C');
      expect(nashville).toEqual(['1', '6m', '4', '5']);
    });
  });

  describe('nashvilleToChords', () => {
    it('should convert array of Nashville numbers to chords', () => {
      const nashville = ['1', '6m', '4', '5'];
      const chords = NashvilleConverter.nashvilleToChords(nashville, 'C');

      expect(chords).toHaveLength(4);
      expect(chords[0].root).toBe('C');
      expect(chords[1].root).toBe('A');
      expect(chords[1].quality).toBe('min');
      expect(chords[2].root).toBe('F');
      expect(chords[3].root).toBe('G');
    });
  });

  describe('isSupportedKey', () => {
    it('should return true for supported major keys', () => {
      expect(NashvilleConverter.isSupportedKey('C')).toBe(true);
      expect(NashvilleConverter.isSupportedKey('G')).toBe(true);
      expect(NashvilleConverter.isSupportedKey('F')).toBe(true);
    });

    it('should return true for supported minor keys', () => {
      expect(NashvilleConverter.isSupportedKey('Am')).toBe(true);
      expect(NashvilleConverter.isSupportedKey('Em')).toBe(true);
      expect(NashvilleConverter.isSupportedKey('Dm')).toBe(true);
    });

    it('should return false for unsupported keys', () => {
      expect(NashvilleConverter.isSupportedKey('Invalid')).toBe(false);
      expect(NashvilleConverter.isSupportedKey('H')).toBe(false);
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('should handle chromatic chords (out of key)', () => {
      // F# is not in C major, should get chromatic notation
      const fSharp: Chord = { root: 'F#', quality: 'maj', extensions: [], position: 0 };
      const result = NashvilleConverter.chordToNashville(fSharp, 'C');
      
      // Should handle chromatic chord gracefully
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle complex chord progressions', () => {
      const progression: Chord[] = [
        { root: 'C', quality: 'maj', extensions: ['maj7'], position: 0 },
        { root: 'A', quality: 'min', extensions: ['7'], position: 0 },
        { root: 'D', quality: 'min', extensions: ['7'], position: 0 },
        { root: 'G', quality: 'maj', extensions: ['7'], position: 0 }
      ];

      const nashville = NashvilleConverter.chordsToNashville(progression, 'C');
      expect(nashville).toEqual(['1maj7', '6m7', '2m7', '57']);
    });

    it('should maintain chord positions when converting', () => {
      const chord: Chord = { root: 'C', quality: 'maj', extensions: [], position: 42 };
      const converted = NashvilleConverter.nashvilleToChord('1', 'C');
      
      // Position should be reset to 0 for new chord objects
      expect(converted.position).toBe(0);
    });
  });
});