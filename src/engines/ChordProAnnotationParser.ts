import { Annotation, AnnotationFormat } from '../types';
import { AnnotationParseResult } from './annotation-parser';
import { BaseParser } from './BaseParser';

export class ChordProAnnotationParser extends BaseParser {
  protected readonly annotationPatterns = {
    [AnnotationFormat.CHORDPRO]: /\{(?:comment|c):\s*(.+?)\}/gm,
  };

  public parse(text: string): AnnotationParseResult[] {
    const results: AnnotationParseResult[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.CHORDPRO];
    if (!regex) {
      return results;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      const annotation: Annotation = {
        text: match[1].trim(),
        format: AnnotationFormat.CHORDPRO,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.CHORDPRO),
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
    if (format !== AnnotationFormat.CHORDPRO) {
      return [];
    }
    const annotations: Annotation[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.CHORDPRO];
    if (!regex) {
      return annotations;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      annotations.push({
        text: match[1].trim(),
        format: AnnotationFormat.CHORDPRO,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.CHORDPRO),
      });
    }

    return annotations;
  }

  public convert(annotation: Annotation, targetFormat: AnnotationFormat): string {
    if (annotation.format !== AnnotationFormat.CHORDPRO) {
      return annotation.text;
    }

    switch (targetFormat) {
      case AnnotationFormat.CHORDPRO:
        return `{comment:${annotation.text}}`;
      case AnnotationFormat.ONSONG:
        return `*${annotation.text}`;
      default:
        return annotation.text;
    }
  }

  public isValid(text: string): boolean {
    const regex = this.annotationPatterns[AnnotationFormat.CHORDPRO];
    return regex ? regex.test(text) : false;
  }
}
