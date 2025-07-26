import { Annotation, AnnotationFormat } from '../../types';
import { IAnnotationParseResult } from '../../types/annotation';
import { IParser } from './parser.interface';

export abstract class BaseParser implements IParser {
  protected abstract readonly annotationPatterns: { [key in AnnotationFormat]?: RegExp };

  public abstract parse(text: string): IAnnotationParseResult[];
  public abstract parseOfFormat(text: string, format: AnnotationFormat): Annotation[];
  public abstract convert(annotation: Annotation, targetFormat: AnnotationFormat): string;
  public abstract isValid(text: string): boolean;

  public remove(text: string): string {
    let cleanText = text;
    for (const pattern of Object.values(this.annotationPatterns)) {
      if (pattern) {
        cleanText = cleanText.replace(pattern, '');
      }
    }
    return cleanText
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s*\n/gm, '')
      .trim();
  }

  protected determineAnnotationPosition(
    text: string,
    annotationIndex: number,
    format: AnnotationFormat
  ): 'above' | 'inline' | 'beside' {
    const lines = text.split('\n');
    let currentIndex = 0;
    let lineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentIndex + lines[i].length >= annotationIndex) {
        lineIndex = i;
        break;
      }
      currentIndex += lines[i].length + 1;
    }

    const line = lines[lineIndex];

    switch (format) {
      case AnnotationFormat.ONSONG:
        return line.trim().startsWith('*') ? 'above' : 'inline';
      case AnnotationFormat.SONGBOOK:
        return line.trim().startsWith('(') && line.trim().endsWith(')') ? 'above' : 'inline';
      case AnnotationFormat.PCO:
        const hasOtherContentPCO = line.replace(/<b>[^<]+<\/b>/g, '').trim().length > 0;
        return hasOtherContentPCO ? 'beside' : 'above';
      case AnnotationFormat.CHORDPRO:
        const annotationRegex = /\{(?:comment|c):\s*(.+?)\}/;
        const cleanedLine = line.replace(annotationRegex, '').trim();
        return cleanedLine.length > 0 ? 'beside' : 'above';
      default:
        return 'above';
    }
  }
}