import { FormatValidator } from './format-validator';

/**
 * Guitar Tabs format validator
 */
export class GuitarTabsValidator implements FormatValidator {
  isValid(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // Look for section headers [Intro] [Verse] [Chorus]
    const hasSectionHeaders = /^\[(?:Intro|Verse|Chorus|Bridge|Outro|Solo|Pre-Chorus|Tag|Coda|Instrumental)\]/mi.test(text);
    
    // Look for guitar tab lines (strings with fret numbers) - Guitar tabs typically don't have chord lines
    const hasTabLines = /[eBGDAE]\|.*[0-9xX]+.*/.test(text);
    
    return hasSectionHeaders || hasTabLines;
  }
}