// src/types/index.ts

// Re-export all types from individual modules
export * from './annotation';
export * from './canonical-model';
export * from './chord';
export * from './chordsheet';
export * from './conversion-error';
export * from './conversion-result';
export * from './error';
export * from './metadata';
export * from './section';
export * from './validation';

// Export format and line with specific exports to avoid conflicts
export { 
  NotationFormat,
  AnnotationFormat,
  SectionType
} from './format';

export type {
  BaseLine,
  ChordLine,
  LyricLine,
  AnnotationLine,
  Line,
  TextLine,
  EmptyLine,
  Chord,
  ChordPlacement,
  NashvilleChord,
  RhythmicSymbol
} from './line';

export {
  isChordLine,
  isLyricLine,
  isTextLine,
  isEmptyLine,
  isAnnotationLine,
  validateLine
} from './line';