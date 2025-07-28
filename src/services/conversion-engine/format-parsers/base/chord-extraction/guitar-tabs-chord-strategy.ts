import { ChordExtractionStrategy } from './chord-extraction-strategy';

/**
 * Guitar Tabs chord extraction strategy - handles simple chord lines
 */
export class GuitarTabsChordStrategy implements ChordExtractionStrategy {
  extractChords(line: string) {
    const chordMatches: Array<{
      chord: string;
      originalText: string;
      startIndex: number;
      endIndex: number;
      placement?: 'above' | 'inline' | 'between';
    }> = [];

    // Similar to Songbook but more lenient
    const chordPattern = /\b([A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?)\b/g;
    let match;

    while ((match = chordPattern.exec(line)) !== null) {
      chordMatches.push({
        chord: match[1],
        originalText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        placement: 'above'
      });
    }

    return chordMatches;
  }

  normalizeChord(chord: string): string {
    return chord.trim();
  }

  removeChordMarkup(line: string): string {
    return line.trim();
  }
}