import { Annotation, AnnotationFormat } from '../types';
import { AnnotationParseResult } from './annotation-parser';

export interface IParser {
  parse(text: string): AnnotationParseResult[];
  parseOfFormat(text: string, format: AnnotationFormat): Annotation[];
  convert(annotation: Annotation, targetFormat: AnnotationFormat): string;
  remove(text: string): string;
  isValid(text: string): boolean;
}
