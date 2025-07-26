import { Chord, Annotation } from '../chord';
import { AnnotationFormat } from '../format';

describe('Chord Types', () => {
  describe('Chord interface', () => {
    it('should accept valid chord objects', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: ['7'],
        bassNote: 'E',
        position: 0
      };

      expect(chord.root).toBe('C');
      expect(chord.quality).toBe('maj');
      expect(chord.extensions).toEqual(['7']);
      expect(chord.bassNote).toBe('E');
      expect(chord.position).toBe(0);
    });

    it('should accept chord without optional bassNote', () => {
      const chord: Chord = {
        root: 'F',
        quality: 'm',
        extensions: ['sus4'],
        position: 10
      };

      expect(chord.root).toBe('F');
      expect(chord.quality).toBe('m');
      expect(chord.extensions).toEqual(['sus4']);
      expect(chord.bassNote).toBeUndefined();
      expect(chord.position).toBe(10);
    });

    it('should accept chord with multiple extensions', () => {
      const chord: Chord = {
        root: 'G',
        quality: 'maj',
        extensions: ['7', 'add9', 'sus4'],
        position: 25
      };

      expect(chord.extensions).toEqual(['7', 'add9', 'sus4']);
      expect(chord.extensions).toHaveLength(3);
    });

    it('should accept chord with empty extensions array', () => {
      const chord: Chord = {
        root: 'A',
        quality: '',
        extensions: [],
        position: 5
      };

      expect(chord.extensions).toEqual([]);
      expect(chord.extensions).toHaveLength(0);
    });

    it('should require all mandatory properties', () => {
      // This test ensures TypeScript compilation fails without required properties
      const validChord: Chord = {
        root: 'D',
        quality: 'm',
        extensions: [],
        position: 15
      };

      expect(validChord.root).toBeDefined();
      expect(validChord.quality).toBeDefined();
      expect(validChord.extensions).toBeDefined();
      expect(validChord.position).toBeDefined();
    });
  });

  describe('Annotation interface', () => {
    it('should accept valid annotation objects', () => {
      const annotation: Annotation = {
        text: 'Slowly',
        format: AnnotationFormat.ONSONG,
        position: 'above'
      };

      expect(annotation.text).toBe('Slowly');
      expect(annotation.format).toBe(AnnotationFormat.ONSONG);
      expect(annotation.position).toBe('above');
    });

    it('should accept all valid position values', () => {
      const positions: Array<'above' | 'inline' | 'beside'> = ['above', 'inline', 'beside'];
      
      positions.forEach(pos => {
        const annotation: Annotation = {
          text: 'Test annotation',
          format: AnnotationFormat.SONGBOOK,
          position: pos
        };
        expect(annotation.position).toBe(pos);
      });
    });

    it('should accept all annotation formats', () => {
      const formats = [AnnotationFormat.ONSONG, AnnotationFormat.SONGBOOK, AnnotationFormat.PCO];
      
      formats.forEach(format => {
        const annotation: Annotation = {
          text: 'Test',
          format: format,
          position: 'above'
        };
        expect(annotation.format).toBe(format);
      });
    });

    it('should require all mandatory properties', () => {
      const validAnnotation: Annotation = {
        text: 'Required text',
        format: AnnotationFormat.PCO,
        position: 'inline'
      };

      expect(validAnnotation.text).toBeDefined();
      expect(validAnnotation.format).toBeDefined();
      expect(validAnnotation.position).toBeDefined();
    });
  });
});