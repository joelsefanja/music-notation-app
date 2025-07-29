/**
 * Enhanced Conversion Engine implementation using Facade pattern
 * Orchestrates the entire conversion process with dependency injection and comprehensive error handling
 */

import { 
  IConversionEngine, 
  IConversionRequest, 
  IParserRegistry, 
  IFormatDetector, 
  IEventManager, 
  IErrorRecoveryService, 
  IKeyTransposer, 
  IStorageService,
  FormatDetectionResult,
  KeyDetectionResult
} from '../../types/interfaces/core-interfaces';
import { ConversionResult } from '../../types/conversion-result';
import { ConversionError, ConversionErrorType } from '../../types/conversion-error';
import { CanonicalSongModel } from '../../types/canonical-model';
import { 
  ConversionStartedEvent, 
  ConversionCompletedEvent, 
  ConversionErrorEvent 
} from '../events/event-manager';

/**
 * Enhanced conversion engine that serves as a facade for the entire conversion system
 */
export class EnhancedConversionEngine implements IConversionEngine {
  constructor(
    private parserRegistry: IParserRegistry,
    private formatDetector: IFormatDetector,
    private eventManager: IEventManager,
    private errorRecovery: IErrorRecoveryService,
    private keyTransposer: IKeyTransposer,
    private storageService: IStorageService
  ) {}

