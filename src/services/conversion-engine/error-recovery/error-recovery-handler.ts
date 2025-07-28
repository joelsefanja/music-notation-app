/**
 * Error Recovery Handler implementation using Chain of Responsibility pattern
 * Provides flexible error handling with multiple recovery strategies
 */

import { 
  IErrorRecoveryHandler, 
  ErrorRecoveryResult 
} from '../../../types/interfaces/core-interfaces';
import { ConversionError } from '../../../types/conversion-error';

/**
 * Abstract base class for error recovery handlers
 */
export abstract class ErrorRecoveryHandler implements IErrorRecoveryHandler {
  protected nextHandler?: IErrorRecoveryHandler;

  /**
   * Set the next handler in the chain
   */
  setNext(handler: IErrorRecoveryHandler): IErrorRecoveryHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Handle an error, potentially passing it to the next handler
   */
  async handle(error: ConversionError, context: any): Promise<ErrorRecoveryResult> {
    if (this.canHandle(error)) {
      const result = await this.doHandle(error, context);
      
      // If this handler succeeded, return the result
      if (result.success) {
        return result;
      }
    }

    // If this handler can't handle the error or failed, try the next handler
    if (this.nextHandler) {
      return this.nextHandler.handle(error, context);
    }

    // No handler could process this error
    return {
      success: false,
      errors: [error],
      warnings: ['No recovery handler could process this error']
    };
  }

  /**
   * Check if this handler can handle the given error
   */
  abstract canHandle(error: ConversionError): boolean;

  /**
   * Perform the actual error handling
   */
  protected abstract doHandle(error: ConversionError, context: any): Promise<ErrorRecoveryResult>;
}

/**
 * Handler for invalid chord errors
 */
