import * as Types from '../index';

describe('Types Index', () => {
  describe('Format Types Exports', () => {
    it('should export NotationFormat enum', () => {
      expect(Types.NotationFormat).toBeDefined();
      expect(Types.NotationFormat.NASHVILLE).toBe('nashville');
      expect(Types.NotationFormat.ONSONG).toBe('onsong');
    });

    it('should export SectionType enum', () => {
      expect(Types.SectionType).toBeDefined();
      expect(Types.SectionType.VERSE).toBe('verse');
      expect(Types.SectionType.CHORUS).toBe('chorus');
    });

    it('should export AnnotationFormat enum', () => {
      expect(Types.AnnotationFormat).toBeDefined();
      expect(Types.AnnotationFormat.ONSONG).toBe('onsong');
      expect(Types.AnnotationFormat.SONGBOOK).toBe('songbook');
    });
  });

  describe('Core Data Model Exports', () => {
    it('should export Chord interface', () => {
      // Test that we can create a valid Chord object using the exported type
      const chord: Types.Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        position: 0
      };
      expect(chord.root).toBe('C');
    });

    it('should export Annotation interface', () => {
      const annotation: Types.Annotation = {
        text: 'Test',
        format: Types.AnnotationFormat.ONSONG,
        position: 'above'
      };
      expect(annotation.text).toBe('Test');
    });

    it('should export Section interface', () => {
      const section: Types.Section = {
        type: Types.SectionType.VERSE,
        name: 'Verse 1',
        content: 'Test content',
        chords: [],
        annotations: []
      };
      expect(section.type).toBe(Types.SectionType.VERSE);
    });

    it('should export Metadata interface', () => {
      const metadata: Types.Metadata = {
        title: 'Test Song',
        artist: 'Test Artist'
      };
      expect(metadata.title).toBe('Test Song');
    });

    it('should export ChordSheet interface', () => {
      const chordSheet: Types.ChordSheet = {
        id: 'test-id',
        format: Types.NotationFormat.ONSONG,
        content: 'Test content',
        sections: [],
        metadata: {}
      };
      expect(chordSheet.id).toBe('test-id');
    });
  });

  describe('Error Handling Exports', () => {
    it('should export ErrorType enum', () => {
      expect(Types.ErrorType).toBeDefined();
      expect(Types.ErrorType.PARSE_ERROR).toBe('PARSE_ERROR');
      expect(Types.ErrorType.CONVERSION_ERROR).toBe('CONVERSION_ERROR');
    });

    it('should export AppError interface', () => {
      const error: Types.AppError = {
        type: Types.ErrorType.PARSE_ERROR,
        message: 'Test error',
        recoverable: true
      };
      expect(error.type).toBe(Types.ErrorType.PARSE_ERROR);
    });

    it('should export Result type', () => {
      const successResult: Types.Result<string> = {
        success: true,
        data: 'Success'
      };
      expect(successResult.success).toBe(true);

      const errorResult: Types.Result<string> = {
        success: false,
        error: {
          type: Types.ErrorType.VALIDATION_ERROR,
          message: 'Validation failed',
          recoverable: true
        }
      };
      expect(errorResult.success).toBe(false);
    });

    it('should export ValidationResult interface', () => {
      const validationResult: Types.ValidationResult = {
        isValid: true,
        errors: []
      };
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('Type Integration', () => {
    it('should allow creating complex objects using all exported types', () => {
      const chord: Types.Chord = {
        root: 'C',
        quality: 'maj',
        extensions: ['7'],
        position: 0
      };

      const annotation: Types.Annotation = {
        text: 'Slowly',
        format: Types.AnnotationFormat.ONSONG,
        position: 'above'
      };

      const section: Types.Section = {
        type: Types.SectionType.VERSE,
        name: 'Verse 1',
        content: '[C7]Amazing grace',
        chords: [chord],
        annotations: [annotation]
      };

      const metadata: Types.Metadata = {
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'C'
      };

      const chordSheet: Types.ChordSheet = {
        id: 'integration-test',
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'C',
        format: Types.NotationFormat.ONSONG,
        content: '[C7]Amazing grace how sweet the sound',
        sections: [section],
        metadata: metadata
      };

      const result: Types.Result<Types.ChordSheet> = {
        success: true,
        data: chordSheet
      };

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sections[0].chords[0].extensions).toEqual(['7']);
        expect(result.data.sections[0].annotations[0].format).toBe(Types.AnnotationFormat.ONSONG);
      }
    });
  });
});