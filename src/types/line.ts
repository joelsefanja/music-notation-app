/**
 * Line type definitions for music notation parsing
 */

export enum LineType {
  CHORD_LYRIC = 'chord_lyric',
  CHORD_ONLY = 'chord_only', 
  LYRIC_ONLY = 'lyric_only',
  SECTION_HEADER = 'section_header',
  COMMENT = 'comment',
  DIRECTIVE = 'directive',
  BLANK = 'blank',
  INVALID = 'invalid'
}

export interface LinePosition {
  line: number;
  column: number;
}

export interface Line {
  type: LineType;
  content: string;
  chords?: string[];
  lyrics?: string;
  position?: LinePosition;
  metadata?: Record<string, any>;
}

export interface ParsedLine extends Line {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}