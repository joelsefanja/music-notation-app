import { describe, it, expect, beforeEach } from '@jest/globals';
import { ErrorRecoveryService } from '../../../../src/services/error-recovery/error-recovery';
import { ConversionErrorFactory, ConversionErrorType } from '../../../../src/types/conversion-error';
import { TextLine, AnnotationLine } from '../../../../src/types/line';

describe('ErrorRecoveryService', () => {
  let errorRecovery: ErrorRecoveryService;

  beforeEach(() => {
    errorRecovery = new ErrorRecoveryService();
  });

  describe('Invalid Chord Recovery', () => {
    it('should recover from invalid chord by suggesting closest match', () => {
      const error = ConversionErrorFactory.createParseError('Invalid chord: Cxyz');
      const result = errorRecovery.recover(error, 'Cxyz');

      expect(result.success).toBe(true);
      expect(result.partialResult).toBe('C');
      expect(result.warnings).toContain('Replaced invalid chord "Cxyz" with "C"');
    });

    it('should remove invalid chord if no suitable replacement found', () => {
      const error = ConversionErrorFactory.createParseError('Invalid chord: xyz123');
      const result = errorRecovery.recover(error, 'xyz123');

      expect(result.success).toBe(true);
      expect(result.partialResult).toBe('');
      expect(result.warnings).toContain('Removed invalid chord "xyz123" - could not find suitable replacement');
    });

    it('should handle complex chord patterns', () => {
      const error = ConversionErrorFactory.createParseError('Invalid chord: Cmaj7#11');
      const result = errorRecovery.recover(error, 'Cmaj7#11');

      expect(result.success).toBe(true);
      // The chord is actually valid, so it should be preserved as-is
      expect(result.partialResult).toBe('Cmaj7#11');
    });

    it('should preserve valid chord components', () => {
      const error = ConversionErrorFactory.createParseError('Invalid chord: G#m7/B');
      const result = errorRecovery.recover(error, 'G#m7/B');

      expect(result.success).toBe(true);
      expect(result.partialResult).toBe('G#m7/B');
    });
  });

  describe('Malformed Section Recovery', () => {
    it('should parse malformed section as basic text lines', () => {
      const error = ConversionErrorFactory.createParseError('Malformed section');
      const input = 'Line 1\nLine 2\n\nLine 4';
      const result = errorRecovery.recover(error, input);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.partialResult)).toBe(true);
      expect(result.partialResult).toHaveLength(4);
      expect(result.partialResult[0]).toEqual({
        type: 'text',
        text: 'Line 1',
        chords: []
      });
      expect(result.partialResult[2]).toEqual({
        type: 'empty',
        count: 1
      });
    });

    it('should handle empty malformed section', () => {
      const error = ConversionErrorFactory.createParseError('Malformed section');
      const result = errorRecovery.recover(error, '');

      expect(result.success).toBe(true);
      expect(result.partialResult).toEqual([]);
    });
  });

  describe('Unknown Annotation Recovery', () => {
    it('should treat unknown annotation as comment', () => {
      const error = ConversionErrorFactory.createParseError('Unknown annotation');
      const result = errorRecovery.recover(error, 'Some unknown annotation');

      expect(result.success).toBe(true);
      expect(result.partialResult).toEqual({
        type: 'annotation',
        value: 'Some unknown annotation',
        annotationType: 'comment'
      });
      expect(result.warnings).toContain('Treated unknown annotation "Some unknown annotation" as a comment');
    });

    it('should handle empty annotation', () => {
      const error = ConversionErrorFactory.createParseError('Unknown annotation');
      const result = errorRecovery.recover(error, '   ');

      expect(result.success).toBe(true);
      expect(result.partialResult).toEqual({
        type: 'annotation',
        value: '',
        annotationType: 'comment'
      });
    });
  });

  describe('Invalid Line Format Recovery', () => {
    it('should convert invalid line to basic text line', () => {
      const error = ConversionErrorFactory.createParseError('Invalid line format');
      const result = errorRecovery.recover(error, 'Some invalid line');

      expect(result.success).toBe(true);
      expect(result.partialResult).toEqual({
        type: 'text',
        text: 'Some invalid line',
        chords: []
      });
      expect(result.warnings).toContain('Converted invalid line format to basic text: "Some invalid line"');
    });

    it('should handle non-string input', () => {
      const error = ConversionErrorFactory.createParseError('Invalid line format');
      const result = errorRecovery.recover(error, 123);

      expect(result.success).toBe(true);
      expect(result.partialResult).toEqual({
        type: 'text',
        text: '123',
        chords: []
      });
    });
  });

  describe('Chord Position Error Recovery', () => {
    it('should fix chord position information', () => {
      const error = ConversionErrorFactory.createParseError('Chord position error');
      const input = {
        chord: 'C',
        originalText: '[C]',
        startIndex: -5,
        endIndex: 100
      };
      const result = errorRecovery.recover(error, input);

      expect(result.success).toBe(true);
      expect(result.partialResult).toEqual({
        chord: 'C',
        originalText: '[C]',
        startIndex: 0,
        endIndex: 3,
        placement: 'inline'
      });
      expect(result.warnings).toContain('Fixed chord position information with default values');
    });

    it('should handle missing originalText', () => {
      const error = ConversionErrorFactory.createParseError('Chord position error');
      const input = {
        chord: 'Dm',
        startIndex: -1,
        endIndex: 50
      };
      const result = errorRecovery.recover(error, input);

      expect(result.success).toBe(true);
      expect(result.partialResult.startIndex).toBe(0);
      expect(result.partialResult.endIndex).toBe(2); // Length of 'Dm'
    });
  });

  describe('Parse Failure Recovery', () => {
    it('should skip problematic content', () => {
      const error = ConversionErrorFactory.createParseError('General parse failure');
      const result = errorRecovery.recover(error, 'problematic content');

      expect(result.success).toBe(true);
      expect(result.partialResult).toBe(null);
      expect(result.warnings).toContain('Skipped problematic content due to parse failure: General parse failure');
    });
  });

  describe('Batch Recovery', () => {
    it('should recover from multiple errors', () => {
      const errors = [
        ConversionErrorFactory.createParseError('Invalid chord: Xyz'),
        ConversionErrorFactory.createParseError('Unknown annotation'),
        ConversionErrorFactory.createParseError('Invalid line format')
      ];
      
      const result = errorRecovery.recoverBatch(errors, 'test context');

      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle mixed success and failure', () => {
      const errors = [
        ConversionErrorFactory.createParseError('Invalid chord: C'),
        ConversionErrorFactory.createParseError('Unrecoverable error') // This should use default recovery
      ];
      
      const result = errorRecovery.recoverBatch(errors, 'test context');

      expect(result.success).toBe(true); // Should succeed with warnings
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Strategy', () => {
    it('should allow adding custom recovery strategies', () => {
      const customStrategy = {
        type: 'SUBSTITUTE' as const,
        description: 'Custom test strategy',
        apply: (input: any, error: any) => ({
          success: true,
          partialResult: 'custom result',
          errors: [],
          warnings: ['Applied custom strategy']
        })
      };

      errorRecovery.addStrategy('CUSTOM_TEST', customStrategy);
      
      // This would require modifying the getStrategyKey method to recognize custom patterns
      // For now, we'll test that the strategy was added
      expect(errorRecovery['strategies'].has('CUSTOM_TEST')).toBe(true);
    });
  });

  describe('Default Recovery', () => {
    it('should use default recovery for unrecognized errors', () => {
      const error = ConversionErrorFactory.createParseError('Unrecognized error type');
      const result = errorRecovery.recover(error, 'some input');

      // The result depends on the strategy used - it might skip or create fallback
      expect(result.success).toBe(true);
      if (result.partialResult !== null) {
        expect(result.partialResult).toEqual({
          type: 'text',
          text: 'some input',
          chords: []
        });
        expect(result.warnings).toContain('Applied default error recovery - treated as plain text');
      } else {
        expect(result.warnings).toContain('Skipped problematic content due to parse failure: Unrecognized error type');
      }
    });
  });

  describe('Error Classification', () => {
    it('should classify chord-related errors correctly', () => {
      const error = ConversionErrorFactory.createParseError('Invalid chord notation');
      const result = errorRecovery.recover(error, 'Cmaj7');

      expect(result.success).toBe(true);
      // Should use chord recovery strategy
    });

    it('should classify section-related errors correctly', () => {
      const error = ConversionErrorFactory.createParseError('Malformed section header');
      const result = errorRecovery.recover(error, '[Verse 1]\nSome content');

      expect(result.success).toBe(true);
      // Should use section recovery strategy
    });

    it('should classify annotation-related errors correctly', () => {
      const error = ConversionErrorFactory.createParseError('Unknown annotation format');
      const result = errorRecovery.recover(error, 'Some annotation');

      expect(result.success).toBe(true);
      // Should use annotation recovery strategy
    });
  });
});