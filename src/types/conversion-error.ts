/**
 * Enumeration of specific error types for better classification and recovery.
 */
export enum ConversionErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  KEY_ERROR = 'KEY_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  TRANSPOSE_ERROR = 'TRANSPOSE_ERROR'
}

/**
 * Interface for a detailed conversion error with enhanced information
 */
export interface ConversionError {
  type: ConversionErrorType;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  recoverable: boolean;
  originalInput?: string;
  context?: string;
}

/**
 * Factory for creating ConversionError instances.
 */
export class ConversionErrorFactory {
  static createParseError(message: string, lineNumber?: number, columnNumber?: number, suggestion?: string, originalInput?: string): ConversionError {
    return {
      type: ConversionErrorType.PARSE_ERROR,
      message,
      line: lineNumber,
      column: columnNumber,
      suggestion,
      recoverable: true,
      originalInput,
      context: originalInput
    };
  }

  static createValidationError(message: string, lineNumber?: number, columnNumber?: number, suggestion?: string, originalInput?: string): ConversionError {
    return {
      type: ConversionErrorType.VALIDATION_ERROR,
      message,
      line: lineNumber,
      column: columnNumber,
      suggestion,
      recoverable: true,
      originalInput,
      context: originalInput
    };
  }

  static createConversionError(message: string, originalInput?: string): ConversionError {
    return {
      type: ConversionErrorType.CONVERSION_ERROR,
      message,
      recoverable: false,
      originalInput,
      context: originalInput
    };
  }

  static createFileError(message: string): ConversionError {
    return {
      type: ConversionErrorType.FILE_ERROR,
      message,
      recoverable: false
    };
  }

  static createUnknownError(message: string): ConversionError {
    return {
      type: ConversionErrorType.UNKNOWN_ERROR,
      message,
      recoverable: false
    };
  }
}
