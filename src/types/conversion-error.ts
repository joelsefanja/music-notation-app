/**
 * Enumeration of conversion error types
 */
export enum ConversionErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  KEY_ERROR = 'KEY_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONVERSION_ERROR = 'CONVERSION_ERROR'
}

/**
 * Detailed conversion error interface
 */
export interface ConversionError {
  type: ConversionErrorType;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  recoverable: boolean;
  context?: string;
  originalError?: Error;
}

/**
 * Error recovery strategy interface
 */
export interface RecoveryStrategy {
  canRecover(error: ConversionError): boolean;
  recover(error: ConversionError, input: string): string;
  getRecoveryMessage(error: ConversionError): string;
}

/**
 * Result type for operations that may have errors
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  errors: ConversionError[];
  warnings: string[];
}

/**
 * Factory for creating conversion errors
 */
export class ConversionErrorFactory {
  static createParseError(
    message: string, 
    line?: number, 
    column?: number, 
    suggestion?: string
  ): ConversionError {
    return {
      type: ConversionErrorType.PARSE_ERROR,
      message,
      line,
      column,
      suggestion: suggestion || 'Check the syntax of your chord sheet',
      recoverable: true,
      context: line ? `Line ${line}${column ? `, Column ${column}` : ''}` : undefined
    };
  }

  static createFormatError(
    message: string, 
    detectedFormat?: string, 
    expectedFormat?: string
  ): ConversionError {
    return {
      type: ConversionErrorType.FORMAT_ERROR,
      message,
      suggestion: expectedFormat 
        ? `Try converting to ${expectedFormat} format first`
        : 'Verify the input format is supported',
      recoverable: true,
      context: detectedFormat ? `Detected format: ${detectedFormat}` : undefined
    };
  }

  static createKeyError(
    message: string, 
    sourceKey?: string, 
    targetKey?: string
  ): ConversionError {
    return {
      type: ConversionErrorType.KEY_ERROR,
      message,
      suggestion: 'Check that both source and target keys are valid musical keys',
      recoverable: true,
      context: sourceKey && targetKey 
        ? `Transposing from ${sourceKey} to ${targetKey}` 
        : undefined
    };
  }

  static createFileError(
    message: string, 
    filename?: string, 
    fileSize?: number
  ): ConversionError {
    return {
      type: ConversionErrorType.FILE_ERROR,
      message,
      suggestion: 'Ensure the file is a valid text file and not corrupted',
      recoverable: false,
      context: filename ? `File: ${filename}${fileSize ? ` (${fileSize} bytes)` : ''}` : undefined
    };
  }

  static createValidationError(
    message: string, 
    field?: string, 
    value?: string
  ): ConversionError {
    return {
      type: ConversionErrorType.VALIDATION_ERROR,
      message,
      suggestion: 'Check the input values and try again',
      recoverable: true,
      context: field && value ? `Field: ${field}, Value: ${value}` : undefined
    };
  }

  static createConversionError(
    message: string, 
    originalError?: Error
  ): ConversionError {
    return {
      type: ConversionErrorType.CONVERSION_ERROR,
      message,
      suggestion: 'Try a different conversion approach or check the input format',
      recoverable: true,
      originalError
    };
  }
}