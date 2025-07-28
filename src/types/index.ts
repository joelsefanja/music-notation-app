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

export {
  BaseLine,
  ChordLine,
  LyricLine,
  AnnotationLine,
  isChordLine,
  isLyricLine,
  isTextLine,
  isEmptyLine,
  isAnnotationLine,
  validateLine
} from './line';