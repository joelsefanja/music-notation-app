import { ChordExtractionStrategy } from './chord-extraction-strategy';

/**
 * Songbook chord extraction strategy - handles chords above lyrics
 */
export class SongbookChordStrategy implements ChordExtractionStrategy {
  extractChords(line: string) {
    const chordMatches: Array<{
      chord: string;
      originalText: string;
      startIndex: number;
      endIndex: number;
      placement?: 'above' | 'inline' | 'between';
    }> = [];

    // Look for chord-like patterns separated by spaces
    const chordPattern = /\b([A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?)\b/g;
    let match;

    while ((match = chordPattern.exec(line)) !== null) {
      // Only consider it a chord if it looks like a chord line (mostly chords, minimal text)
      if (this.looksLikeChordLine(line)) {
        chordMatches.push({
          chord: match[1],
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          placement: 'above'
        });
      }
    }

    return chordMatches;
  }

  normalizeChord(chord: string): string {
    return chord.trim();
  }

  removeChordMarkup(line: string): string {
    // For songbook, if it's a chord line, return empty, otherwise return as-is
    if (this.looksLikeChordLine(line)) {
      return '';
    }
    return line.trim();
  }

  private looksLikeChordLine(line: string): boolean {
    if (!line || line.length === 0) return false;
    
    const words = line.trim().split(/\s+/);
    const chordWords = words.filter(word => this.looksLikeChord(word));
    
    return chordWords.length >= Math.max(1, words.length * 0.5);
  }

  private looksLikeChord(word: string): boolean {
    const chordPattern = /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?$/;
    return chordPattern.test(word);
  }
}