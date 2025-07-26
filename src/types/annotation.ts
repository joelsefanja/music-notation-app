import { Annotation } from './chord';

export interface IAnnotationParseResult {
  annotation: Annotation;
  originalText: string;
  startIndex: number;
  endIndex: number;
}