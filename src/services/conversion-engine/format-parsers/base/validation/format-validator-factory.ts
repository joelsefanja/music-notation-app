import { FormatValidator } from './format-validator';
import { OnSongValidator } from './onsong-validator';
import { ChordProValidator } from './chordpro-validator';
import { SongbookValidator } from './songbook-validator';
import { NashvilleValidator } from './nashville-validator';
import { GuitarTabsValidator } from './guitar-tabs-validator';
import { PlanningCenterValidator } from './planning-center-validator';
import { AnnotationFormat } from '../../../../../types/line';

/**
 * Factory for creating format validators
 */
export class FormatValidatorFactory {
  private static validators = new Map<AnnotationFormat, FormatValidator>([
    [AnnotationFormat.ONSONG, new OnSongValidator()],
    [AnnotationFormat.CHORDPRO, new ChordProValidator()],
    [AnnotationFormat.SONGBOOK, new SongbookValidator()],
    [AnnotationFormat.GUITAR_TABS, new GuitarTabsValidator()],
    [AnnotationFormat.PCO, new PlanningCenterValidator()],
  ]);

  static getValidator(format: AnnotationFormat): FormatValidator {
    const validator = this.validators.get(format);
    if (!validator) {
      throw new Error(`No validator found for format: ${format}`);
    }
    return validator;
  }

  static getNashvilleValidator(): NashvilleValidator {
    return new NashvilleValidator();
  }
}