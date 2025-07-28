// AnnotationLine is now defined in line.ts to maintain discriminated union structure

/**
 * Legacy annotation interface for backward compatibility
 * @deprecated Use AnnotationLine from line.ts instead
 */
export interface Annotation {
    text: string;
    format: import('./format').AnnotationFormat;
    position: 'inline' | 'above' | 'beside' | string; 
}

/**
 * Result of parsing an annotation
 */
export interface IAnnotationParseResult {
    annotation: Annotation;
    startIndex: number;
    endIndex: number;
}
