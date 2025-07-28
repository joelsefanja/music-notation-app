/**
 * Interface for format validators
 */
export interface FormatValidator {
  isValid(text: string): boolean;
}