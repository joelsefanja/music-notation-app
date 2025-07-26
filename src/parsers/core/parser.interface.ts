import { Annotation, AnnotationFormat } from '../../types';
import { IAnnotationParseResult } from '../../types/annotation';

export interface IParser {
  parse(text: string): IAnnotationParseResult[];
  parseOfFormat(text: string, format: AnnotationFormat): Annotation[];
  convert(annotation: Annotation, targetFormat: AnnotationFormat): string;
  remove(text: string): string;
  isValid(text: string): boolean;
}