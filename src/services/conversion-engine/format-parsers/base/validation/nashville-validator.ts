import { FormatValidator } from './format-validator';

/**
 * Nashville format validator
 */
export class NashvilleValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // Look for Nashville number patterns
    const nashvillePatterns = [
      /\b[1-7][#b]?[m°+]?(?:sus|add|maj|min)?[0-9]*(?:\/[1-7][#b]?)?\b/g,
      /\[[1-7][#b]?[m°+]?(?:sus|add|maj|min)?[0-9]*(?:\/[1-7][#b]?)?\]/g,
      /[◆^.<>]/g // Rhythmic symbols
    ];

    const hasValidNumbers = nashvillePatterns.slice(0, 2).some(pattern => {
      pattern.lastIndex = 0;
      const matches = text.match(pattern);
      return matches && matches.some(match => {
        const cleanMatch = match.replace(/[\[\]]/g, '');
        const numberMatch = cleanMatch.match(/^[1-7]/);
        return numberMatch !== null;
      });
    });

    const hasRhythmicSymbols = nashvillePatterns[2].test(text);

    return hasValidNumbers || hasRhythmicSymbols;
  }
}