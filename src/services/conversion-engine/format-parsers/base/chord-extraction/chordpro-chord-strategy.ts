import { ChordExtractionStrategy } from './chord-extraction-strategy';

/**
 * ChordPro chord extraction strategy - handles {C} {Am} {F} notation
 */
export class ChordProChordStrategy implements ChordExtractionStrategy {
  extractChords(line: string) {
    const chordMatches: Array<{
      chord: string;
      originalText: string;
      startIndex: number;
      endIndex: number;
      placement?: 'above' | 'inline' | 'between';
    }> = [];

    const chordPattern = /\{([A-G][#b]?[^}]*)\}/g;
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
    return line.replace(/\{[^}]+\}/g, '').trim();
  }
}