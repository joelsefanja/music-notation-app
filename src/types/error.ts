/**
 * Enumeration of error types that can occur in the application
 */
export enum ErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  TRANSPOSE_ERROR = 'TRANSPOSE_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_ERROR = 'FILE_ERROR'
}

/**
 * Application-specific error interface
 */
export interface AppError {
  /** Type of error that occurred */
  type: ErrorType;
  /** Human-readable error message */
  message: string;
  /** Additional context about the error */
  context?: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Optional stack trace */
  stack?: string;
  /** Optional error code for programmatic handling */
  code?: string;
}

/**
 * Result type for operations that may fail
 */
export type Result<T, E = AppError> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

/**
 * Validation result for type checking
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Array of validation errors if any */
  errors: string[];
  /** Warnings that don't prevent operation */
  warnings?: string[];
}