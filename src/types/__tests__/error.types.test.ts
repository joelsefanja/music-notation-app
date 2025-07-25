import { ErrorType, AppError, Result, ValidationResult } from '../error.types';

describe('Error Types', () => {
  describe('ErrorType enum', () => {
    it('should have all required error types', () => {
      expect(ErrorType.PARSE_ERROR).toBe('PARSE_ERROR');
      expect(ErrorType.CONVERSION_ERROR).toBe('CONVERSION_ERROR');
      expect(ErrorType.TRANSPOSE_ERROR).toBe('TRANSPOSE_ERROR');
      expect(ErrorType.FORMAT_ERROR).toBe('FORMAT_ERROR');
      expect(ErrorType.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorType.FILE_ERROR).toBe('FILE_ERROR');
    });

    it('should have exactly 6 error types', () => {
      const errorValues = Object.values(ErrorType);
      expect(errorValues).toHaveLength(6);
    });

    it('should contain only string values', () => {
      const errorValues = Object.values(ErrorType);
      errorValues.forEach(error => {
        expect(typeof error).toBe('string');
      });
    });
  });

  describe('AppError interface', () => {
    it('should accept valid error objects with all properties', () => {
      const error: AppError = {
        type: ErrorType.PARSE_ERROR,
        message: 'Failed to parse chord sheet',
        context: { line: 5, column: 10 },
        recoverable: true,
        stack: 'Error stack trace',
        code: 'PARSE_001'
      };

      expect(error.type).toBe(ErrorType.PARSE_ERROR);
      expect(error.message).toBe('Failed to parse chord sheet');
      expect(error.context).toEqual({ line: 5, column: 10 });
      expect(error.recoverable).toBe(true);
      expect(error.stack).toBe('Error stack trace');
      expect(error.code).toBe('PARSE_001');
    });

    it('should accept error with only required properties', () => {
      const error: AppError = {
        type: ErrorType.CONVERSION_ERROR,
        message: 'Conversion failed',
        recoverable: false
      };

      expect(error.type).toBe(ErrorType.CONVERSION_ERROR);
      expect(error.message).toBe('Conversion failed');
      expect(error.recoverable).toBe(false);
      expect(error.context).toBeUndefined();
      expect(error.stack).toBeUndefined();
      expect(error.code).toBeUndefined();
    });

    it('should accept all error types', () => {
      const errorTypes = Object.values(ErrorType);
      
      errorTypes.forEach(type => {
        const error: AppError = {
          type: type,
          message: `Test error for ${type}`,
          recoverable: true
        };
        expect(error.type).toBe(type);
      });
    });

    it('should accept various context types', () => {
      const contexts = [
        { line: 1, column: 5 },
        { chordIndex: 3 },
        { sectionName: 'Verse 1' },
        'String context',
        42,
        ['array', 'context'],
        null
      ];

      contexts.forEach(context => {
        const error: AppError = {
          type: ErrorType.VALIDATION_ERROR,
          message: 'Test error',
          context: context,
          recoverable: true
        };
        expect(error.context).toEqual(context);
      });
    });
  });

  describe('Result type', () => {
    it('should accept successful results', () => {
      const successResult: Result<string> = {
        success: true,
        data: 'Success data'
      };

      expect(successResult.success).toBe(true);
      if (successResult.success) {
        expect(successResult.data).toBe('Success data');
      }
    });

    it('should accept error results', () => {
      const errorResult: Result<string> = {
        success: false,
        error: {
          type: ErrorType.PARSE_ERROR,
          message: 'Parse failed',
          recoverable: false
        }
      };

      expect(errorResult.success).toBe(false);
      if (!errorResult.success) {
        expect(errorResult.error.type).toBe(ErrorType.PARSE_ERROR);
        expect(errorResult.error.message).toBe('Parse failed');
      }
    });

    it('should work with different data types', () => {
      const stringResult: Result<string> = {
        success: true,
        data: 'string data'
      };

      const numberResult: Result<number> = {
        success: true,
        data: 42
      };

      const objectResult: Result<{ id: string; name: string }> = {
        success: true,
        data: { id: '123', name: 'test' }
      };

      expect(stringResult.success).toBe(true);
      expect(numberResult.success).toBe(true);
      expect(objectResult.success).toBe(true);

      if (stringResult.success) expect(typeof stringResult.data).toBe('string');
      if (numberResult.success) expect(typeof numberResult.data).toBe('number');
      if (objectResult.success) expect(typeof objectResult.data).toBe('object');
    });

    it('should work with custom error types', () => {
      interface CustomError {
        code: number;
        details: string;
      }

      const customErrorResult: Result<string, CustomError> = {
        success: false,
        error: {
          code: 404,
          details: 'Not found'
        }
      };

      expect(customErrorResult.success).toBe(false);
      if (!customErrorResult.success) {
        expect(customErrorResult.error.code).toBe(404);
        expect(customErrorResult.error.details).toBe('Not found');
      }
    });
  });

  describe('ValidationResult interface', () => {
    it('should accept valid validation results', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Minor formatting issue']
      };

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);
      expect(validResult.warnings).toEqual(['Minor formatting issue']);
    });

    it('should accept invalid validation results', () => {
      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Missing required field', 'Invalid format'],
        warnings: ['Deprecated syntax used']
      };

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(2);
      expect(invalidResult.warnings).toHaveLength(1);
    });

    it('should accept validation result without warnings', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Critical error']
      };

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Critical error']);
      expect(result.warnings).toBeUndefined();
    });

    it('should accept validation result with empty arrays', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });
  });
});