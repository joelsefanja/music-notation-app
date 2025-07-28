/**
 * Unit tests for ChordFactory (Factory Pattern)
 * Tests centralized chord creation with validation
 */

import { ChordFactory } from '../../../services/conversion-engine/chord/chord-factory';
import { ChordParser } from '../../../services/conversion-engine/chord/chord-parser';
import { ChordValidator } from '../../../services/conversion-engine/chord/chord-validator';
import { ChordQuality, NashvilleQuality } from '../../../types/interfaces/core-interfaces';

describe('ChordFactory', () => {
  let chordFactory: ChordFactory;
  let mockParser: jest.Mocked<ChordParser>;
  let mockValidator: jest.Mocked<ChordValidator>;

  beforeEach(() => {
    mockParser = {
      parse: jest.fn(),
      isValid: jest.fn(),
      getSupportedQualities: jest.fn(),
      getQualityPatterns: jest.fn(),
      normalize: jest.fn(),
      analyzeChord: jest.fn()
    } as any;

    mockValidator = {
      validate: jest.fn(),
      validateChord: jest.fn(),
      getValidationSuggestions: jest.fn(),
      areEnharmonicallyEquivalent: jest.fn()
    } as any;

    chordFactory = new ChordFactory(mockParser, mockValidator);
  });

  describe('createChord', () => {
    it('should create chord from valid chord string', () => {
      const mockComponents = {
        root: 'C',
        quality: 'maj',
        extensions: ['7'],
        bassNote: undefined
      };

      mockParser.parse.mockReturnValue(mockComponents);
      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const chord = chordFactory.createChord('Cmaj7');

      expect(mockParser.parse).toHaveBeenCalledWith('Cmaj7');
      expect(mockValidator.validate).toHaveBeenCalledWith(mockComponents);
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
      expect(chord.originalNotation).toBe('Cmaj7');
    });

    it('should throw error for invalid chord string', () => {
      mockParser.parse.mockReturnValue({
        root: 'X',
        quality: 'invalid',
        extensions: [],
        bassNote: undefined
      });

      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: ['Invalid root note: X'],
        warnings: []
      });

      expect(() => {
        chordFactory.createChord('Xinvalid');
      }).toThrow('Invalid chord: Invalid root note: X');
    });

    it('should throw error for empty chord string', () => {
      expect(() => {
        chordFactory.createChord('');
      }).toThrow('Chord string must be a non-empty string');
    });

    it('should throw error for non-string input', () => {
      expect(() => {
        chordFactory.createChord(null as any);
      }).toThrow('Chord string must be a non-empty string');
    });

    it('should set position when provided', () => {
      const mockComponents = {
        root: 'G',
        quality: 'min',
        extensions: [],
        bassNote: undefined
      };

      mockParser.parse.mockReturnValue(mockComponents);
      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const chord = chordFactory.createChord('Gm', 42);

      expect(chord.position).toBe(42);
    });
  });

  describe('createNashvilleChord', () => {
    it('should create Nashville chord with valid number and quality', () => {
      const nashvilleChord = chordFactory.createNashvilleChord(1, NashvilleQuality.MAJOR);

      expect(nashvilleChord.number).toBe(1);
      expect(nashvilleChord.quality).toBe(NashvilleQuality.MAJOR);
    });

    it('should throw error for invalid Nashville number', () => {
      expect(() => {
        chordFactory.createNashvilleChord(8, NashvilleQuality.MAJOR);
      }).toThrow('Nashville number must be between 1 and 7');
    });
  });

  describe('createChordFromComponents', () => {
    it('should create chord from valid components', () => {
      const components = {
        root: 'F',
        quality: 'maj',
        extensions: ['7'],
        bassNote: 'A'
      };

      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const chord = chordFactory.createChordFromComponents(components);

      expect(chord.root).toBe('F');
      expect(chord.bassNote).toBe('A');
      expect(chord.originalNotation).toBe('F7/A');
    });

    it('should throw error for invalid components', () => {
      const components = {
        root: 'X',
        quality: 'invalid',
        extensions: [],
        bassNote: undefined
      };

      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: ['Invalid root', 'Invalid quality'],
        warnings: []
      });

      expect(() => {
        chordFactory.createChordFromComponents(components);
      }).toThrow('Invalid chord components: Invalid root, Invalid quality');
    });
  });

  describe('isValidChord', () => {
    it('should return true for valid chord', () => {
      mockParser.parse.mockReturnValue({
        root: 'C',
        quality: 'maj',
        extensions: [],
        bassNote: undefined
      });

      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const result = chordFactory.isValidChord('C');

      expect(result).toBe(true);
    });

    it('should return false for invalid chord', () => {
      mockParser.parse.mockImplementation(() => {
        throw new Error('Parse error');
      });

      const result = chordFactory.isValidChord('invalid');

      expect(result).toBe(false);
    });

    it('should return false when validation fails', () => {
      mockParser.parse.mockReturnValue({
        root: 'C',
        quality: 'invalid',
        extensions: [],
        bassNote: undefined
      });

      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: ['Invalid quality'],
        warnings: []
      });

      const result = chordFactory.isValidChord('C');

      expect(result).toBe(false);
    });
  });

  describe('createSimpleChord', () => {
    it('should create simple major chord', () => {
      const chord = chordFactory.createSimpleChord('G');

      expect(chord.root).toBe('G');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
      expect(chord.originalNotation).toBe('G');
      expect(chord.position).toBe(0);
    });

    it('should create simple minor chord', () => {
      const chord = chordFactory.createSimpleChord('A', ChordQuality.MINOR, 10);

      expect(chord.root).toBe('A');
      expect(chord.quality).toBe(ChordQuality.MINOR);
      expect(chord.originalNotation).toBe('Am');
      expect(chord.position).toBe(10);
    });

    it('should throw error for invalid root', () => {
      expect(() => {
        chordFactory.createSimpleChord('X');
      }).toThrow('Invalid chord root: X');
    });
  });

  describe('createSlashChord', () => {
    it('should create slash chord with valid notes', () => {
      const chord = chordFactory.createSlashChord('C', ChordQuality.MAJOR, 'E');

      expect(chord.root).toBe('C');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
      expect(chord.bassNote).toBe('E');
      expect(chord.originalNotation).toBe('C/E');
    });

    it('should create slash chord with different quality', () => {
      const chord = chordFactory.createSlashChord('F', ChordQuality.MINOR, 'A', 5);

      expect(chord.root).toBe('F');
      expect(chord.quality).toBe(ChordQuality.MINOR);
      expect(chord.bassNote).toBe('A');
      expect(chord.originalNotation).toBe('Fm/A');
      expect(chord.position).toBe(5);
    });

    it('should throw error for invalid root', () => {
      expect(() => {
        chordFactory.createSlashChord('X', ChordQuality.MAJOR, 'C');
      }).toThrow('Invalid chord root: X');
    });

    it('should throw error for invalid bass note', () => {
      expect(() => {
        chordFactory.createSlashChord('C', ChordQuality.MAJOR, 'X');
      }).toThrow('Invalid chord root: X');
    });
  });

  describe('cloneChord', () => {
    it('should clone chord without modifications', () => {
      const originalChord = {
        root: 'D',
        quality: ChordQuality.MINOR,
        extensions: [{ type: 'min' as const, value: '7', position: 0 }],
        bassNote: 'F',
        position: 15,
        originalNotation: 'Dm7/F',
        nashvilleNumber: '2m'
      };

      const clonedChord = chordFactory.cloneChord(originalChord);

      expect(clonedChord).not.toBe(originalChord);
      expect(clonedChord.root).toBe('D');
      expect(clonedChord.quality).toBe(ChordQuality.MINOR);
      expect(clonedChord.bassNote).toBe('F');
      expect(clonedChord.position).toBe(15);
      expect(clonedChord.originalNotation).toBe('Dm7/F');
      expect(clonedChord.nashvilleNumber).toBe('2m');
    });

    it('should clone chord with modifications', () => {
      const originalChord = {
        root: 'D',
        quality: ChordQuality.MINOR,
        extensions: [],
        bassNote: undefined,
        position: 0,
        originalNotation: 'Dm',
        nashvilleNumber: undefined
      };

      const modifications = {
        root: 'G',
        quality: ChordQuality.MAJOR,
        position: 20
      };

      const clonedChord = chordFactory.cloneChord(originalChord, modifications);

      expect(clonedChord.root).toBe('G');
      expect(clonedChord.quality).toBe(ChordQuality.MAJOR);
      expect(clonedChord.position).toBe(20);
      expect(clonedChord.originalNotation).toBe('Dm'); // Original notation preserved
    });
  });

  describe('builder methods', () => {
    it('should create chord builder', () => {
      const builder = chordFactory.createChordBuilder();

      expect(builder).toBeDefined();
      expect(typeof builder.setRoot).toBe('function');
      expect(typeof builder.build).toBe('function');
    });

    it('should create Nashville chord builder', () => {
      const builder = chordFactory.createNashvilleChordBuilder();

      expect(builder).toBeDefined();
      expect(typeof builder.setNumber).toBe('function');
      expect(typeof builder.build).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle parser errors gracefully', () => {
      mockParser.parse.mockImplementation(() => {
        throw new Error('Parser error');
      });

      expect(() => {
        chordFactory.createChord('invalid');
      }).toThrow('Parser error');
    });

    it('should handle validator errors gracefully', () => {
      mockParser.parse.mockReturnValue({
        root: 'C',
        quality: 'maj',
        extensions: [],
        bassNote: undefined
      });

      mockValidator.validate.mockImplementation(() => {
        throw new Error('Validator error');
      });

      expect(() => {
        chordFactory.createChord('C');
      }).toThrow('Validator error');
    });
  });

  describe('integration with real parser and validator', () => {
    beforeEach(() => {
      // Use real parser and validator for integration tests
      chordFactory = new ChordFactory(new ChordParser(), new ChordValidator());
    });

    it('should create complex chords correctly', () => {
      const chord = chordFactory.createChord('Cmaj7#11/E');

      expect(chord.root).toBe('C');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
      expect(chord.bassNote).toBe('E');
      expect(chord.originalNotation).toBe('Cmaj7#11/E');
    });

    it('should validate and reject truly invalid chords', () => {
      expect(() => {
        chordFactory.createChord('Xinvalid123');
      }).toThrow();
    });
  });
});