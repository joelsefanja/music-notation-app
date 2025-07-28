/**
 * Unit tests for ChordRoot value object
 * Tests domain-specific validation and behavior
 */

import { ChordRoot } from '../../../types/value-objects/chord-root';

describe('ChordRoot', () => {
  describe('constructor', () => {
    it('should create valid chord roots', () => {
      const validRoots = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
      
      validRoots.forEach(root => {
        expect(() => new ChordRoot(root)).not.toThrow();
        expect(new ChordRoot(root).getValue()).toBe(root);
      });
    });

    it('should reject invalid chord roots', () => {
      const invalidRoots = ['H', 'X', 'C##', 'Dbb', '', '1', 'c'];
      
      invalidRoots.forEach(root => {
        expect(() => new ChordRoot(root)).toThrow();
      });
    });

    it('should normalize input by trimming whitespace', () => {
      const root = new ChordRoot('  C#  ');
      expect(root.getValue()).toBe('C#');
    });

    it('should throw error for null or undefined input', () => {
      expect(() => new ChordRoot(null as any)).toThrow();
      expect(() => new ChordRoot(undefined as any)).toThrow();
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const root = new ChordRoot('F#');
      expect(root.toString()).toBe('F#');
    });
  });

  describe('equals', () => {
    it('should return true for equal chord roots', () => {
      const root1 = new ChordRoot('C#');
      const root2 = new ChordRoot('C#');
      expect(root1.equals(root2)).toBe(true);
    });

    it('should return false for different chord roots', () => {
      const root1 = new ChordRoot('C#');
      const root2 = new ChordRoot('Db');
      expect(root1.equals(root2)).toBe(false);
    });
  });

  describe('accidental detection', () => {
    it('should detect sharp notes', () => {
      const sharpRoots = ['C#', 'D#', 'F#', 'G#', 'A#'];
      sharpRoots.forEach(root => {
        const chordRoot = new ChordRoot(root);
        expect(chordRoot.isSharp()).toBe(true);
        expect(chordRoot.isFlat()).toBe(false);
        expect(chordRoot.isNatural()).toBe(false);
      });
    });

    it('should detect flat notes', () => {
      const flatRoots = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];
      flatRoots.forEach(root => {
        const chordRoot = new ChordRoot(root);
        expect(chordRoot.isFlat()).toBe(true);
        expect(chordRoot.isSharp()).toBe(false);
        expect(chordRoot.isNatural()).toBe(false);
      });
    });

    it('should detect natural notes', () => {
      const naturalRoots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      naturalRoots.forEach(root => {
        const chordRoot = new ChordRoot(root);
        expect(chordRoot.isNatural()).toBe(true);
        expect(chordRoot.isSharp()).toBe(false);
        expect(chordRoot.isFlat()).toBe(false);
      });
    });
  });

  describe('enharmonic equivalents', () => {
    it('should return correct enharmonic equivalents', () => {
      const enharmonicPairs = [
        ['C#', 'Db'],
        ['D#', 'Eb'],
        ['F#', 'Gb'],
        ['G#', 'Ab'],
        ['A#', 'Bb']
      ];

      enharmonicPairs.forEach(([sharp, flat]) => {
        const sharpRoot = new ChordRoot(sharp);
        const flatRoot = new ChordRoot(flat);
        
        expect(sharpRoot.getEnharmonicEquivalent()?.getValue()).toBe(flat);
        expect(flatRoot.getEnharmonicEquivalent()?.getValue()).toBe(sharp);
      });
    });

    it('should return null for natural notes without enharmonic equivalents', () => {
      const naturalRoots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      naturalRoots.forEach(root => {
        const chordRoot = new ChordRoot(root);
        expect(chordRoot.getEnharmonicEquivalent()).toBeNull();
      });
    });
  });

  describe('chromatic index', () => {
    it('should return correct chromatic indices', () => {
      const expectedIndices = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
      };

      Object.entries(expectedIndices).forEach(([root, expectedIndex]) => {
        const chordRoot = new ChordRoot(root);
        expect(chordRoot.getChromaticIndex()).toBe(expectedIndex);
      });
    });
  });

  describe('fromChromaticIndex', () => {
    it('should create chord roots from chromatic indices with sharps', () => {
      const expectedSharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      expectedSharps.forEach((expectedRoot, index) => {
        const chordRoot = ChordRoot.fromChromaticIndex(index, false);
        expect(chordRoot.getValue()).toBe(expectedRoot);
      });
    });

    it('should create chord roots from chromatic indices with flats', () => {
      const expectedFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
      
      expectedFlats.forEach((expectedRoot, index) => {
        const chordRoot = ChordRoot.fromChromaticIndex(index, true);
        expect(chordRoot.getValue()).toBe(expectedRoot);
      });
    });

    it('should throw error for invalid chromatic indices', () => {
      expect(() => ChordRoot.fromChromaticIndex(-1)).toThrow();
      expect(() => ChordRoot.fromChromaticIndex(12)).toThrow();
      expect(() => ChordRoot.fromChromaticIndex(100)).toThrow();
    });
  });

  describe('transpose', () => {
    it('should transpose correctly with positive semitones', () => {
      const root = new ChordRoot('C');
      const transposed = root.transpose(2); // C -> D
      expect(transposed.getValue()).toBe('D');
    });

    it('should transpose correctly with negative semitones', () => {
      const root = new ChordRoot('D');
      const transposed = root.transpose(-2); // D -> C
      expect(transposed.getValue()).toBe('C');
    });

    it('should wrap around octave correctly', () => {
      const root = new ChordRoot('A');
      const transposed = root.transpose(3); // A -> C (next octave)
      expect(transposed.getValue()).toBe('C');
    });

    it('should handle negative wrap-around', () => {
      const root = new ChordRoot('C');
      const transposed = root.transpose(-1); // C -> B (previous octave)
      expect(transposed.getValue()).toBe('B');
    });

    it('should prefer flats when specified', () => {
      const root = new ChordRoot('C');
      const transposed = root.transpose(1, true); // C -> Db (prefer flats)
      expect(transposed.getValue()).toBe('Db');
    });

    it('should prefer sharps when specified', () => {
      const root = new ChordRoot('C');
      const transposed = root.transpose(1, false); // C -> C# (prefer sharps)
      expect(transposed.getValue()).toBe('C#');
    });
  });

  describe('static methods', () => {
    describe('isValid', () => {
      it('should return true for valid chord roots', () => {
        expect(ChordRoot.isValid('C')).toBe(true);
        expect(ChordRoot.isValid('F#')).toBe(true);
        expect(ChordRoot.isValid('Bb')).toBe(true);
      });

      it('should return false for invalid chord roots', () => {
        expect(ChordRoot.isValid('H')).toBe(false);
        expect(ChordRoot.isValid('X')).toBe(false);
        expect(ChordRoot.isValid('')).toBe(false);
      });
    });

    describe('getAllValidRoots', () => {
      it('should return all valid chord roots', () => {
        const validRoots = ChordRoot.getAllValidRoots();
        expect(validRoots).toHaveLength(17);
        expect(validRoots).toContain('C');
        expect(validRoots).toContain('C#');
        expect(validRoots).toContain('Db');
        expect(validRoots).toContain('B');
      });

      it('should return a copy of the array', () => {
        const validRoots1 = ChordRoot.getAllValidRoots();
        const validRoots2 = ChordRoot.getAllValidRoots();
        expect(validRoots1).not.toBe(validRoots2); // Different array instances
        expect(validRoots1).toEqual(validRoots2); // Same content
      });
    });
  });
});
