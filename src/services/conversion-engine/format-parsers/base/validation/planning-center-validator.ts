import { FormatValidator } from './format-validator';

/**
 * Planning Center format validator
 */
export class PlanningCenterValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // Look for PCO bold annotations <b>text</b>
    const hasBoldAnnotations = /<b>[^<]+<\/b>/.test(text);
    
    // Look for PCO-style chord notation
    const hasPCOChords = /\b[A-G][#b]?[^\s]*\b/.test(text);
    
    return hasBoldAnnotations || hasPCOChords;
  }
}