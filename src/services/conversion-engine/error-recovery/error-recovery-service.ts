/**
 * Error Recovery Service implementation
 * Manages error recovery using Chain of Responsibility pattern
 */

import { 
  IErrorRecoveryService, 
  IErrorRecoveryHandler, 
  ErrorRecoveryResult 
} from '../../../types/interfaces/core-interfaces';
import { ConversionError } from '../../../types/conversion-error';
import { ErrorRecoveryChainBuilder } from './error-recovery-chain-builder';

/**
 * Service that manages error recovery using a chain of handlers
 */
export class ErrorRecoveryService implements IErrorRecoveryService {
  private handlerChain: IErrorRecoveryHandler;
  private customHandlers: IErrorRecoveryHandler[] = [];
  private recoveryLevel: 'strict' | 'moderate' | 'permissive' = 'moderate';

  constructor(recoveryLevel: 'strict' | 'moderate' | 'permissive' = 'moderate') {
    this.recoveryLevel = recoveryLevel;
    this.handlerChain = this.buildDefaultChain();
  }

  /**
   * Attempt to recover from an error
   */
  async recover(error: ConversionError, context: any): Promise<ErrorRecoveryResult> {
    try {
      const result = await this.handlerChain.handle(error, context);
      
      // Log recovery attempt for debugging
      this.logRecoveryAttempt(error, context, result);
      
      return result;
    } catch (recoveryError) {
      // If recovery itself fails, return a fallback result
      return {
        success: false,
        errors: [error],
        warnings: [`Recovery failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Add a custom handler to the chain
   */
  addHandler(handler: IErrorRecoveryHandler): void {
    this.customHandlers.push(handler);
    this.rebuildChain();
  }

  /**
   * Remove a handler from the chain
   */
  removeHandler(handler: IErrorRecoveryHandler): void {
    const index = this.customHandlers.indexOf(handler);
    if (index > -1) {
      this.customHandlers.splice(index, 1);
      this.rebuildChain();
    }
  }

  /**
   * Set the recovery level
   */
  setRecoveryLevel(level: 'strict' | 'moderate' | 'permissive'): void {
    this.recoveryLevel = level;
    this.rebuildChain();
  }

  /**
   * Get the current recovery level
   */
  getRecoveryLevel(): 'strict' | 'moderate' | 'permissive' {
    return this.recoveryLevel;
  }

  /**
   * Build a format-specific recovery chain
   */
  setFormatSpecificChain(format: string): void {
    const builder = new ErrorRecoveryChainBuilder();
    this.handlerChain = builder.buildFormatSpecificChain(format);
    
    // Add custom handlers to the end
    if (this.customHandlers.length > 0) {
      this.addCustomHandlersToChain();
    }
  }

  /**
   * Reset to default recovery chain
   */
  resetToDefault(): void {
    this.customHandlers = [];
    this.handlerChain = this.buildDefaultChain();
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    successRate: number;
  } {
    // This would be implemented with actual tracking in a real system
    return {
      totalAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      successRate: 0
    };
  }

  /**
   * Test recovery capability for a specific error type
   */
  async testRecovery(error: ConversionError, context: any): Promise<{
    canRecover: boolean;
    estimatedSuccess: number;
    suggestedHandlers: string[];
  }> {
    // This is a simplified implementation
    // In a real system, this would analyze the error and context more thoroughly
    
    const canRecover = error.recoverable !== false;
    let estimatedSuccess = 0;
    const suggestedHandlers: string[] = [];

    if (canRecover) {
      if (error.type === 'PARSE_ERROR') {
        estimatedSuccess = 0.8;
        suggestedHandlers.push('InvalidChordRecoveryHandler', 'MalformedSectionRecoveryHandler');
      } else if (error.type === 'VALIDATION_ERROR') {
        estimatedSuccess = 0.9;
        suggestedHandlers.push('FormatValidationRecoveryHandler');
      } else if (error.type === 'FORMAT_ERROR') {
        estimatedSuccess = 0.7;
        suggestedHandlers.push('FormatValidationRecoveryHandler', 'EncodingRecoveryHandler');
      } else {
        estimatedSuccess = 0.5;
        suggestedHandlers.push('FallbackRecoveryHandler');
      }
    }

    return {
      canRecover,
      estimatedSuccess,
      suggestedHandlers
    };
  }

  /**
   * Batch recover multiple errors
   */
  async recoverBatch(errors: Array<{ error: ConversionError; context: any }>): Promise<ErrorRecoveryResult[]> {
    const results: ErrorRecoveryResult[] = [];
    
    for (const { error, context } of errors) {
      const result = await this.recover(error, context);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Create a recovery report
   */
  createRecoveryReport(results: ErrorRecoveryResult[]): {
    totalErrors: number;
    recoveredErrors: number;
    partialRecoveries: number;
    failedRecoveries: number;
    warnings: string[];
    summary: string;
  } {
    const totalErrors = results.length;
    const recoveredErrors = results.filter(r => r.success).length;
    const partialRecoveries = results.filter(r => r.success && r.partialResult).length;
    const failedRecoveries = results.filter(r => !r.success).length;
    const warnings = results.flatMap(r => r.warnings);

    const summary = `Recovery Report: ${recoveredErrors}/${totalErrors} errors recovered (${Math.round(recoveredErrors / totalErrors * 100)}% success rate)`;

    return {
      totalErrors,
      recoveredErrors,
      partialRecoveries,
      failedRecoveries,
      warnings,
      summary
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  recoverLine(line: string, lineNumber: number): any | null {
    // Create a generic parse error for the line
    const error: ConversionError = {
      type: 'PARSE_ERROR',
      message: 'Line parsing failed',
      line: lineNumber,
      recoverable: true,
      context: line
    };

    // Use the recovery system
    this.recover(error, line).then(result => {
      return result.success ? result.partialResult : null;
    }).catch(() => {
      return null;
    });

    // Fallback for synchronous compatibility
    return {
      type: 'text',
      text: line,
      chords: [],
      lineNumber
    };
  }

  private buildDefaultChain(): IErrorRecoveryHandler {
    const builder = new ErrorRecoveryChainBuilder();
    return builder.buildConditionalChain(this.recoveryLevel);
  }

  private rebuildChain(): void {
    this.handlerChain = this.buildDefaultChain();
    this.addCustomHandlersToChain();
  }

  private addCustomHandlersToChain(): void {
    // Add custom handlers before the fallback handler
    let current = this.handlerChain;
    
    // Find the last handler before fallback
    while ((current as any).nextHandler && 
           (current as any).nextHandler.constructor.name !== 'FallbackRecoveryHandler') {
      current = (current as any).nextHandler;
    }
    
    // Insert custom handlers
    for (const customHandler of this.customHandlers) {
      const next = (current as any).nextHandler;
      (current as any).setNext(customHandler);
      if (next) {
        customHandler.setNext(next);
      }
      current = customHandler;
    }
  }

  private logRecoveryAttempt(
    error: ConversionError, 
    context: any, 
    result: ErrorRecoveryResult
  ): void {
    // In a real implementation, this would log to a proper logging system
    if (process.env.NODE_ENV === 'development') {
      console.log('Error Recovery Attempt:', {
        errorType: error.type,
        errorMessage: error.message,
        context: typeof context === 'string' ? context.substring(0, 50) : context,
        success: result.success,
        warnings: result.warnings
      });
    }
  }
}