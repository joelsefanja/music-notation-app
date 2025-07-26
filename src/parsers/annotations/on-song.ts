import { IAnnotationParseResult } from '../../types/annotation';
import { Annotation, AnnotationFormat } from '../../types';
import { BaseParser } from '../core/base-parser';

export class OnSongParser extends BaseParser {
  protected readonly annotationPatterns = {
    [AnnotationFormat.ONSONG]: /^\*(.+)$/gm,
  };

  public parse(text: string): IAnnotationParseResult[] {
    const results: IAnnotationParseResult[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.ONSONG];
    if (!regex) {
      return results;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      const annotation: Annotation = {
        text: match[1].trim(),
        format: AnnotationFormat.ONSONG,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.ONSONG),
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
    if (format !== AnnotationFormat.ONSONG) {
      return [];
    }
    const annotations: Annotation[] = [];
    const regex = this.annotationPatterns[AnnotationFormat.ONSONG];
    if (!regex) {
      return annotations;
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      annotations.push({
        text: match[1].trim(),
        format: AnnotationFormat.ONSONG,
        position: this.determineAnnotationPosition(text, match.index, AnnotationFormat.ONSONG),
      });
    }

    return annotations;
  }

  public convert(annotation: Annotation, targetFormat: AnnotationFormat): string {
    if (annotation.format !== AnnotationFormat.ONSONG) {
      return annotation.text;
    }

    switch (targetFormat) {
      case AnnotationFormat.ONSONG:
        return `*${annotation.text}`;
      default:
        return annotation.text;
    }
}

  public isValid(text: string): boolean {
    const regex = this.annotationPatterns[AnnotationFormat.ONSONG];
    return regex ? regex.test(text) : false;
  }

  public remove(text: string): string {
    const lines = text.split('\n');
    const filteredLines = lines.filter(line => !line.trim().startsWith('*'));
    let result = filteredLines.join('\n');
    // Ensure there's a leading newline if the original text had one or if the result is not empty
    if (text.startsWith('\n') || result.length > 0) {
        if (!result.startsWith('\n') && result.length > 0) {
            result = '\n' + result;
        } else if (result.length === 0 && text.startsWith('\n')) {
            result = '\n';
        }
    }
    return result;
  }
}