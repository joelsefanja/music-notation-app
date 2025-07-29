import { BaseLineParserWithChords } from '../base/base-line-parser-with-chords';
import { AnnotationFormat } from '../../../../types/format';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns';

/**
 * ChordPro format parser - handles {C} chord notation and {comment: text} directives
 */
export class ChordProParser extends BaseLineParserWithChords {
  protected readonly annotationPatterns = AnnotationPatterns.getPatterns(AnnotationFormat.CHORDPRO);

  protected getFormat(): AnnotationFormat {
    return AnnotationFormat.CHORDPRO;
  }

  public isValid(text: string): boolean {
    return FormatValidatorFactory.getValidator(AnnotationFormat.CHORDPRO).isValid(text);
  }
}
