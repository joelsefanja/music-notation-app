import { ChordExtractionStrategy } from './chord-extraction-strategy';
import { OnSongChordStrategy } from './onsong-chord-strategy';
import { ChordProChordStrategy } from './chordpro-chord-strategy';
import { SongbookChordStrategy } from './songbook-chord-strategy';
import { NashvilleChordStrategy } from './nashville-chord-strategy';
import { GuitarTabsChordStrategy } from './guitar-tabs-chord-strategy';
import { AnnotationFormat } from '../../../../../types/line';

/**
 * Factory for creating chord extraction strategies
 */
export class ChordExtractionFactory {
  private static strategies = new Map<AnnotationFormat, ChordExtractionStrategy>([
    [AnnotationFormat.ONSONG, new OnSongChordStrategy()],
    [AnnotationFormat.CHORDPRO, new ChordProChordStrategy()],
    [AnnotationFormat.SONGBOOK, new SongbookChordStrategy()],
    [AnnotationFormat.GUITAR_TABS, new GuitarTabsChordStrategy()],
  ]);

  static getStrategy(format: AnnotationFormat): ChordExtractionStrategy {
    const strategy = this.strategies.get(format);
    if (!strategy) {
      throw new Error(`No chord extraction strategy found for format: ${format}`);
    }
    return strategy;
  }

  static getNashvilleStrategy(): NashvilleChordStrategy {
    return new NashvilleChordStrategy();
  }
}