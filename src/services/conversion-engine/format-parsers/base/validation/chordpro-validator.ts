import { FormatValidator } from './format-validator';

/**
 * ChordPro format validator
 */
export class ChordProValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    // Look for ChordPro directives {title: ...} {artist: ...}
    const hasDirectives = /\{(?:title|artist|key|tempo|time|capo|comment|c):/i.test(text);

    // Look for ChordPro chord notation {C} {Am}
    const hasChordBraces = /\{[A-G][#b]?[^}]*\}/.test(text);

    // Look for section markers {start_of_verse} {end_of_chorus}
    const hasSectionMarkers = /\{(?:start_of_|end_of_)(?:verse|chorus|bridge)\}/i.test(text);

    return hasDirectives || hasChordBraces || hasSectionMarkers;
  }
}