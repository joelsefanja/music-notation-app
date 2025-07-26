import { Annotation, AnnotationFormat } from '../../types';
import { IAnnotationParseResult } from '../../types/annotation';
import { BaseParser } from '../core/base-parser';

export class GuitarTabsParser extends BaseParser {
  protected readonly annotationPatterns = {
    [AnnotationFormat.GUITAR_TABS]: /^\*(.+)$/gm,
  };

  public parse(text: string): IAnnotationParseResult[] {
    const results: IAnnotationParseResult[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.GUITAR_TABS];
    if (!regex) {
      return results;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      const annotation: Annotation = {
        text: match[1].trim(),
        format: AnnotationFormat.GUITAR_TABS,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.GUITAR_TABS),
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
    if (format !== AnnotationFormat.GUITAR_TABS) {
      return [];
    }
    const annotations: Annotation[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.GUITAR_TABS];
    if (!regex) {
      return annotations;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      annotations.push({
        text: match[1].trim(),
        format: AnnotationFormat.GUITAR_TABS,
        position: 'beside', // Assuming 'beside' for guitar tabs annotations
      });
    }

    return annotations;
  }

  public convert(annotation: Annotation, targetFormat: AnnotationFormat): string {
    if (annotation.format !== AnnotationFormat.GUITAR_TABS) {
      return annotation.text;
    }

    switch (targetFormat) {
      case AnnotationFormat.GUITAR_TABS:
        return `*${annotation.text}`;
      default:
        return annotation.text;
    }
  }

  public isValid(text: string): boolean {
    const regex = this.annotationPatterns[AnnotationFormat.GUITAR_TABS];
    return regex ? regex.test(text) : false;
  }
}