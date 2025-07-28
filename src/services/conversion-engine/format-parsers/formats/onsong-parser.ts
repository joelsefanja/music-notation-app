import { BaseLineParserWithChords } from '../base/base-line-parser-with-chords';
import { AnnotationFormat } from '../../../../types/line';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns';

/**
 * OnSong format parser - handles [C] chord notation and *comment annotations
 */
export class OnSongParser extends BaseLineParserWithChords {
  protected readonly annotationPatterns = AnnotationPatterns.getPatterns(AnnotationFormat.ONSONG);

  protected getFormat(): AnnotationFormat {
    return AnnotationFormat.ONSONG;
  }

  public isValid(text: string): boolean {
    return FormatValidatorFactory.getValidator(AnnotationFormat.ONSONG).isValid(text);
  }
}
