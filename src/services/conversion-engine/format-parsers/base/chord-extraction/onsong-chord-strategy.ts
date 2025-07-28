import { ChordExtractionStrategy } from './chord-extraction-strategy';

/**
 * OnSong chord extraction strategy - handles [C] [Am] [F] notation
 */
export class OnSongChordStrategy implements ChordExtractionStrategy {
  extractChords(line: string) {
    const chordMatches: Array<{
      chord: string;
      originalText: string;
      startIndex: number;
      endIndex: number;
      placement?: 'above' | 'inline' | 'between';
    }> = [];

    const chordPattern = /\[([^\]]+)\]/g;
    let match;

    while ((match = chordPattern.exec(line)) !== null) {
      chordMatches.push({
        chord: match[1],
        originalText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        placement: 'inline'
      });
    }

    return chordMatches;
  }

  normalizeChord(chord: string): string {
    return chord.trim();
  }

  removeChordMarkup(line: string): string {
    return line.replace(/\[[^\]]+\]/g, '').trim();
  }
}