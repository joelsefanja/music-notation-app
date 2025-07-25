import { ChordParser } from '../chord-parser';
import { Chord } from '../../types';

describe('ChordParser', () => {
  // Mock console.warn to suppress warnings during tests
  const originalWarn = console.warn;
  beforeEach(() => {
    console.warn = jest.fn();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });

  describe('parseChord', () => {
    it('should parse basic major chords', () => {
      const chord = ChordParser.parseChord('C', 0);
      expect(chord).toEqual({
        root: 'C',
        quality: 'maj',
        extensions: [],
        bassNote: undefined,
        position: 0
      });
    });

    it('should parse minor chords', () => {
      const chord = ChordParser.parseChord('Am', 5);
      expect(chord).toEqual({
        root: 'A',
        quality: 'min',
        extensions: [],
        bassNote: undefined,
        position: 5
      });
    });

    it('should parse chords with sharps and flats', () => {
      const sharpChord = ChordParser.parseChord('F#m', 0);
      expect(sharpChord.root).toBe('F#');
      expect(sharpChord.quality).toBe('min');

      const flatChord = ChordParser.parseChord('Bb', 0);
      expect(flatChord.root).toBe('Bb');
      expect(flatChord.quality).toBe('maj');
    });

    it('should parse chords with extensions', () => {
      const chord = ChordParser.parseChord('Cmaj7', 0);
      expect(chord).toEqual({
        root: 'C',
        quality: 'maj',
        extensions: ['maj7'],
        bassNote: undefined,
        position: 0
      });
    });

    it('should parse complex chords with multiple extensions', () => {
      const chord = ChordParser.parseChord('Am7add9', 0);
      expect(chord.root).toBe('A');
      expect(chord.quality).toBe('min');
      expect(chord.extensions).toContain('7');
      expect(chord.extensions).toContain('add9');
    });

    it('should parse slash chords', () => {
      const chord = ChordParser.parseChord('C/E', 0);
      expect(chord).toEqual({
        root: 'C',
        quality: 'maj',
        extensions: [],
        bassNote: 'E',
        position: 0
      });
    });

    it('should parse complex slash chords', () => {
      const chord = ChordParser.parseChord('Am7/G', 0);
      expect(chord).toEqual({
        root: 'A',
        quality: 'min',
        extensions: ['7'],
        bassNote: 'G',
        position: 0
      });
    });

    it('should parse suspended chords', () => {
      const sus4 = ChordParser.parseChord('Csus4', 0);
      expect(sus4.quality).toBe('sus4');

      const sus2 = ChordParser.parseChord('Dsus2', 0);
      expect(sus2.quality).toBe('sus2');

      const sus = ChordParser.parseChord('Gsus', 0);
      expect(sus.quality).toBe('sus4');
    });

    it('should parse diminished and augmented chords', () => {
      const dim = ChordParser.parseChord('Bdim', 0);
      expect(dim.quality).toBe('dim');

      const aug = ChordParser.parseChord('Caug', 0);
      expect(aug.quality).toBe('aug');

      const dimSymbol = ChordParser.parseChord('F°', 0);
      expect(dimSymbol.quality).toBe('dim');

      const augSymbol = ChordParser.parseChord('G+', 0);
      expect(augSymbol.quality).toBe('aug');
    });

    it('should throw error for invalid chord format', () => {
      expect(() => ChordParser.parseChord('Invalid', 0)).toThrow('Invalid chord format');
      expect(() => ChordParser.parseChord('H', 0)).toThrow('Invalid chord format');
      expect(() => ChordParser.parseChord('', 0)).toThrow('Invalid chord format');
    });
  });

  describe('isValidChord', () => {
    it('should return true for valid chords', () => {
      expect(ChordParser.isValidChord('C')).toBe(true);
      expect(ChordParser.isValidChord('Am')).toBe(true);
      expect(ChordParser.isValidChord('F#maj7')).toBe(true);
      expect(ChordParser.isValidChord('Bb/D')).toBe(true);
    });

    it('should return false for invalid chords', () => {
      expect(ChordParser.isValidChord('Invalid')).toBe(false);
      expect(ChordParser.isValidChord('H')).toBe(false);
      expect(ChordParser.isValidChord('')).toBe(false);
      expect(ChordParser.isValidChord('C/')).toBe(false);
    });
  });

  describe('extractChordsFromText', () => {
    it('should extract chords from bracketed text', () => {
      const text = '[C]Amazing [Am]grace how [F]sweet the [G]sound';
      const chords = ChordParser.extractChordsFromText(text, 'brackets');
      
      expect(chords).toHaveLength(4);
      expect(chords[0].root).toBe('C');
      expect(chords[1].root).toBe('A');
      expect(chords[2].root).toBe('F');
      expect(chords[3].root).toBe('G');
    });

    it('should extract complex chords from bracketed text', () => {
      const text = '[Cmaj7]Test [Am7/G]chord [F#dim]parsing';
      const chords = ChordParser.extractChordsFromText(text, 'brackets');
      
      expect(chords).toHaveLength(3);
      expect(chords[0].extensions).toContain('maj7');
      expect(chords[1].bassNote).toBe('G');
      expect(chords[2].quality).toBe('dim');
    });

    it('should handle invalid chords gracefully', () => {
      const text = '[C]Valid [Invalid]chord [Am]test';
      const chords = ChordParser.extractChordsFromText(text, 'brackets');
      
      expect(chords).toHaveLength(2);
      expect(chords[0].root).toBe('C');
      expect(chords[1].root).toBe('A');
      
      // Verify that console.warn was called for the invalid chord
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping invalid chord: "Invalid"')
      );
    });

    it('should extract chords from inline text', () => {
      const text = 'C Am F G progression';
      const chords = ChordParser.extractChordsFromText(text, 'inline');
      
      expect(chords).toHaveLength(4);
      expect(chords.map(c => c.root)).toEqual(['C', 'A', 'F', 'G']);
    });

    it('should track chord positions correctly', () => {
      const text = '[C]Test [Am]text';
      const chords = ChordParser.extractChordsFromText(text, 'brackets');
      
      expect(chords[0].position).toBe(0);
      expect(chords[1].position).toBe(8); // Position of '[Am]' in the string
    });
  });

  describe('convertNashvilleSlashChord', () => {
    it('should convert Nashville slash chords to proper notation', () => {
      expect(ChordParser.convertNashvilleSlashChord('1/3', 'C')).toBe('C/E');
      expect(ChordParser.convertNashvilleSlashChord('4/5', 'C')).toBe('F/G');
      expect(ChordParser.convertNashvilleSlashChord('5/7', 'C')).toBe('G/B');
    });

    it('should handle Nashville slash chords with qualities', () => {
      expect(ChordParser.convertNashvilleSlashChord('2m/4', 'C')).toBe('Dm/F');
      expect(ChordParser.convertNashvilleSlashChord('6m/1', 'C')).toBe('Am/C');
    });

    it('should handle Nashville slash chords in different keys', () => {
      expect(ChordParser.convertNashvilleSlashChord('1/3', 'G')).toBe('G/B');
      expect(ChordParser.convertNashvilleSlashChord('4/5', 'G')).toBe('C/D');
    });

    it('should return original string if not Nashville slash chord', () => {
      expect(ChordParser.convertNashvilleSlashChord('C/E', 'C')).toBe('C/E');
      expect(ChordParser.convertNashvilleSlashChord('Am', 'C')).toBe('Am');
    });

    it('should handle chromatic Nashville chords', () => {
      expect(ChordParser.convertNashvilleSlashChord('#4/5', 'C')).toBe('F#/G');
      // The Nashville converter might return A# instead of Bb depending on key context
      const result = ChordParser.convertNashvilleSlashChord('b7/1', 'C');
      expect(result === 'Bb/C' || result === 'A#/C').toBe(true);
    });
  });

  describe('parseChordWithNashvilleSupport', () => {
    it('should parse Nashville slash chords when key is provided', () => {
      const chord = ChordParser.parseChordWithNashvilleSupport('5/7', 0, 'C');
      expect(chord.root).toBe('G');
      expect(chord.bassNote).toBe('B');
    });

    it('should parse regular chords normally', () => {
      const chord = ChordParser.parseChordWithNashvilleSupport('Cmaj7', 0, 'C');
      expect(chord.root).toBe('C');
      expect(chord.extensions).toContain('maj7');
    });

    it('should parse Nashville slash chords with qualities', () => {
      const chord = ChordParser.parseChordWithNashvilleSupport('2m/4', 0, 'C');
      expect(chord.root).toBe('D');
      expect(chord.quality).toBe('min');
      expect(chord.bassNote).toBe('F');
    });

    it('should handle regular parsing when no key provided', () => {
      const chord = ChordParser.parseChordWithNashvilleSupport('C/E', 0);
      expect(chord.root).toBe('C');
      expect(chord.bassNote).toBe('E');
    });
  });

  describe('complex chord parsing scenarios', () => {
    it('should handle chords with multiple complex extensions', () => {
      const chord = ChordParser.parseChord('Cmaj7#11add9', 0);
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe('maj');
      expect(chord.extensions).toContain('maj7');
      expect(chord.extensions).toContain('#11');
      expect(chord.extensions).toContain('add9');
    });

    it('should handle diminished seventh chords', () => {
      const chord = ChordParser.parseChord('Bdim7', 0);
      expect(chord.root).toBe('B');
      expect(chord.quality).toBe('dim');
      expect(chord.extensions).toContain('7');
    });

    it('should handle half-diminished chords', () => {
      const chord = ChordParser.parseChord('Bm7b5', 0);
      expect(chord.root).toBe('B');
      expect(chord.quality).toBe('min');
      expect(chord.extensions).toContain('7');
      expect(chord.extensions).toContain('b5');
    });

    it('should handle augmented chords with extensions', () => {
      const chord = ChordParser.parseChord('Caug7', 0);
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe('aug');
      expect(chord.extensions).toContain('7');
    });

    it('should handle suspended chords with extensions', () => {
      const chord = ChordParser.parseChord('C7sus4', 0);
      expect(chord.root).toBe('C');
      expect(chord.extensions).toContain('7sus4');
    });

    it('should preserve chord position accurately', () => {
      const text = 'Here is a [Cmaj7] chord and [Am/G] another';
      const chords = ChordParser.extractChordsFromText(text);
      
      expect(chords).toHaveLength(2);
      expect(chords[0].position).toBe(10); // Position of [Cmaj7]
      expect(chords[1].position).toBe(28); // Position of [Am/G] - adjusted for actual position
    });
  });

  describe('chordToString', () => {
    it('should convert basic chords to string', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        position: 0
      };
      
      expect(ChordParser.chordToString(chord)).toBe('C');
      expect(ChordParser.chordToString(chord, true)).toBe('[C]');
    });

    it('should convert minor chords to string', () => {
      const chord: Chord = {
        root: 'A',
        quality: 'min',
        extensions: [],
        position: 0
      };
      
      expect(ChordParser.chordToString(chord)).toBe('Am');
    });

    it('should convert chords with extensions', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: ['7', 'add9'],
        position: 0
      };
      
      expect(ChordParser.chordToString(chord)).toBe('C7add9');
    });

    it('should convert slash chords', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        bassNote: 'E',
        position: 0
      };
      
      expect(ChordParser.chordToString(chord)).toBe('C/E');
    });

    it('should convert complex chords', () => {
      const chord: Chord = {
        root: 'A',
        quality: 'min',
        extensions: ['7'],
        bassNote: 'G',
        position: 0
      };
      
      expect(ChordParser.chordToString(chord)).toBe('Am7/G');
    });

    it('should handle chords with multiple extensions', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: ['maj7', '#11'],
        bassNote: 'E',
        position: 0
      };
      
      expect(ChordParser.chordToString(chord)).toBe('Cmaj7#11/E');
    });
  });
});