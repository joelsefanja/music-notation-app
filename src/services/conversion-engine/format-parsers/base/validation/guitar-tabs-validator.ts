import { FormatValidator } from './format-validator';

/**
 * Guitar Tabs format validator
 */
export class GuitarTabsValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // Look for section headers [Intro] [Verse] [Chorus] - this is the primary indicator
    const hasSectionHeaders = /^\[(?:Intro|Verse|Chorus|Bridge|Outro|Solo|Pre-Chorus|Tag|Coda|Instrumental|Refrain|Break|Interlude)(?:\s+\d+)?\]$/mi.test(text);
    
    // Look for guitar tab lines (strings with fret numbers)
    const hasTabLines = /^[eBGDAE][\|\-\d\s]+$/m.test(text);
    
    // Guitar tabs format should have section headers OR actual tab notation
    // But if it has chord-over-lyrics pattern without section headers, it's likely Songbook
    if (!hasSectionHeaders && !hasTabLines) {
      // Check if it looks like Songbook format (chords above lyrics without brackets)
      const looksLikeSongbook = this.detectSongbookPattern(text);
      if (looksLikeSongbook) {
        return false;
      }
    }
    
    return hasSectionHeaders || hasTabLines;
  }

  private detectSongbookPattern(text: string): boolean {
    const lines = text.split('\n');
    let chordLyricPairs = 0;
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();
      
      if (this.looksLikeChordLine(currentLine) && this.looksLikeLyricLine(nextLine)) {
        chordLyricPairs++;
      }
    }
    
    return chordLyricPairs > 0;
  }

  private looksLikeChordLine(line: string): boolean {
    if (!line || line.length === 0) return false;
    
    const cleanLine = line.replace(/\s+/g, ' ').trim();
    const words = cleanLine.split(' ');
    
    const chordWords = words.filter(word => this.looksLikeChord(word));
    return chordWords.length >= Math.max(1, words.length * 0.7);
  }

  private looksLikeLyricLine(line: string): boolean {
    if (!line || line.length === 0) return false;
    
    const hasLetters = /[a-zA-Z]/.test(line);
    const words = line.trim().split(/\s+/);
    const chordWords = words.filter(word => this.looksLikeChord(word));
    
    return hasLetters && chordWords.length < words.length * 0.3;
  }

  private looksLikeChord(word: string): boolean {
    const chordPattern = /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?$/;
    return chordPattern.test(word);
  }
}