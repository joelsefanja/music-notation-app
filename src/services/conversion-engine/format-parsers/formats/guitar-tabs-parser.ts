import { BaseParser } from '../base/base-parser';
import { AnnotationFormat, TextLine } from '../../../../types/line';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns';

/**
 * Guitar Tabs format parser - handles [Section] headers (no chord lines typically)
 */
export class GuitarTabsParser extends BaseParser {
  protected readonly annotationPatterns = AnnotationPatterns.getPatterns(AnnotationFormat.GUITAR_TABS);

  public isValid(text: string): boolean {
    return FormatValidatorFactory.getValidator(AnnotationFormat.GUITAR_TABS).isValid(text);
  }

  protected parseContentLine(line: string, lineNumber: number): TextLine {
    // Guitar tabs typically don't have chord objects on content lines
    return {
      type: 'text',
      text: line,
      chords: [],
      lineNumber
    };
  }
}
