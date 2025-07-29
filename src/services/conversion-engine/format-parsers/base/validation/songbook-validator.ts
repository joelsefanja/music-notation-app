import { FormatValidator } from './format-validator';

/**
 * Songbook format validator
 */
export class SongbookValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    const lines = text.split('\n');
    let chordLyricPairs = 0;

    // Look for chord-over-lyrics pattern
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();

      if (this.looksLikeChordLine(currentLine) && this.looksLikeLyricLine(nextLine)) {
        chordLyricPairs++;
      }
    }

    // Look for Songbook annotations (text in parentheses)
    const hasSongbookAnnotations = /^\([^)]+\)$/m.test(text);

    return chordLyricPairs > 0 || hasSongbookAnnotations;
  }

  private looksLikeChordLine(line: string): boolean {
    if (!line || line.length === 0) return false;

    const cleanLine = line.replace(/\s+/g, ' ').trim();
    const words = cleanLine.split(' ');

    const chordWords = words.filter(word => this.looksLikeChord(word));
    return chordWords.length >= Math.max(1, words.length * 0.5);
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