  /**
   * Convert music notation from one format to another
   */
  async convert(request: IConversionRequest): Promise<ConversionResult> {
    const requestId = this.generateRequestId();

    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (!validationResult.isValid) {
        return this.createErrorResult(validationResult.errors);
      }

      // Publish conversion started event
      this.eventManager.publish(new ConversionStartedEvent(
        requestId,
        request.input,
        request.sourceFormat,
        request.targetFormat
      ));

      // Step 1: Detect format if not provided
      const detectedFormat = await this.detectOrUseFormat(request);
      if (!detectedFormat.success) {
        return detectedFormat.result;
      }

      // Step 2: Parse input to canonical model
      const parseResult = await this.parseInput(request.input, detectedFormat.format);
      // Ensure canonicalModel is defined before proceeding. If not, return an error.
      if (!parseResult.success || !parseResult.canonicalModel) {
        return parseResult.result ? parseResult.result : this.createErrorResult([{
          type: ConversionErrorType.PARSE_ERROR,
          message: 'Failed to parse input or obtain a canonical model',
          recoverable: false
        }]);
      }

      let canonicalModel = parseResult.canonicalModel; // Now we know canonicalModel is defined

      // Step 3: Apply key transposition if requested
      if (request.transposeOptions) {
        const transposeResult = await this.applyTransposition(
          canonicalModel, 
          request.transposeOptions as any // Cast to any for now, will be properly typed later
        );
        if (!transposeResult.success || !transposeResult.canonicalModel) {
          return transposeResult.result;
        }
        canonicalModel = transposeResult.canonicalModel;
      }

      // Step 4: Render to target format
      const renderResult = await this.renderOutput(canonicalModel, request.targetFormat);
      if (!renderResult.success || !renderResult.output) {
        return renderResult.result;
      }

      // Step 5: Create successful result
      const result = this.createSuccessResult(
        renderResult.output,
        detectedFormat.format,
        request,
        parseResult.warnings,
        renderResult.warnings
      );

      // Publish completion event
      this.eventManager.publish(new ConversionCompletedEvent(
        requestId,
        result.output,
        result.metadata
      ));

      // Optionally save result
      if (request.conversionOptions?.saveResult) {
        await this.saveConversionResult(result, requestId);
      }

      return result;

    } catch (error) {
      const conversionError = this.createConversionError(error);

      // Publish error event
      this.eventManager.publish(new ConversionErrorEvent(
        requestId,
        error instanceof Error ? error : new Error('Unknown error'),
        false
      ));

      // Attempt error recovery
      const recoveryResult = await this.attemptErrorRecovery(conversionError, request);

      return recoveryResult || this.createErrorResult([conversionError]);
    }
  }

  /**
   * Detect the format of input text
   */
  detectFormat(text: string): FormatDetectionResult {
    // Validate input
    if (text === null || text === undefined || typeof text !== 'string') {
      throw new Error('Input text is required and must be a string');
    }

    if (text.trim().length === 0) {
      throw new Error('Input text cannot be empty');
    }

    try {
      return this.formatDetector.detectFormat(text);
    } catch (error) {
      return {
        format: 'UNKNOWN' as any,
        confidence: 0
      };
    }
  }

  /**
   * Detect the key of input text
   */
  detectKey(text: string): KeyDetectionResult {
    try {
      // This would use a key detection service
      // For now, return a placeholder implementation
      return {
        key: 'C',
        isMinor: false,
        confidence: 0.5
      };
    } catch (error) {
      return {
        key: 'C',
        isMinor: false,
        confidence: 0
      };
    }
  }

  /**
   * Get conversion statistics
   */
  async getConversionStats(): Promise<{
    totalConversions: number;
    successfulConversions: number;
    failedConversions: number;
    averageProcessingTime: number;
    formatDistribution: Record<string, number>;
  }> {
    // This would be implemented with actual tracking
    return {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      averageProcessingTime: 0,
      formatDistribution: {}
    };
  }

  /**
   * Validate conversion request
   */
  private validateRequest(request: IConversionRequest): { isValid: boolean; errors: ConversionError[] } {
    const errors: ConversionError[] = [];

    if (typeof request.input !== 'string') {
      errors.push({
        type: ConversionErrorType.VALIDATION_ERROR,
        message: 'Input text is required and must be a string',
        recoverable: false
      });
    } else if (request.input.trim().length === 0) {
      errors.push({
        type: ConversionErrorType.VALIDATION_ERROR,
        message: 'Input text cannot be empty',
        recoverable: false
      });
    }

    if (!request.targetFormat) {
      errors.push({
        type: ConversionErrorType.VALIDATION_ERROR,
        message: 'Target format is required',
        recoverable: false
      });
    }

    if (request.sourceFormat && !this.parserRegistry.isParsingSupported(request.sourceFormat)) {
      errors.push({
        type: ConversionErrorType.FORMAT_ERROR,
        message: `Source format ${request.sourceFormat} is not supported`,
        recoverable: false
      });
    }

    if (request.transposeOptions) {
      const { fromKey, toKey } = request.transposeOptions;
      if (!fromKey || !toKey) {
        errors.push({
          type: ConversionErrorType.VALIDATION_ERROR,
          message: 'Both fromKey and toKey are required for transposition',
          recoverable: false
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Detect or use provided format
   */
  private async detectOrUseFormat(request: IConversionRequest): Promise<{
    success: boolean;
    format?: any;
    result: ConversionResult;
  }> {
    if (request.sourceFormat) {
      if (this.parserRegistry.isParsingSupported(request.sourceFormat)) {
        return { success: true, format: request.sourceFormat };
      } else {
        return {
          success: false,
          result: this.createErrorResult([{
            type: ConversionErrorType.FORMAT_ERROR,
            message: `Source format ${request.sourceFormat} is not supported`,
            recoverable: false
          }])
        };
      }
    }

    // Auto-detect format
      const detection = this.formatDetector.detectFormat(request.input);
      if (detection.confidence === 0) {
        return {
          success: false,
          result: this.createErrorResult([{
            type: ConversionErrorType.FORMAT_ERROR,
            message: 'Could not detect input format',
            recoverable: false
          }])
        };
      }

      // Explicitly create the success response object
      const successResponse: { success: boolean; format?: any; result: ConversionResult; } = {
        success: true,
        format: detection.format,
        result: this.createSuccessResult('', detection.format, request)
      };
      return successResponse;
    }

  /**
   * Parse input to canonical model
   */
  private async parseInput(input: string, format: any): Promise<{
    success: boolean;
    canonicalModel?: CanonicalSongModel;
    warnings?: string[];
    result?: ConversionResult;
  }> {
    const parser = this.parserRegistry.getParser(format);
    if (!parser) {
      return {
        success: false,
        result: this.createErrorResult([{
          type: ConversionErrorType.PARSE_ERROR,
          message: `No parser available for format: ${format}`,
          recoverable: false
        }])
      };
    }

    try {
      const parseResult = await parser.parse(input);

      if (!parseResult.success || !parseResult.canonicalModel) {
        return {
          success: false,
          result: this.createErrorResult(parseResult.errors || [{
            type: ConversionErrorType.PARSE_ERROR,
            message: 'Failed to parse input',
            recoverable: true
          }], parseResult.warnings)
        };
      }

      return {
        success: true,
        canonicalModel: parseResult.canonicalModel,
        warnings: parseResult.warnings
      };
    } catch (error) {
      return {
        success: false,
        result: this.createErrorResult([{
          type: ConversionErrorType.PARSE_ERROR,
          message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true
        }])
      };
    }
  }

  /**
   * Apply key transposition
   */
  private async applyTransposition(
    model: CanonicalSongModel, 
    transposeOptions: any
  ): Promise<{
    success: boolean;
    canonicalModel?: CanonicalSongModel;
    result?: ConversionResult;
  }> {
    try {
      const command = this.keyTransposer.createTransposeCommand(
        model,
        transposeOptions.fromKey,
        transposeOptions.toKey
      );

      await command.execute();

      return {
        success: true,
        canonicalModel: model // Model is modified in place
      };
    } catch (error) {
      return {
        success: false,
        result: this.createErrorResult([{
          type: ConversionErrorType.TRANSPOSE_ERROR,
          message: `Transposition error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }])
      };
    }
  }

  /**
   * Render output in target format
   */
  private async renderOutput(model: CanonicalSongModel, targetFormat: any): Promise<{
    success: boolean;
    output?: string;
    warnings?: string[];
    result?: ConversionResult;
  }> {
    // This would use a renderer registry similar to parser registry
    // For now, return a placeholder implementation
    try {
      // Placeholder rendering logic
      const output = JSON.stringify(model, null, 2);

      return {
        success: true,
        output,
        warnings: []
      };
    } catch (error) {
      return {
        success: false,
        result: this.createErrorResult([{
          type: ConversionErrorType.RENDER_ERROR,
          message: `Render error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }])
      };
    }
  }

  /**
   * Create successful conversion result
   */
  private createSuccessResult(
    output: string,
    detectedFormat: any,
    request: IConversionRequest,
    parseWarnings: string[] = [],
    renderWarnings: string[] = []
  ): ConversionResult {
    return {
      success: true,
      output,
      errors: [],
      warnings: [...parseWarnings, ...renderWarnings],
      metadata: {
        detectedFormat,
        sourceFormat: request.sourceFormat || detectedFormat,
        targetFormat: request.targetFormat,
        transposeOptions: request.transposeOptions,
        processingTime: Date.now(),
        requestId: this.generateRequestId()
      }
    };
  }

  /**
   * Create error conversion result
   */
  private createErrorResult(errors: ConversionError[], warnings: string[] = []): ConversionResult {
    return {
      success: false,
      output: '',
      errors,
      warnings,
      metadata: {
        processingTime: Date.now(),
        requestId: this.generateRequestId()
      }
    };
  }

  /**
   * Create conversion error from exception
   */
  private createConversionError(error: unknown): ConversionError {
    return {
      type: ConversionErrorType.CONVERSION_ERROR,
      message: error instanceof Error ? error.message : 'Unknown conversion error',
      recoverable: true
    };
  }

  /**
   * Attempt error recovery
   */
  private async attemptErrorRecovery(
    error: ConversionError, 
    request: IConversionRequest
  ): Promise<ConversionResult | null> {
    try {
      const recoveryResult = await this.errorRecovery.recover(error, request.input);

      if (recoveryResult.success && recoveryResult.partialResult) {
        return {
          success: true,
          output: recoveryResult.partialResult.toString(),
          errors: recoveryResult.errors,
          warnings: [...recoveryResult.warnings, 'Result generated using error recovery'],
          metadata: {
            recoveryApplied: true,
            originalError: error.message,
            processingTime: Date.now(),
            requestId: this.generateRequestId()
          }
        };
      }
    } catch (recoveryError) {
      // Recovery failed, return null to use original error
    }

    return null;
  }

  /**
   * Save conversion result
   */
  private async saveConversionResult(result: ConversionResult, requestId: string): Promise<void> {
    try {
      await this.storageService.saveConversionResult(result, `conversion_${requestId}`);
    } catch (error) {
      // Log error but don't fail the conversion
      console.warn('Failed to save conversion result:', error);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}