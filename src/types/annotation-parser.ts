import { Annotation } from '../types';

export interface IAnnotationParseResult {
  annotation: Annotation;
  originalText: string;
  startIndex: number;
  endIndex: number;
}
