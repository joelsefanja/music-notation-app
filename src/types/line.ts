
export enum LineType {
  TEXT = 'TEXT',
  EMPTY = 'EMPTY',
  ANNOTATION = 'ANNOTATION',
  CHORD_LYRICS = 'CHORD_LYRICS',
  METADATA = 'METADATA',
  SECTION_HEADER = 'SECTION_HEADER'
}

export interface BaseLine {
  id: string;
  type: LineType;
  content: string;
  originalContent?: string;
}

export interface TextLine extends BaseLine {
  type: LineType.TEXT;
}

export interface EmptyLine extends BaseLine {
  type: LineType.EMPTY;
  content: '';
}

export interface AnnotationLine extends BaseLine {
  type: LineType.ANNOTATION;
  annotationType?: string;
  value?: string;
}

export interface ChordLyricsLine extends BaseLine {
  type: LineType.CHORD_LYRICS;
  chords?: string[];
  lyrics?: string;
  chordPositions?: number[];
}

export interface MetadataLine extends BaseLine {
  type: LineType.METADATA;
  key?: string;
  value?: string;
}

export interface SectionHeaderLine extends BaseLine {
  type: LineType.SECTION_HEADER;
  sectionType?: string;
  sectionName?: string;
}

export type Line = TextLine | EmptyLine | AnnotationLine | ChordLyricsLine | MetadataLine | SectionHeaderLine;

export interface LineRenderOptions {
  showChords?: boolean;
  transposeKey?: string;
}

// Type guards
export function isTextLine(line: Line): line is TextLine {
  return line.type === LineType.TEXT;
}

export function isEmptyLine(line: Line): line is EmptyLine {
  return line.type === LineType.EMPTY;
}

export function isAnnotationLine(line: Line): line is AnnotationLine {
  return line.type === LineType.ANNOTATION;
}

export function isChordLyricsLine(line: Line): line is ChordLyricsLine {
  return line.type === LineType.CHORD_LYRICS;
}

export function isMetadataLine(line: Line): line is MetadataLine {
  return line.type === LineType.METADATA;
}

export function isSectionHeaderLine(line: Line): line is SectionHeaderLine {
  return line.type === LineType.SECTION_HEADER;
}

// Backwards compatibility aliases
export const isChordLine = isChordLyricsLine;
export const isLyricLine = isTextLine;

// Validation function
export function validateLine(line: any): line is Line {
  if (!line || typeof line !== 'object') return false;
  if (!line.type || !Object.values(LineType).includes(line.type)) return false;
  if (typeof line.id !== 'string') return false;
  if (typeof line.content !== 'string') return false;
  return true;
}

// Export formats
export enum NotationFormat {
  CHORDPRO = 'CHORDPRO',
  ONSONG = 'ONSONG',
  SONGBOOK = 'SONGBOOK',
  GUITAR_TABS = 'GUITAR_TABS',
  NASHVILLE = 'NASHVILLE',
  PLANNING_CENTER = 'PLANNING_CENTER'
}

export enum AnnotationFormat {
  CHORDPRO = 'CHORDPRO',
  ONSONG = 'ONSONG',
  SONGBOOK = 'SONGBOOK',
  GUITAR_TABS = 'GUITAR_TABS',
  NASHVILLE = 'NASHVILLE',
  PLANNING_CENTER = 'PLANNING_CENTER'
}
