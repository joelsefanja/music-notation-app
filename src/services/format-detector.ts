
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

    // Guitar tabs detection
    const tabRegex = /[-\d]+[-\d\s]+[-\d]+/g;
    const tabMatches = text.match(tabRegex);
    if (tabMatches) {
      const confidence = Math.min(tabMatches.length * 0.4, 1);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedFormat = 'guitar_tabs';
        indicators.push('Guitar tab notation found');
      }
    }

    return {
      format: detectedFormat,
      confidence: maxConfidence,
      indicators
    };
  }
}
