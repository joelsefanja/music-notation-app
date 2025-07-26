import { Annotation, AnnotationFormat } from '../types';
import { AnnotationParseResult } from './annotation-parser';
import { BaseParser } from './BaseParser';

export class SongbookAnnotationParser extends BaseParser {
  protected readonly annotationPatterns = {
    [AnnotationFormat.SONGBOOK]: /^\(([^)]+)\)$/gm,
  };

  public parse(text: string): AnnotationParseResult[] {
    const results: AnnotationParseResult[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.SONGBOOK];
    if (!regex) {
      return results;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      const annotation: Annotation = {
        text: match[1].trim(),
        format: AnnotationFormat.SONGBOOK,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.SONGBOOK),
      };

      results.push({
        annotation,
        originalText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return results;
  }

  public parseOfFormat(text: string, format: AnnotationFormat): Annotation[] {
    if (format !== AnnotationFormat.SONGBOOK) {
      return [];
    }
    const annotations: Annotation[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.SONGBOOK];
    if (!regex) {
      return annotations;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      annotations.push({
        text: match[1].trim(),
        format: AnnotationFormat.SONGBOOK,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.SONGBOOK),
      });
    }

    return annotations;
  }

  public convert(annotation: Annotation, targetFormat: AnnotationFormat): string {
    if (annotation.format !== AnnotationFormat.SONGBOOK) {
      return annotation.text;
    }

    switch (targetFormat) {
      case AnnotationFormat.SONGBOOK:
        return `(${annotation.text})`;
      default:
        return annotation.text;
    }
  }

  public isValid(text: string): boolean {
    const regex = this.annotationPatterns[AnnotationFormat.SONGBOOK];
    return regex ? regex.test(text) : false;
  }
}
