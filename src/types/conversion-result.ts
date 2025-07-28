import { ConversionError } from './conversion-error';
import { PerformanceMetrics } from './canonical-model';

/**
 * Result of a conversion operation with enhanced metadata
 */
export interface ConversionResult {
  success: boolean;
  output: string;
  errors: ConversionError[];
  warnings: string[];
  metadata?: ConversionMetadata;
  performanceMetrics?: PerformanceMetrics;
}

/**
 * Metadata about the conversion process
 */
export interface ConversionMetadata {
  detectedFormat?: string;
  formatConfidence?: number;
  fromFormat?: string;
  toFormat?: string;
  fromKey?: string;
  toKey?: string;
  [key: string]: any;
}

/**
 * Options for conversion operations
 */
export interface ConversionOptions {
  transposeBy?: number;
  targetChordDisplay?: 'inline' | 'above';
  preserveOriginalText?: boolean;
  includeMetadata?: boolean;
  [key: string]: any;
}
