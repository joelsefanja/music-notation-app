
import { NotationFormat } from '../../types';

export interface ConversionResult {
  success: boolean;
  output: string;
  error?: string;
}

export class ConversionEngine {
  static async convert(
    input: string,
    fromFormat: NotationFormat,
    toFormat: NotationFormat
  ): Promise<ConversionResult> {
    // Temporary implementation for backward compatibility
    try {
      // Simple passthrough for now
      return {
        success: true,
        output: input,
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown conversion error',
      };
    }
  }
}
