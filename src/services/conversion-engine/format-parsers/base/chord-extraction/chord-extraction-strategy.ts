/**
 * Strategy interface for chord extraction
 */
export interface ChordExtractionStrategy {
  extractChords(line: string): Array<{
    chord: string;
    originalText: string;
    startIndex: number;
    endIndex: number;
    placement?: 'above' | 'inline' | 'between';
  }>;
  
  normalizeChord(chord: string): string;
  removeChordMarkup(line: string): string;
}