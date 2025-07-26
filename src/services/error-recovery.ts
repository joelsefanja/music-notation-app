import { ConversionError, ConversionErrorType, RecoveryStrategy } from '../types/conversion-error';

/**
 * Recovery strategy for parse errors
 */
class ParseErrorRecovery implements RecoveryStrategy {
  canRecover(error: ConversionError): boolean {
    return error.type === ConversionErrorType.PARSE_ERROR && error.recoverable;
  }

  recover(error: ConversionError, input: string): string {
    let result = input;
    
    // Fix common chord notation issues
    result = this.fixChordNotation(result);
    
    // Fix bracket mismatches
    result = this.fixBracketMismatches(result);
    
    // Clean up whitespace
    result = this.cleanupWhitespace(result);
    
    return result;
  }

  getRecoveryMessage(): string {
    return 'Attempted to fix common chord notation and formatting issues.';
  }

  private fixChordNotation(input: string): string {
    // Fix common chord notation mistakes
    return input
      // Fix sharp/flat notation
      .replace(/([A-G])#/g, '$1#')
      .replace(/([A-G])b/g, '$1b')
      // Fix chord quality notation
      .replace(/([A-G][#b]?)min/g, '$1m')
      .replace(/([A-G][#b]?)major/g, '$1maj')
      // Fix slash chord notation
      .replace(/([A-G][#b]?[^/\s]*)\s*\/\s*([A-G][#b]?)/g, '$1/$2');
  }

  private fixBracketMismatches(input: string): string {
    const lines = input.split('\n');
    return lines.map(line => {
      // Count brackets
      const openBrackets = (line.match(/\[/g) || []).length;
      const closeBrackets = (line.match(/\]/g) || []).length;
      
      // Add missing closing brackets
      if (openBrackets > closeBrackets) {
        return line + ']'.repeat(openBrackets - closeBrackets);
      }
      
      return line;
    }).join('\n');
  }

  private cleanupWhitespace(input: string): string {
    return input
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }
}

/**
 * Recovery strategy for format errors
 */
class FormatErrorRecovery implements RecoveryStrategy {
  canRecover(error: ConversionError): boolean {
    return error.type === ConversionErrorType.FORMAT_ERROR && error.recoverable;
  }

  recover(_error: ConversionError, input: string): string {
    // Try to convert to a more standard format
    return this.normalizeToOnSongFormat(input);
  }

  getRecoveryMessage(): string {
    return 'Converted to OnSong format as a fallback.';
  }

  private normalizeToOnSongFormat(input: string): string {
    let result = input;
    
    // Convert various chord notations to OnSong brackets
    result = result.replace(/\{([^}]+)\}/g, '[$1]'); // ChordPro to OnSong
    result = result.replace(/\b([A-G][#b]?(?:m|maj|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?)\b/g, 
      (match, chord) => {
        // Only wrap if not already in brackets
        return match.includes('[') ? match : `[${chord}]`;
      });
    
    return result;
  }
}

/**
 * Recovery strategy for key errors
 */
class KeyErrorRecovery implements RecoveryStrategy {
  canRecover(error: ConversionError): boolean {
    return error.type === ConversionErrorType.KEY_ERROR && error.recoverable;
  }

  recover(_error: ConversionError, input: string): string {
    // For key errors, we typically can't recover the input itself
    // The recovery would happen at the conversion level
    return input;
  }

  getRecoveryMessage(): string {
    return 'Key transposition failed. Using original key.';
  }
}

/**
 * Recovery strategy for validation errors
 */
class ValidationErrorRecovery implements RecoveryStrategy {
  canRecover(error: ConversionError): boolean {
    return error.type === ConversionErrorType.VALIDATION_ERROR && error.recoverable;
  }

  recover(_error: ConversionError, input: string): string {
    // Basic input sanitization
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
  }

  getRecoveryMessage(): string {
    return 'Input has been sanitized and cleaned up.';
  }
}

/**
 * Error recovery service that provides strategies for handling conversion errors
 */
export class ErrorRecovery {
  private static strategies: RecoveryStrategy[] = [
    new ParseErrorRecovery(),
    new FormatErrorRecovery(),
    new KeyErrorRecovery(),
    new ValidationErrorRecovery()
  ];

  /**
   * Attempt to recover from a conversion error
   */
  static recoverFromError(error: ConversionError, input: string): string {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        return strategy.recover(error, input);
      }
    }
    
    // Fallback: return original input
    return input;
  }

  /**
   * Get recovery suggestions for an error
   */
  static getRecoveryMessage(error: ConversionError): string {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        return strategy.getRecoveryMessage(error);
      }
    }
    
    return 'Unable to automatically recover from this error. Please check your input and try again.';
  }

  /**
   * Suggest format corrections based on error
   */
  static suggestFormatCorrection(error: ConversionError): string[] {
    const suggestions: string[] = [];
    
    switch (error.type) {
      case ConversionErrorType.FORMAT_ERROR:
        suggestions.push('Try manually selecting the correct input format');
        suggestions.push('Check if the content matches the expected format patterns');
        break;
        
      case ConversionErrorType.PARSE_ERROR:
        suggestions.push('Verify chord syntax (e.g., C, Am, F#m)');
        suggestions.push('Check for missing brackets or braces');
        suggestions.push('Ensure proper line breaks between sections');
        break;
        
      case ConversionErrorType.KEY_ERROR:
        suggestions.push('Use standard key notation (C, D, E, F, G, A, B with optional # or b)');
        suggestions.push('Try transposing to a simpler key first');
        break;
        
      default:
        suggestions.push('Check the input format and content');
        suggestions.push('Try a different conversion approach');
    }
    
    return suggestions;
  }

  /**
   * Perform fallback conversion when all else fails
   */
  static fallbackConversion(input: string): string {
    // Basic cleanup and formatting
    let result = input;
    
    // Normalize line endings
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove excessive whitespace
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Trim each line
    result = result.split('\n').map(line => line.trim()).join('\n');
    
    return result;
  }
}