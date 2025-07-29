
import { NotationFormat } from '../types';

export interface FormatDetectionResult {
  format: NotationFormat;
  confidence: number;
  indicators: string[];
}

export class FormatDetector {
  detectFormat(text: string): FormatDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        format: 'chordpro',
        confidence: 0,
        indicators: ['empty input']
      };
    }

    const indicators: string[] = [];
    let maxConfidence = 0;
    let detectedFormat: NotationFormat = 'chordpro';

    // ChordPro detection
    const chordProRegex = /\{[^}]+\}/g;
    const chordProMatches = text.match(chordProRegex);
    if (chordProMatches) {
      const confidence = Math.min(chordProMatches.length * 0.3, 1);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedFormat = 'chordpro';
        indicators.push('ChordPro directives found');
      }
    }

    // Nashville detection
    const nashvilleRegex = /[1-7][#b]?[m°+]?/g;
    const nashvilleMatches = text.match(nashvilleRegex);
    if (nashvilleMatches) {
      const confidence = Math.min(nashvilleMatches.length * 0.2, 1);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedFormat = 'nashville';
        indicators.push('Nashville numbers found');
      }
    }

    // Guitar tabs detection - section headers and chord patterns
    const sectionHeaderRegex = /^\[(?:Intro|Verse|Chorus|Bridge|Outro|Solo|Pre-Chorus|Tag|Coda|Instrumental|Refrain|Break|Interlude)(?:\s+\d+)?\]/mi;
    const chordLineRegex = /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?(?:\s+[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?)*\s*$/m;
    
    let guitarTabsScore = 0;
    
    if (sectionHeaderRegex.test(text)) {
      guitarTabsScore += 0.6;
      indicators.push('section headers in brackets');
    }
    
    const lines = text.split('\n');
    let chordLineCount = 0;
    for (const line of lines) {
      if (chordLineRegex.test(line.trim()) || /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?$/.test(line.trim())) {
        chordLineCount++;
      }
    }
    
    if (chordLineCount > 0) {
      guitarTabsScore += Math.min(chordLineCount * 0.2, 0.4);
      indicators.push('chord lines detected');
    }
    
    if (guitarTabsScore > maxConfidence) {
      maxConfidence = guitarTabsScore;
      detectedFormat = 'guitar_tabs';
    }

    return {
      format: detectedFormat,
      confidence: maxConfidence,
      indicators
    };
  }
}
