import { BaseLineParserWithChords } from '../base/base-line-parser-with-chords';
import { AnnotationFormat } from '../../../../types/format';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns';

/**
 * Planning Center format parser - handles <b>text</b> annotations
 */
export class PlanningCenterParser extends BaseLineParserWithChords {
  protected readonly annotationPatterns = AnnotationPatterns.getPatterns(AnnotationFormat.PCO);

  protected getFormat(): AnnotationFormat {
    return AnnotationFormat.GUITAR_TABS; // Uses similar chord extraction as Guitar Tabs
  }

  public isValid(text: string): boolean {
    return FormatValidatorFactory.getValidator(AnnotationFormat.PCO).isValid(text);
  }
}