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

// Base interfaces for different line types
export interface BaseLine {
  type: LineType;
  content: string;
  position?: LinePosition;
  metadata?: Record<string, any>;
}

export interface ChordLine extends BaseLine {
  type: LineType.CHORD_ONLY;
  chords: string[];
}

export interface LyricLine extends BaseLine {
  type: LineType.LYRIC_ONLY;
  lyrics: string;
}

export interface TextLine extends BaseLine {
  type: LineType.CHORD_LYRIC;
  chords?: string[];
  lyrics?: string;
}

export interface EmptyLine extends BaseLine {
  type: LineType.BLANK;
}

export interface AnnotationLine extends BaseLine {
  type: LineType.COMMENT;
}

// Additional types for Nashville format
export interface Chord {
  root: string;
  quality?: string;
  bass?: string;
}

export interface ChordPlacement {
  chord: Chord;
  position: number;
}

export interface NashvilleChord {
  number: number;
  quality?: string;
  bass?: number;
}

export interface RhythmicSymbol {
  symbol: string;
  duration: number;
}

// Type guard functions
export function isChordLine(line: Line): line is ChordLine {
  return line.type === LineType.CHORD_ONLY;
}

export function isLyricLine(line: Line): line is LyricLine {
  return line.type === LineType.LYRIC_ONLY;
}

export function isTextLine(line: Line): line is TextLine {
  return line.type === LineType.CHORD_LYRIC;
}

export function isEmptyLine(line: Line): line is EmptyLine {
  return line.type === LineType.BLANK;
}

export function isAnnotationLine(line: Line): line is AnnotationLine {
  return line.type === LineType.COMMENT;
}

// Validation function
export function validateLine(line: Line): ParsedLine {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!line.content && line.type !== LineType.BLANK) {
    errors.push('Line content is required for non-blank lines');
  }

  if (line.type === LineType.CHORD_ONLY && (!line.chords || line.chords.length === 0)) {
    errors.push('Chord-only lines must have chords');
  }

  if (line.type === LineType.LYRIC_ONLY && !line.lyrics) {
    errors.push('Lyric-only lines must have lyrics');
  }

  return {
    ...line,
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}