export class InvalidChordRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: ConversionError): boolean {
    return error.type === 'PARSE_ERROR' && 
           (error.message.toLowerCase().includes('chord') || 
            error.message.toLowerCase().includes('invalid'));
  }

  protected async doHandle(error: ConversionError, context: string): Promise<ErrorRecoveryResult> {
    if (typeof context !== 'string') {
      return {
        success: false,
        errors: [error],
        warnings: ['Invalid context for chord recovery']
      };
    }

    const correctedChord = this.suggestChordCorrection(context);
    
    if (correctedChord && correctedChord !== context) {
      return {
        success: true,
        partialResult: this.createTextLine(correctedChord, error.line || 0),
        errors: [],
        warnings: [`Corrected invalid chord: "${context}" -> "${correctedChord}"`]
      };
    }

    // If we can't correct it, treat as plain text
    return {
      success: true,
      partialResult: this.createTextLine(context, error.line || 0),
      errors: [],
      warnings: [`Could not correct chord "${context}", treated as plain text`]
    };
  }

  private suggestChordCorrection(invalidChord: string): string {
    // Remove invalid characters but keep chord-like structure
    let corrected = invalidChord.replace(/[^A-G#b0-9msujdimaugadd]/gi, '');
    
    // Ensure it starts with a valid root note
    const rootMatch = corrected.match(/^[A-G][#b]?/);
    if (!rootMatch) {
      // Try to find a root note anywhere in the string
      const anyRootMatch = corrected.match(/[A-G][#b]?/);
      if (anyRootMatch) {
        corrected = anyRootMatch[0] + corrected.replace(anyRootMatch[0], '');
      } else {
        // Default to C if no root found
        corrected = 'C' + corrected;
      }
    }

    return corrected || invalidChord;
  }

  private createTextLine(text: string, lineNumber: number): any {
    return {
      type: 'text',
      text,
      chords: [],
      lineNumber
    };
  }
}

/**
 * Handler for malformed section errors
 */
export class MalformedSectionRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: ConversionError): boolean {
    return error.type === 'PARSE_ERROR' && 
           (error.message.toLowerCase().includes('section') || 
            error.message.toLowerCase().includes('annotation'));
  }

  protected async doHandle(error: ConversionError, context: string): Promise<ErrorRecoveryResult> {
    if (typeof context !== 'string') {
      return {
        success: false,
        errors: [error],
        warnings: ['Invalid context for section recovery']
      };
    }

    const cleanedSection = this.cleanSectionContent(context);
    
    if (cleanedSection && cleanedSection.length > 0) {
      return {
        success: true,
        partialResult: this.createAnnotationLine(cleanedSection, error.line || 0),
        errors: [],
        warnings: [`Cleaned malformed section: "${context}" -> "${cleanedSection}"`]
      };
    }

    // If we can't clean it, treat as comment
    return {
      success: true,
      partialResult: this.createAnnotationLine(context, error.line || 0, 'comment'),
      errors: [],
      warnings: [`Could not clean section "${context}", treated as comment`]
    };
  }

  private cleanSectionContent(content: string): string {
    // Remove common problematic characters but preserve meaningful content
    const cleaned = content
      .replace(/[^\w\s\-:()[\]]/g, '') // Keep alphanumeric, spaces, hyphens, colons, parentheses, brackets
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Try to extract section-like patterns
    const sectionPatterns = [
      /\b(verse|chorus|bridge|intro|outro|pre-chorus|post-chorus)\b/i,
      /\b(v|c|b)\d*\b/i,
      /\[(.*?)\]/,
      /\((.*?)\)/
    ];

    for (const pattern of sectionPatterns) {
      const match = cleaned.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return cleaned;
  }

  private createAnnotationLine(value: string, lineNumber: number, type: 'section' | 'comment' = 'section'): any {
    return {
      type: 'annotation',
      value,
      annotationType: type,
      lineNumber
    };
  }
}

/**
 * Handler for format validation errors
 */
export class FormatValidationRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: ConversionError): boolean {
    return error.type === 'VALIDATION_ERROR' || 
           error.type === 'FORMAT_ERROR';
  }

  protected async doHandle(error: ConversionError, context: string): Promise<ErrorRecoveryResult> {
    if (typeof context !== 'string') {
      return {
        success: false,
        errors: [error],
        warnings: ['Invalid context for format validation recovery']
      };
    }

    // Try to detect and fix common format issues
    const fixedContent = this.fixCommonFormatIssues(context);
    
    if (fixedContent !== context) {
      return {
        success: true,
        partialResult: this.createTextLine(fixedContent, error.line || 0),
        errors: [],
        warnings: [`Fixed format issue: "${context}" -> "${fixedContent}"`]
      };
    }

    // If we can't fix it, treat as plain text
    return {
      success: true,
      partialResult: this.createTextLine(context, error.line || 0),
      errors: [],
      warnings: [`Could not fix format issue, treated as plain text: "${context}"`]
    };
  }

  private fixCommonFormatIssues(content: string): string {
    let fixed = content;

    // Fix unmatched brackets
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    
    if (openBrackets > closeBrackets) {
      fixed += ']'.repeat(openBrackets - closeBrackets);
    } else if (closeBrackets > openBrackets) {
      fixed = '['.repeat(closeBrackets - openBrackets) + fixed;
    }

    // Fix unmatched parentheses
    const openParens = (fixed.match(/\(/g) || []).length;
    const closeParens = (fixed.match(/\)/g) || []).length;
    
    if (openParens > closeParens) {
      fixed += ')'.repeat(openParens - closeParens);
    } else if (closeParens > openParens) {
      fixed = '('.repeat(closeParens - openParens) + fixed;
    }

    // Fix unmatched braces
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      fixed += '}'.repeat(openBraces - closeBraces);
    } else if (closeBraces > openBraces) {
      fixed = '{'.repeat(closeBraces - openBraces) + fixed;
    }

    return fixed;
  }

  private createTextLine(text: string, lineNumber: number): any {
    return {
      type: 'text',
      text,
      chords: [],
      lineNumber
    };
  }
}

/**
 * Handler for encoding and character errors
 */
export class EncodingRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: ConversionError): boolean {
    return error.message.toLowerCase().includes('encoding') ||
           error.message.toLowerCase().includes('character') ||
           error.message.toLowerCase().includes('unicode');
  }

  protected async doHandle(error: ConversionError, context: string): Promise<ErrorRecoveryResult> {
    if (typeof context !== 'string') {
      return {
        success: false,
        errors: [error],
        warnings: ['Invalid context for encoding recovery']
      };
    }

    const cleanedContent = this.cleanEncodingIssues(context);
    
    return {
      success: true,
      partialResult: this.createTextLine(cleanedContent, error.line || 0),
      errors: [],
      warnings: [`Cleaned encoding issues: "${context}" -> "${cleanedContent}"`]
    };
  }

  private cleanEncodingIssues(content: string): string {
    let cleaned = content;

    // Replace common encoding issues
    const encodingFixes: Record<string, string> = {
      'â€™': "'",
      'â€œ': '"',
      'â€': '"',
      'â€"': '–',
      'â€"': '—',
      'Ã¡': 'á',
      'Ã©': 'é',
      'Ã­': 'í',
      'Ã³': 'ó',
      'Ãº': 'ú',
      'Ã±': 'ñ',
      'Ã¼': 'ü'
    };

    for (const [wrong, correct] of Object.entries(encodingFixes)) {
      cleaned = cleaned.replace(new RegExp(wrong, 'g'), correct);
    }

    // Remove or replace other problematic characters
    cleaned = cleaned
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '?'); // Replace non-printable with ?

    return cleaned;
  }

  private createTextLine(text: string, lineNumber: number): any {
    return {
      type: 'text',
      text,
      chords: [],
      lineNumber
    };
  }
}

/**
 * Fallback handler that handles any remaining errors
 */
export class FallbackRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: ConversionError): boolean {
    return true; // This handler accepts all errors as a last resort
  }

  protected async doHandle(error: ConversionError, context: any): Promise<ErrorRecoveryResult> {
    // Convert context to string if possible
    const contextString = typeof context === 'string' ? context : String(context || '');
    
    if (contextString.trim().length === 0) {
      // Empty context, create empty line
      return {
        success: true,
        partialResult: this.createEmptyLine(error.line || 0),
        errors: [],
        warnings: ['Empty content recovered as empty line']
      };
    }

    // Treat everything as plain text as last resort
    return {
      success: true,
      partialResult: this.createTextLine(contextString, error.line || 0),
      errors: [],
      warnings: [`Fallback recovery: treated as plain text: "${contextString}"`]
    };
  }

  private createTextLine(text: string, lineNumber: number): any {
    return {
      type: 'text',
      text,
      chords: [],
      lineNumber
    };
  }

  private createEmptyLine(lineNumber: number): any {
    return {
      type: 'empty',
      count: 1,
      lineNumber
    };
  }
}