import {
  CHROMATIC_NOTES,
  CHROMATIC_NOTES_FLAT,
  MAJOR_KEY_SIGNATURES,
  MINOR_KEY_SIGNATURES,
  NASHVILLE_MAJOR_MAPPINGS,
  NASHVILLE_MINOR_MAPPINGS,
  CHORD_QUALITIES,
  CHORD_EXTENSIONS,
  ENHARMONIC_EQUIVALENTS
} from '../chord-mappings';

describe('Chord Mappings Constants', () => {
  describe('CHROMATIC_NOTES', () => {
    it('should have 12 notes', () => {
      expect(CHROMATIC_NOTES).toHaveLength(12);
      expect(CHROMATIC_NOTES_FLAT).toHaveLength(12);
    });

    it('should start with C', () => {
      expect(CHROMATIC_NOTES[0]).toBe('C');
      expect(CHROMATIC_NOTES_FLAT[0]).toBe('C');
    });

    it('should contain all expected notes', () => {
      expect(CHROMATIC_NOTES).toContain('C');
      expect(CHROMATIC_NOTES).toContain('C#');
      expect(CHROMATIC_NOTES).toContain('D');
      expect(CHROMATIC_NOTES).toContain('F#');
      expect(CHROMATIC_NOTES).toContain('G');
      expect(CHROMATIC_NOTES).toContain('A#');
      expect(CHROMATIC_NOTES).toContain('B');
    });

    it('should contain flat equivalents', () => {
      expect(CHROMATIC_NOTES_FLAT).toContain('Db');
      expect(CHROMATIC_NOTES_FLAT).toContain('Eb');
      expect(CHROMATIC_NOTES_FLAT).toContain('Gb');
      expect(CHROMATIC_NOTES_FLAT).toContain('Ab');
      expect(CHROMATIC_NOTES_FLAT).toContain('Bb');
    });
  });

  describe('MAJOR_KEY_SIGNATURES', () => {
    it('should contain all 15 major keys', () => {
      expect(Object.keys(MAJOR_KEY_SIGNATURES)).toHaveLength(15);
    });

    it('should have C major with no sharps or flats', () => {
      expect(MAJOR_KEY_SIGNATURES['C']).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('should have G major with F#', () => {
      expect(MAJOR_KEY_SIGNATURES['G']).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    });

    it('should have F major with Bb', () => {
      expect(MAJOR_KEY_SIGNATURES['F']).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
    });

    it('should have all keys with 7 notes each', () => {
      Object.values(MAJOR_KEY_SIGNATURES).forEach(scale => {
        expect(scale).toHaveLength(7);
      });
    });

    it('should include sharp keys', () => {
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('D');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('A');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('E');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('B');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('F#');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('C#');
    });

    it('should include flat keys', () => {
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('Bb');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('Eb');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('Ab');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('Db');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('Gb');
      expect(MAJOR_KEY_SIGNATURES).toHaveProperty('Cb');
    });
  });

  describe('MINOR_KEY_SIGNATURES', () => {
    it('should contain all 15 minor keys', () => {
      expect(Object.keys(MINOR_KEY_SIGNATURES)).toHaveLength(15);
    });

    it('should have A minor with no sharps or flats', () => {
      expect(MINOR_KEY_SIGNATURES['Am']).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('should have E minor with F#', () => {
      expect(MINOR_KEY_SIGNATURES['Em']).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
    });

    it('should have D minor with Bb', () => {
      expect(MINOR_KEY_SIGNATURES['Dm']).toEqual(['D', 'E', 'F', 'G', 'A', 'Bb', 'C']);
    });

    it('should have all keys with 7 notes each', () => {
      Object.values(MINOR_KEY_SIGNATURES).forEach(scale => {
        expect(scale).toHaveLength(7);
      });
    });

    it('should include sharp minor keys', () => {
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Bm');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('F#m');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('C#m');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('G#m');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('D#m');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('A#m');
    });

    it('should include flat minor keys', () => {
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Gm');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Cm');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Fm');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Bbm');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Ebm');
      expect(MINOR_KEY_SIGNATURES).toHaveProperty('Abm');
    });
  });

  describe('NASHVILLE_MAJOR_MAPPINGS', () => {
    it('should have mappings for all major keys', () => {
      const majorKeys = Object.keys(MAJOR_KEY_SIGNATURES);
      majorKeys.forEach(key => {
        expect(NASHVILLE_MAJOR_MAPPINGS).toHaveProperty(key);
      });
    });

    it('should map C major correctly', () => {
      const cMajorMapping = NASHVILLE_MAJOR_MAPPINGS['C'];
      expect(cMajorMapping['C']).toBe('1');
      expect(cMajorMapping['D']).toBe('2');
      expect(cMajorMapping['E']).toBe('3');
      expect(cMajorMapping['F']).toBe('4');
      expect(cMajorMapping['G']).toBe('5');
      expect(cMajorMapping['A']).toBe('6');
      expect(cMajorMapping['B']).toBe('7');
    });

    it('should map G major correctly', () => {
      const gMajorMapping = NASHVILLE_MAJOR_MAPPINGS['G'];
      expect(gMajorMapping['G']).toBe('1');
      expect(gMajorMapping['A']).toBe('2');
      expect(gMajorMapping['B']).toBe('3');
      expect(gMajorMapping['C']).toBe('4');
      expect(gMajorMapping['D']).toBe('5');
      expect(gMajorMapping['E']).toBe('6');
      expect(gMajorMapping['F#']).toBe('7');
    });

    it('should have 7 mappings for each key', () => {
      Object.values(NASHVILLE_MAJOR_MAPPINGS).forEach(mapping => {
        expect(Object.keys(mapping)).toHaveLength(7);
      });
    });
  });

  describe('NASHVILLE_MINOR_MAPPINGS', () => {
    it('should have mappings for all minor keys', () => {
      const minorKeys = Object.keys(MINOR_KEY_SIGNATURES);
      minorKeys.forEach(key => {
        expect(NASHVILLE_MINOR_MAPPINGS).toHaveProperty(key);
      });
    });

    it('should map A minor correctly', () => {
      const aMinorMapping = NASHVILLE_MINOR_MAPPINGS['Am'];
      expect(aMinorMapping['A']).toBe('1m');
      expect(aMinorMapping['B']).toBe('2°');
      expect(aMinorMapping['C']).toBe('b3');
      expect(aMinorMapping['D']).toBe('4m');
      expect(aMinorMapping['E']).toBe('5m');
      expect(aMinorMapping['F']).toBe('b6');
      expect(aMinorMapping['G']).toBe('b7');
    });

    it('should have 7 mappings for each key', () => {
      Object.values(NASHVILLE_MINOR_MAPPINGS).forEach(mapping => {
        expect(Object.keys(mapping)).toHaveLength(7);
      });
    });
  });

  describe('CHORD_QUALITIES', () => {
    it('should map basic chord qualities', () => {
      expect(CHORD_QUALITIES['']).toBe('maj');
      expect(CHORD_QUALITIES['maj']).toBe('maj');
      expect(CHORD_QUALITIES['major']).toBe('maj');
      expect(CHORD_QUALITIES['M']).toBe('maj');
    });

    it('should map minor chord qualities', () => {
      expect(CHORD_QUALITIES['m']).toBe('min');
      expect(CHORD_QUALITIES['min']).toBe('min');
      expect(CHORD_QUALITIES['minor']).toBe('min');
      expect(CHORD_QUALITIES['-']).toBe('min');
    });

    it('should map diminished and augmented qualities', () => {
      expect(CHORD_QUALITIES['dim']).toBe('dim');
      expect(CHORD_QUALITIES['°']).toBe('dim');
      expect(CHORD_QUALITIES['aug']).toBe('aug');
      expect(CHORD_QUALITIES['+']).toBe('aug');
    });

    it('should map suspended chord qualities', () => {
      expect(CHORD_QUALITIES['sus']).toBe('sus4');
      expect(CHORD_QUALITIES['sus4']).toBe('sus4');
      expect(CHORD_QUALITIES['sus2']).toBe('sus2');
    });
  });

  describe('CHORD_EXTENSIONS', () => {
    it('should contain basic seventh chords', () => {
      expect(CHORD_EXTENSIONS).toContain('7');
      expect(CHORD_EXTENSIONS).toContain('maj7');
      expect(CHORD_EXTENSIONS).toContain('M7');
    });

    it('should contain ninth chords', () => {
      expect(CHORD_EXTENSIONS).toContain('9');
      expect(CHORD_EXTENSIONS).toContain('maj9');
      expect(CHORD_EXTENSIONS).toContain('M9');
    });

    it('should contain eleventh and thirteenth chords', () => {
      expect(CHORD_EXTENSIONS).toContain('11');
      expect(CHORD_EXTENSIONS).toContain('maj11');
      expect(CHORD_EXTENSIONS).toContain('13');
      expect(CHORD_EXTENSIONS).toContain('maj13');
    });

    it('should contain add chords', () => {
      expect(CHORD_EXTENSIONS).toContain('add9');
      expect(CHORD_EXTENSIONS).toContain('add2');
      expect(CHORD_EXTENSIONS).toContain('add4');
      expect(CHORD_EXTENSIONS).toContain('add11');
    });

    it('should contain sixth chords', () => {
      expect(CHORD_EXTENSIONS).toContain('6');
      expect(CHORD_EXTENSIONS).toContain('maj6');
      expect(CHORD_EXTENSIONS).toContain('6/9');
    });

    it('should contain suspended variations', () => {
      expect(CHORD_EXTENSIONS).toContain('sus');
      expect(CHORD_EXTENSIONS).toContain('sus2');
      expect(CHORD_EXTENSIONS).toContain('sus4');
      expect(CHORD_EXTENSIONS).toContain('sus9');
    });

    it('should contain altered extensions', () => {
      expect(CHORD_EXTENSIONS).toContain('b5');
      expect(CHORD_EXTENSIONS).toContain('#5');
      expect(CHORD_EXTENSIONS).toContain('b9');
      expect(CHORD_EXTENSIONS).toContain('#9');
      expect(CHORD_EXTENSIONS).toContain('#11');
      expect(CHORD_EXTENSIONS).toContain('b13');
    });

    it('should contain complex extensions', () => {
      expect(CHORD_EXTENSIONS).toContain('7sus4');
      expect(CHORD_EXTENSIONS).toContain('maj7sus4');
      expect(CHORD_EXTENSIONS).toContain('dim7');
      expect(CHORD_EXTENSIONS).toContain('ø7');
      expect(CHORD_EXTENSIONS).toContain('m7b5');
      expect(CHORD_EXTENSIONS).toContain('aug7');
    });
  });

  describe('ENHARMONIC_EQUIVALENTS', () => {
    it('should map sharp to flat equivalents', () => {
      expect(ENHARMONIC_EQUIVALENTS['C#']).toBe('Db');
      expect(ENHARMONIC_EQUIVALENTS['D#']).toBe('Eb');
      expect(ENHARMONIC_EQUIVALENTS['F#']).toBe('Gb');
      expect(ENHARMONIC_EQUIVALENTS['G#']).toBe('Ab');
      expect(ENHARMONIC_EQUIVALENTS['A#']).toBe('Bb');
    });

    it('should map flat to sharp equivalents', () => {
      expect(ENHARMONIC_EQUIVALENTS['Db']).toBe('C#');
      expect(ENHARMONIC_EQUIVALENTS['Eb']).toBe('D#');
      expect(ENHARMONIC_EQUIVALENTS['Gb']).toBe('F#');
      expect(ENHARMONIC_EQUIVALENTS['Ab']).toBe('G#');
      expect(ENHARMONIC_EQUIVALENTS['Bb']).toBe('A#');
    });

    it('should map edge case enharmonics', () => {
      expect(ENHARMONIC_EQUIVALENTS['E#']).toBe('F');
      expect(ENHARMONIC_EQUIVALENTS['Fb']).toBe('E');
      expect(ENHARMONIC_EQUIVALENTS['B#']).toBe('C');
      expect(ENHARMONIC_EQUIVALENTS['Cb']).toBe('B');
    });

    it('should have bidirectional mappings', () => {
      // Each sharp should map to a flat and vice versa
      const sharps = ['C#', 'D#', 'F#', 'G#', 'A#'];
      const flats = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];
      
      sharps.forEach((sharp, index) => {
        const flat = flats[index];
        expect(ENHARMONIC_EQUIVALENTS[sharp]).toBe(flat);
        expect(ENHARMONIC_EQUIVALENTS[flat]).toBe(sharp);
      });
    });
  });

  describe('Data integrity', () => {
    it('should have consistent major and minor key counts', () => {
      expect(Object.keys(MAJOR_KEY_SIGNATURES)).toHaveLength(15);
      expect(Object.keys(MINOR_KEY_SIGNATURES)).toHaveLength(15);
      expect(Object.keys(NASHVILLE_MAJOR_MAPPINGS)).toHaveLength(15);
      expect(Object.keys(NASHVILLE_MINOR_MAPPINGS)).toHaveLength(15);
    });

    it('should have all Nashville mappings initialized', () => {
      Object.keys(MAJOR_KEY_SIGNATURES).forEach(key => {
        expect(NASHVILLE_MAJOR_MAPPINGS[key]).toBeDefined();
        expect(Object.keys(NASHVILLE_MAJOR_MAPPINGS[key])).toHaveLength(7);
      });

      Object.keys(MINOR_KEY_SIGNATURES).forEach(key => {
        expect(NASHVILLE_MINOR_MAPPINGS[key]).toBeDefined();
        expect(Object.keys(NASHVILLE_MINOR_MAPPINGS[key])).toHaveLength(7);
      });
    });

    it('should have no duplicate chord extensions', () => {
      const uniqueExtensions = [...new Set(CHORD_EXTENSIONS)];
      expect(uniqueExtensions).toHaveLength(CHORD_EXTENSIONS.length);
    });

    it('should have valid enharmonic pairs', () => {
      Object.entries(ENHARMONIC_EQUIVALENTS).forEach(([note, equivalent]) => {
        // Each note should be different from its equivalent
        expect(note).not.toBe(equivalent);
        // Each note should be a valid note name
        expect(note).toMatch(/^[A-G][#b]?$/);
        expect(equivalent).toMatch(/^[A-G][#b]?$/);
      });
    });
  });
});