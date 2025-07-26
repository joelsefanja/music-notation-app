import { Annotation, AnnotationFormat } from '../../types';
import { IAnnotationParseResult } from '../../types/annotation';
import { BaseParser } from '../core/base-parser';

export class PlanningCenterParser extends BaseParser {
  protected readonly annotationPatterns = {
    [AnnotationFormat.PCO]: /<b>([^<]+)<\/b>/gm,
  };

  public parse(text: string): IAnnotationParseResult[] {
    const results: IAnnotationParseResult[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.PCO];
    if (!regex) {
      return results;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      const annotation: Annotation = {
        text: match[1].trim(),
        format: AnnotationFormat.PCO,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.PCO),
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
    if (format !== AnnotationFormat.PCO) {
      return [];
    }
    const annotations: Annotation[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.PCO];
    if (!regex) {
      return annotations;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      annotations.push({
        text: match[1].trim(),
        format: AnnotationFormat.PCO,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.PCO),
      });
    }

    return annotations;
  }

  public convert(annotation: Annotation, targetFormat: AnnotationFormat): string {
    if (annotation.format !== AnnotationFormat.PCO) {
      return annotation.text;
    }

    switch (targetFormat) {
      case AnnotationFormat.PCO:
        return `<b>${annotation.text}</b>`;
      case AnnotationFormat.ONSONG:
        return `*${annotation.text}`;
      default:
        return annotation.text;
    }
  }

  public isValid(text: string): boolean {
    const regex = this.annotationPatterns[AnnotationFormat.PCO];
    return regex ? regex.test(text) : false;
  }
}