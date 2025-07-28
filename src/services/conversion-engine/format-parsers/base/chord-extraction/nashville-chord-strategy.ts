import { ChordExtractionStrategy } from './chord-extraction-strategy';

/**
 * Nashville chord extraction strategy - handles 1 4 5 1 notation with rhythmic symbols
 */
export class NashvilleChordStrategy implements ChordExtractionStrategy {
  extractChords(line: string) {
    const chordMatches: Array<{
      chord: string;
      originalText: string;
      startIndex: number;
      endIndex: number;
      placement?: 'above' | 'inline' | 'between';
    }> = [];

    // Pattern for Nashville numbers with optional rhythmic symbols
    const nashvillePattern = /([◆^.<>]*)\s*(\[?)([1-7][#b]?[m°+]?(?:sus|add|maj|min)?[0-9]*(?:\/[1-7][#b]?)?)\]?\s*([◆^.<>]*)/g;

    let match;
    while ((match = nashvillePattern.exec(line)) !== null) {
      const [fullMatch, beforeSymbols, bracket, nashvilleNumber, afterSymbols] = match;
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      chordMatches.push({
        chord: nashvilleNumber,
        originalText: fullMatch,
        startIndex,
        endIndex,
        placement: bracket ? 'above' : 'inline'
      });
    }

    return chordMatches;
  }

  normalizeChord(chord: string): string {
    const cleaned = chord.trim();
    if (!/^[1-7][#b]?[m°+]?(?:sus|add|maj|min)?[0-9]*(?:\/[1-7][#b]?)?$/.test(cleaned)) {
      throw new Error(`Invalid Nashville number format: ${cleaned}`);
    }
    return cleaned;
  }

  removeChordMarkup(line: string): string {
    return line
      .replace(/\[[1-7][#b]?[m°+]?(?:sus|add|maj|min)?[0-9]*(?:\/[1-7][#b]?)?\]/g, '')
      .replace(/[◆^.<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}