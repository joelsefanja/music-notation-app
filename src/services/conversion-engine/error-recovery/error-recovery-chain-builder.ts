/**
 * Error Recovery Chain Builder implementation
 * Builds chains of error recovery handlers using the Chain of Responsibility pattern
 */

import { IErrorRecoveryHandler } from '../../../types/interfaces/core-interfaces';
import {
  ErrorRecoveryHandler,
  InvalidChordRecoveryHandler,
  MalformedSectionRecoveryHandler,
  FormatValidationRecoveryHandler,
  EncodingRecoveryHandler,
  FallbackRecoveryHandler
} from './error-recovery-handler';

/**
 * Builder for creating error recovery handler chains
 */
export class ErrorRecoveryChainBuilder {
  private firstHandler?: IErrorRecoveryHandler;
  private currentHandler?: IErrorRecoveryHandler;

  /**
   * Add a handler to the chain
   */
  addHandler(handler: IErrorRecoveryHandler): ErrorRecoveryChainBuilder {
    if (!this.firstHandler) {
      this.firstHandler = handler;
      this.currentHandler = handler;
    } else {
      this.currentHandler!.setNext(handler);
      this.currentHandler = handler;
    }
    return this;
  }

  /**
   * Add multiple handlers to the chain
   */
  addHandlers(handlers: IErrorRecoveryHandler[]): ErrorRecoveryChainBuilder {
    for (const handler of handlers) {
      this.addHandler(handler);
    }
    return this;
  }

  /**
   * Add an invalid chord recovery handler
   */
  addInvalidChordHandler(): ErrorRecoveryChainBuilder {
    return this.addHandler(new InvalidChordRecoveryHandler());
  }

  /**
   * Add a malformed section recovery handler
   */
  addMalformedSectionHandler(): ErrorRecoveryChainBuilder {
    return this.addHandler(new MalformedSectionRecoveryHandler());
  }

  /**
   * Add a format validation recovery handler
   */
  addFormatValidationHandler(): ErrorRecoveryChainBuilder {
    return this.addHandler(new FormatValidationRecoveryHandler());
  }

  /**
   * Add an encoding recovery handler
   */
  addEncodingHandler(): ErrorRecoveryChainBuilder {
    return this.addHandler(new EncodingRecoveryHandler());
  }

  /**
   * Add a fallback recovery handler (should be last in chain)
   */
  addFallbackHandler(): ErrorRecoveryChainBuilder {
    return this.addHandler(new FallbackRecoveryHandler());
  }

  /**
   * Build the default recovery chain
   */
  buildDefaultChain(): IErrorRecoveryHandler {
    return this.reset()
      .addInvalidChordHandler()
      .addMalformedSectionHandler()
      .addFormatValidationHandler()
      .addEncodingHandler()
      .addFallbackHandler()
      .build();
  }

  /**
   * Build a strict recovery chain (fewer recovery attempts)
   */
  buildStrictChain(): IErrorRecoveryHandler {
    return this.reset()
      .addInvalidChordHandler()
      .addFormatValidationHandler()
      .addFallbackHandler()
      .build();
  }

  /**
   * Build a permissive recovery chain (more recovery attempts)
   */
  buildPermissiveChain(): IErrorRecoveryHandler {
    return this.reset()
      .addInvalidChordHandler()
      .addMalformedSectionHandler()
      .addFormatValidationHandler()
      .addEncodingHandler()
      .addCustomHandler(new WhitespaceRecoveryHandler())
      .addCustomHandler(new SpecialCharacterRecoveryHandler())
      .addFallbackHandler()
      .build();
  }

  /**
   * Build a chain for specific format
   */
  buildFormatSpecificChain(format: string): IErrorRecoveryHandler {
    const builder = this.reset();

    switch (format.toLowerCase()) {
      case 'chordpro':
        return builder
          .addInvalidChordHandler()
          .addCustomHandler(new ChordProRecoveryHandler())
          .addFormatValidationHandler()
          .addFallbackHandler()
          .build();

      case 'onsong':
        return builder
          .addInvalidChordHandler()
          .addCustomHandler(new OnSongRecoveryHandler())
          .addMalformedSectionHandler()
          .addFormatValidationHandler()
          .addFallbackHandler()
          .build();

      case 'nashville':
        return builder
          .addCustomHandler(new NashvilleRecoveryHandler())
          .addInvalidChordHandler()
          .addFormatValidationHandler()
          .addFallbackHandler()
          .build();

      default:
        return this.buildDefaultChain();
    }
  }

  /**
   * Add a custom handler
   */
  addCustomHandler(handler: IErrorRecoveryHandler): ErrorRecoveryChainBuilder {
    return this.addHandler(handler);
  }

  /**
   * Build the handler chain
   */
  build(): IErrorRecoveryHandler {
    if (!this.firstHandler) {
      throw new Error('Chain must have at least one handler');
    }
    return this.firstHandler;
  }

  /**
   * Reset the builder
   */
  reset(): ErrorRecoveryChainBuilder {
    this.firstHandler = undefined;
    this.currentHandler = undefined;
    return this;
  }

