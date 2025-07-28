/**
 * Unit tests for ChordBuilder (Builder Pattern)
 * Tests fluent interface for chord construction
 */
import { describe, it, expect, beforeEach } from '@jest/globals';

import { ChordBuilder } from '../../../services/conversion-engine/chord/chord-builder';
import { ChordQuality } from '../../../types/interfaces/core-interfaces';

describe('ChordBuilder', () => {
  let builder: ChordBuilder;

  beforeEach(() => {
    builder = new ChordBuilder(); // Assuming ChordBuilder is correctly imported
  });

  describe('fluent interface', () => {
    it('should return builder instance for method chaining', () => {
      const result = builder
        .setRoot('C')
        .setQuality(ChordQuality.MAJOR)
        .setPosition(0);

      expect(result).toBe(builder);
    });

    it('should build chord with all properties', () => {
      const chord = builder
        .setRoot('F')
        .setQuality(ChordQuality.MINOR)
        .setExtensions([{ type: 'min', value: '7', position: 0 }])
        .setBassNote('A')
        .setPosition(10)
        .setOriginalNotation('Fm7/A')
        .setNashvilleNumber('4m')
        .build();

      expect(chord.root).toBe('F');
      expect(chord.quality).toBe(ChordQuality.MINOR);
      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0].value).toBe('7');
      expect(chord.bassNote).toBe('A');
      expect(chord.position).toBe(10);
      expect(chord.originalNotation).toBe('Fm7/A');
      expect(chord.nashvilleNumber).toBe('4m');
    });
  });

  describe('setRoot', () => {
    it('should set valid chord root', () => {
      const chord = builder
        .setRoot('G#')
        .setOriginalNotation('G#')
        .build();

      expect(chord.root).toBe('G#');
    });

    it('should throw error for invalid chord root', () => {
      expect(() => {
        builder.setRoot('X');
      }).toThrow('Invalid chord root: X');
    });
  });

  describe('setQuality', () => {
    it('should set chord quality', () => {
      const chord = builder
        .setRoot('C')
        .setQuality(ChordQuality.DIMINISHED)
        .setOriginalNotation('Cdim')
        .build();

      expect(chord.quality).toBe(ChordQuality.DIMINISHED);
    });
  });

  describe('extensions', () => {
    it('should set extensions array', () => {
      const extensions = [
        { type: 'maj' as const, value: '7', position: 0 },
        { type: 'add' as const, value: '9', position: 1 }
      ];

      const chord = builder
        .setRoot('C')
        .setExtensions(extensions)
        .setOriginalNotation('C7add9')
        .build();

      expect(chord.extensions).toHaveLength(2);
      expect(chord.extensions[0].value).toBe('7');
      expect(chord.extensions[1].value).toBe('9');
    });

    it('should add single extension', () => {
      const extension = { type: 'sus' as const, value: 'sus4', position: 0 };

      const chord = builder
        .setRoot('D')
        .setExtensions([extension])
        .setOriginalNotation('Dsus4')
        .build();

      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0]).toEqual(extension);
    });

    it('should add extension by value', () => {
      const chord = builder
        .setRoot('G')
 .addExtension({ type: 'maj', value: 'maj7', position: 0 })
        .setOriginalNotation('Gmaj7')
        .build();

      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0].type).toBe('maj');
      expect(chord.extensions[0].value).toBe('maj7');
      expect(chord.extensions[0].position).toBe(0); // Assuming position is handled internally or defaults to 0
    });

    it('should add multiple extensions', () => {
      const chord = builder
        .setRoot('A')
 .addExtensionByValue('maj', '7')
 .addExtension({ type: 'add', value: '9', position: 1 })
        .setOriginalNotation('A7add9')
        .build();

      expect(chord.extensions).toHaveLength(2);
      expect(chord.extensions[0].position).toBe(0);
      expect(chord.extensions[1].position).toBe(1);
    });
  });

  describe('setBassNote', () => {
    it('should set valid bass note', () => {
      const chord = builder
        .setRoot('C')
        .setBassNote('E')
        .setOriginalNotation('C/E')
        .build();

      expect(chord.bassNote).toBe('E');
    });

    it('should clear bass note when undefined', () => {
      const chord = builder
        .setRoot('C')
        .setBassNote('E')
        .setBassNote(undefined)
        .setOriginalNotation('C')
        .build();

      expect(chord.bassNote).toBeUndefined();
    });

    it('should throw error for invalid bass note', () => {
      expect(() => {
        builder.setBassNote('X');
      }).toThrow('Invalid chord root: X');
    });
  });

  describe('setPosition', () => {
    it('should set valid position', () => {
      const chord = builder
        .setRoot('C')
        .setPosition(42)
        .setOriginalNotation('C')
        .build();

      expect(chord.position).toBe(42);
    });

    it('should throw error for negative position', () => {
      expect(() => {
        builder.setPosition(-1);
      }).toThrow('Position must be non-negative');
    });
  });

  describe('setOriginalNotation', () => {
    it('should set original notation', () => {
      const chord = builder
        .setRoot('C')
        .setOriginalNotation('C major')
        .build();

      expect(chord.originalNotation).toBe('C major');
    });
  });

  describe('setNashvilleNumber', () => {
    it('should set Nashville number', () => {
      const chord = builder
        .setRoot('C')
        .setNashvilleNumber('1')
        .setOriginalNotation('C')
        .build();

      expect(chord.nashvilleNumber).toBe('1');
    });

    it('should clear Nashville number when undefined', () => {
      const chord = builder
        .setRoot('C')
        .setNashvilleNumber('1')
        .setNashvilleNumber(undefined)
        .setOriginalNotation('C')
        .build();

      expect(chord.nashvilleNumber).toBeUndefined();
    });
  });

  describe('build', () => {
    it('should throw error when root is not set', () => {
      expect(() => {
        builder.build();
      }).toThrow('Chord must have a root note');
    });

    it('should generate default notation when not provided', () => {
      const chord = builder
        .setRoot('C')
        .setQuality(ChordQuality.MINOR)
        .addExtensionByValue('min', '7')
        .setBassNote('E')
        .build();

      expect(chord.originalNotation).toBe('Cm7/E');
    });

    it('should validate extensions during build', () => {
      expect(() => {
        builder
          .setRoot('C')
          .addExtension({ type: 'add' as const, value: '', position: 0 })
          .build();
      }).toThrow('All extensions must have type and value');
    });
  });

  describe('reset', () => {
    it('should reset builder to initial state', () => {
      builder
        .setRoot('C')
        .setQuality(ChordQuality.MINOR)
        .setPosition(10)
        .reset();

      const chord = builder
        .setRoot('G')
        .setOriginalNotation('G')
        .build();

      expect(chord.root).toBe('G');
      expect(chord.quality).toBe(ChordQuality.MAJOR); // Default
      expect(chord.position).toBe(0); // Default
    });

    it('should return builder instance for chaining', () => {
      const result = builder.reset();
      expect(result).toBe(builder);
    });
  });

  describe('clone', () => {
    it('should create independent copy of builder', () => {
      builder
        .setRoot('C')
        .setQuality(ChordQuality.MINOR)
        .setPosition(5);

      const clone = builder.clone();

      // Modify original
      builder.setRoot('G');

      // Clone should be unchanged
      const cloneChord = clone.setOriginalNotation('Cm').build();
      expect(cloneChord.root).toBe('C');
      expect(cloneChord.quality).toBe(ChordQuality.MINOR);
      expect(cloneChord.position).toBe(5);
    });
  });

  describe('setProperties', () => {
    it('should set multiple properties at once', () => {
      const chord = builder
        .setProperties({
          root: 'F',
          quality: ChordQuality.AUGMENTED,
          position: 15,
          originalNotation: 'Faug',
          nashvilleNumber: '4+'
        })
        .build();

      expect(chord.root).toBe('F');
      expect(chord.quality).toBe(ChordQuality.AUGMENTED);
      expect(chord.position).toBe(15);
      expect(chord.originalNotation).toBe('Faug');
      expect(chord.nashvilleNumber).toBe('4+');
    });

    it('should skip undefined properties', () => {
      const chord = builder
        .setRoot('C')
        .setPosition(10)
        .setProperties({
          quality: ChordQuality.MINOR,
          // root and position not specified, should remain unchanged
        })
        .setOriginalNotation('Cm')
        .build();

      expect(chord.root).toBe('C');
      expect(chord.quality).toBe(ChordQuality.MINOR);
      expect(chord.position).toBe(10);
    });
  });

  describe('convenience methods', () => {
    it('should build major chord', () => {
      const chord = builder.buildMajor('D');

      expect(chord.root).toBe('D');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
      expect(chord.originalNotation).toBe('D');
    });

    it('should build major chord with custom notation', () => {
      const chord = builder.buildMajor('D', 'D major');

      expect(chord.originalNotation).toBe('D major');
    });

    it('should build minor chord', () => {
      const chord = builder.buildMinor('A');

      expect(chord.root).toBe('A');
      expect(chord.quality).toBe(ChordQuality.MINOR);
      expect(chord.originalNotation).toBe('Am');
    });

    it('should build dominant 7th chord', () => {
      const chord = builder.buildDominant7('G');

      expect(chord.root).toBe('G');
      expect(chord.quality).toBe(ChordQuality.DOMINANT);
      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0].value).toBe('7');
      expect(chord.originalNotation).toBe('G7');
    });

    it('should build major 7th chord', () => {
      const chord = builder.buildMajor7('C');

      expect(chord.root).toBe('C');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0].value).toBe('maj7');
      expect(chord.originalNotation).toBe('Cmaj7');
    });

    it('should build minor 7th chord', () => {
      const chord = builder.buildMinor7('F');

      expect(chord.root).toBe('F');
      expect(chord.quality).toBe(ChordQuality.MINOR);
      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0].value).toBe('m7');
      expect(chord.originalNotation).toBe('Fm7');
    });

    it('should build suspended chord with default sus4', () => {
      const chord = builder.buildSuspended('E');

      expect(chord.root).toBe('E');
      expect(chord.quality).toBe(ChordQuality.SUSPENDED);
      expect(chord.extensions).toHaveLength(1);
      expect(chord.extensions[0].value).toBe('4');
      expect(chord.originalNotation).toBe('Esus4');
    });

    it('should build suspended chord with sus2', () => {
      const chord = builder.buildSuspended('B', '2');

      expect(chord.extensions[0].value).toBe('2');
      expect(chord.originalNotation).toBe('Bsus2');
    });
  });

  describe('error handling', () => {
    it('should handle invalid root in convenience methods', () => {
      expect(() => {
        builder.buildMajor('X');
      }).toThrow('Invalid chord root: X');
    });

    it('should validate bass note during build', () => {
      expect(() => {
        builder
          .setRoot('C')
          .setBassNote('Y')
          .build();
      }).toThrow('Invalid chord root: Y');
    });
  });

  describe('immutability', () => {
    it('should not modify original extensions array', () => {
      const originalExtensions = [
        { type: 'maj' as const, value: '7', position: 0 }
      ];

      const chord = builder
        .setRoot('C')
        .setExtensions(originalExtensions)
        .setOriginalNotation('C7')
        .build();

      // Modify the chord's extensions
      chord.extensions.push({ type: 'add' as const, value: '9', position: 1 });

      // Original array should be unchanged
      expect(originalExtensions).toHaveLength(1);
    });

    it('should create independent extension arrays for each build', () => {
      builder
        .setRoot('C')
        .addExtensionByValue('maj', '7');

      const chord1 = builder.setOriginalNotation('C7').build();
      
      builder.addExtensionByValue('add', '9');
      const chord2 = builder.setOriginalNotation('C7add9').build();

      expect(chord1.extensions).toHaveLength(1);
      expect(chord2.extensions).toHaveLength(2);
    });
  });
});
