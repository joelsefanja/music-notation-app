import { Section } from './section';
import { NotationFormat } from './format';
import { ConversionError } from './conversion-error';

/**
 * Enhanced canonical song model that serves as the single source of truth for all conversions
 */
export interface CanonicalSongModel {
  metadata: CanonicalMetadata;
  sections: Section[];
  parseInfo: ParseInfo;
}

/**
 * Metadata for the canonical song model
 */
export interface CanonicalMetadata {
  id: string;
  title: string;
  artist?: string;
  originalKey: string;
  detectedKey?: string;
  confidence?: number;
  tempo?: number;
  timeSignature?: string;
  capo?: number;
}

/**
 * Information about the parsing process
 */
export interface ParseInfo {
  sourceFormat: NotationFormat;
  parseTimestamp: Date;
  parseErrors: ConversionError[];
  parseWarnings: string[];
}

/**
 * Performance metrics for conversion operations
 */
export interface PerformanceMetrics {
  parsingTimeMs: number;
  conversionTimeMs: number;
  totalTimeMs: number;
  memoryUsage?: number;
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