  /**
   * Get the number of handlers in the chain
   */
  getHandlerCount(): number {
    let count = 0;
    let current = this.firstHandler;
    
    while (current) {
      count++;
      current = (current as any).nextHandler;
    }
    
    return count;
  }

  /**
   * Create a conditional chain based on error recovery level
   */
  buildConditionalChain(level: 'strict' | 'moderate' | 'permissive'): IErrorRecoveryHandler {
    switch (level) {
      case 'strict':
        return this.buildStrictChain();
      case 'moderate':
        return this.buildDefaultChain();
      case 'permissive':
        return this.buildPermissiveChain();
      default:
        return this.buildDefaultChain();
    }
  }
}

/**
 * Specialized recovery handlers for specific formats
 */

/**
 * ChordPro-specific recovery handler
 */
class ChordProRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: any): boolean {
    return error.message.toLowerCase().includes('chordpro') ||
           error.context?.includes('{') ||
           error.context?.includes('}');
  }

  protected async doHandle(error: any, context: string): Promise<any> {
    // Fix common ChordPro syntax issues
    let fixed = context;
    
    // Fix unmatched braces
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      fixed += '}'.repeat(openBraces - closeBraces);
    } else if (closeBraces > openBraces) {
      fixed = '{'.repeat(closeBraces - openBraces) + fixed;
    }

    // Fix common ChordPro directive issues
    fixed = fixed.replace(/\{([^}:]+)\}/g, '{comment:$1}'); // Add missing comment prefix

    return {
      success: true,
      partialResult: { type: 'text', text: fixed, chords: [], lineNumber: error.line || 0 },
      errors: [],
      warnings: [`Fixed ChordPro syntax: "${context}" -> "${fixed}"`]
    };
  }
}

/**
 * OnSong-specific recovery handler
 */
class OnSongRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: any): boolean {
    return error.message.toLowerCase().includes('onsong') ||
           error.context?.startsWith('*') ||
           error.context?.includes('[') && error.context?.includes(']');
  }

  protected async doHandle(error: any, context: string): Promise<any> {
    let fixed = context;
    
    // Fix OnSong comment syntax
    if (fixed.includes('*') && !fixed.startsWith('*')) {
      fixed = '*' + fixed.replace(/\*/g, '');
    }

    // Fix bracket chord syntax
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    
    if (openBrackets > closeBrackets) {
      fixed += ']'.repeat(openBrackets - closeBrackets);
    }

    return {
      success: true,
      partialResult: { type: 'text', text: fixed, chords: [], lineNumber: error.line || 0 },
      errors: [],
      warnings: [`Fixed OnSong syntax: "${context}" -> "${fixed}"`]
    };
  }
}

/**
 * Nashville-specific recovery handler
 */
class NashvilleRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: any): boolean {
    return error.message.toLowerCase().includes('nashville') ||
           /[1-7][#b]?[m°+]?/.test(error.context || '');
  }

  protected async doHandle(error: any, context: string): Promise<any> {
    // Try to fix Nashville number notation
    let fixed = context.replace(/[^1-7#bm°+\/]/g, '');
    
    // Ensure it starts with a valid number
    if (!/^[1-7]/.test(fixed)) {
      const numberMatch = fixed.match(/[1-7]/);
      if (numberMatch) {
        fixed = numberMatch[0] + fixed.replace(numberMatch[0], '');
      } else {
        fixed = '1' + fixed; // Default to 1
      }
    }

    return {
      success: true,
      partialResult: { type: 'text', text: fixed, chords: [], lineNumber: error.line || 0 },
      errors: [],
      warnings: [`Fixed Nashville notation: "${context}" -> "${fixed}"`]
    };
  }
}

/**
 * Whitespace recovery handler
 */
class WhitespaceRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: any): boolean {
    return error.message.toLowerCase().includes('whitespace') ||
           /^\s*$/.test(error.context || '');
  }

  protected async doHandle(error: any, context: string): Promise<any> {
    const normalized = context.replace(/\s+/g, ' ').trim();
    
    if (normalized.length === 0) {
      return {
        success: true,
        partialResult: { type: 'empty', count: 1, lineNumber: error.line || 0 },
        errors: [],
        warnings: ['Converted whitespace-only content to empty line']
      };
    }

    return {
      success: true,
      partialResult: { type: 'text', text: normalized, chords: [], lineNumber: error.line || 0 },
      errors: [],
      warnings: [`Normalized whitespace: "${context}" -> "${normalized}"`]
    };
  }
}

/**
 * Special character recovery handler
 */
class SpecialCharacterRecoveryHandler extends ErrorRecoveryHandler {
  canHandle(error: any): boolean {
    return error.message.toLowerCase().includes('special') ||
           error.message.toLowerCase().includes('character') ||
           /[^\x20-\x7E]/.test(error.context || '');
  }

  protected async doHandle(error: any, context: string): Promise<any> {
    // Replace or remove special characters
    const cleaned = context
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/[…]/g, '...')
      .replace(/[^\x20-\x7E]/g, ''); // Remove other non-ASCII characters

    return {
      success: true,
      partialResult: { type: 'text', text: cleaned, chords: [], lineNumber: error.line || 0 },
      errors: [],
      warnings: [`Cleaned special characters: "${context}" -> "${cleaned}"`]
    };
  }
}