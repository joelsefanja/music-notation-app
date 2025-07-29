import { FormatValidator } from './format-validator';

/**
 * OnSong format validator
 */
export class OnSongValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    // Look for OnSong chord brackets [C] [Am] etc.
    const hasChordBrackets = /\[[A-G][#b]?[^\]]*\]/.test(text);

    // Look for OnSong annotations *comment
    const hasOnSongAnnotations = /^\*[^*\n]+$/m.test(text);

    return hasChordBrackets || hasOnSongAnnotations;
  }
}