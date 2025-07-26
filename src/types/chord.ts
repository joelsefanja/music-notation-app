import { AnnotationFormat } from './format';

/**
 * Represents a musical chord with all its components
 */
export interface Chord {
  /** Root note of the chord (e.g., 'C', 'F#', 'Bb') */
  root: string;
  /** Chord quality (e.g., 'm', 'maj', 'dim', 'aug') */
  quality: string;
  /** Array of chord extensions (e.g., ['sus4'], ['7'], ['maj7', 'add9']) */
  extensions: string[];
  /** Bass note for slash chords (e.g., 'B' in 'C/B') */
  bassNote?: string;
  /** Position index in the text where this chord appears */
  position: number;
}

/**
 * Represents an annotation in a chord sheet
 */
export interface Annotation {
  /** The annotation text content */
  text: string;
  /** The format of the annotation */
  format: AnnotationFormat;
  /** Position of the annotation relative to content */
  position: 'above' | 'inline' | 'beside';
}