import { BaseLineParserWithChords } from '../base/base-line-parser-with-chords';
import { AnnotationFormat } from '../../../../types/format';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns';

/**
 * Songbook format parser - handles chords above lyrics and (comment) annotations
 */
export class SongbookParser extends BaseLineParserWithChords {
  protected readonly annotationPatterns = AnnotationPatterns.getPatterns(AnnotationFormat.SONGBOOK);

  protected getFormat(): AnnotationFormat {
    return AnnotationFormat.SONGBOOK;
  }

  public isValid(text: string): boolean {
    return FormatValidatorFactory.getValidator(AnnotationFormat.SONGBOOK).isValid(text);
  }
}