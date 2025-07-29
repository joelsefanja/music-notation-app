/**
 * Enhanced Format Detector implementation
 * Detects music notation formats with improved accuracy and confidence scoring
 */

import { 
  IFormatDetector, 
  FormatDetectionResult 
} from '../../types/interfaces/core-interfaces';
import { NotationFormat } from '../../types/line';

/**
 * Format detection patterns and scoring
 */
interface FormatPattern {
  pattern: RegExp;
  weight: number;
  description: string;
}

/**
 * Enhanced format detector with confidence scoring
 */
export class EnhancedFormatDetector implements IFormatDetector {
  private formatPatterns: Map<NotationFormat, FormatPattern[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  /**
   * Detect the most likely format of the input text
   */
  detectFormat(text: string): FormatDetectionResult {
    // Validate input
    if (text === null || text === undefined) {
      throw new Error('Input text is required and must be a string');
    }
    
    if (typeof text !== 'string') {
      throw new Error('Input text is required and must be a string');
    }
    
    if (text.trim().length === 0) {
      return {
        format: NotationFormat.ONSONG, // Default fallback
        confidence: 0
      };
    }

    const results = this.detectAllFormats(text);
    return results.length > 0 ? results[0] : {
      format: NotationFormat.ONSONG,
      confidence: 0
    };
  }

  /**
   * Detect all possible formats with confidence scores
   */
  detectAllFormats(text: string): FormatDetectionResult[] {
    // Validate input
    if (text === null || text === undefined) {
      throw new Error('Input text is required and must be a string');
    }
    
    if (typeof text !== 'string') {
      throw new Error('Input text is required and must be a string');
    }
    
    const results: FormatDetectionResult[] = [];
    const normalizedText = this.normalizeText(text);

    for (const [format, patterns] of this.formatPatterns) {
      const confidence = this.calculateConfidence(normalizedText, patterns);
      
      if (confidence > 0) {
        results.push({ format, confidence });
      }
    }

    // Sort by confidence (highest first)
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Add a custom format pattern
   */
  addFormatPattern(format: NotationFormat, pattern: RegExp, weight: number, description: string): void {
    if (!this.formatPatterns.has(format)) {
      this.formatPatterns.set(format, []);
    }
    
    this.formatPatterns.get(format)!.push({
      pattern,
      weight,
      description
    });
  }

  /**
   * Get format patterns for debugging
   */
  getFormatPatterns(format: NotationFormat): FormatPattern[] {
    return this.formatPatterns.get(format) || [];
  }

  /**
   * Initialize format detection patterns
   */
  private initializePatterns(): void {
    // ChordPro patterns
    this.formatPatterns.set(NotationFormat.CHORDPRO, [
      {
        pattern: /\{(?:title|t|subtitle|st|artist|composer|key|time|tempo|capo):/i,
        weight: 0.9,
        description: 'ChordPro directive'
      },
      {
        pattern: /\{(?:comment|c):/i,
        weight: 0.7,
        description: 'ChordPro comment'
      },
      {
        pattern: /\{(?:start_of_|end_of_)(?:chorus|verse|bridge)/i,
        weight: 0.8,
        description: 'ChordPro section marker'
      },
      {
        pattern: /\{[A-G][#b]?[^}]*\}/g,
        weight: 0.6,
        description: 'ChordPro chord notation'
      }
    ]);

    // OnSong patterns
    this.formatPatterns.set(NotationFormat.ONSONG, [
      {
        pattern: /^\*[^*\n]+$/m,
        weight: 0.8,
        description: 'OnSong comment line'
      },
      {
        pattern: /\[[A-G][#b]?[^\]]*\]/g,
        weight: 0.7,
        description: 'OnSong chord brackets'
      },
      {
        pattern: /^[A-Z][a-z]*\s*\d*:?\s*$/m,
        weight: 0.6,
        description: 'OnSong section header'
      },
      {
        pattern: /^Title:\s*|^Artist:\s*|^Key:\s*/m,
        weight: 0.5,
        description: 'OnSong metadata'
      }
    ]);

    // Nashville Number System patterns
    this.formatPatterns.set(NotationFormat.NASHVILLE, [
      {
        pattern: /\b[1-7][#b]?[m°+]?(?:\/[1-7][#b]?)?\b/g,
        weight: 0.9,
        description: 'Nashville numbers'
      },
      {
        pattern: /[◆^.<>]/g,
        weight: 0.7,
        description: 'Nashville rhythmic symbols'
      },
      {
        pattern: /\|[^|]*\|/g,
        weight: 0.6,
        description: 'Nashville bar lines'
      }
    ]);

    // Songbook patterns
    this.formatPatterns.set(NotationFormat.SONGBOOK, [
      {
        pattern: /^\([^)]+\)$/m,
        weight: 0.8,
        description: 'Songbook parenthetical comments'
      },
      {
        pattern: /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?\s+[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?\s+[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?/m,
        weight: 0.85,
        description: 'Songbook chord line above lyrics'
      },
      {
        pattern: /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?\s*$/m,
        weight: 0.6,
        description: 'Single chord line in Songbook format'
      }
    ]);

    // Guitar Tabs patterns
    this.formatPatterns.set(NotationFormat.GUITAR_TABS, [
      {
        pattern: /^\[(?:Verse|Chorus|Bridge|Intro|Outro|Solo|Pre-Chorus|Tag|Coda|Instrumental|Refrain|Break|Interlude)(?:\s+\d+)?\]$/mi,
        weight: 0.95,
        description: 'Guitar tabs section headers in brackets'
      },
      {
        pattern: /^\s*[A-G][#b]?\s*$/m,
        weight: 0.7,
        description: 'Single chord line above lyrics'
      },
      {
        pattern: /^[A-G][#b]?(?:\s+[A-G][#b]?)*\s*$/m,
        weight: 0.8,
        description: 'Multiple chords line'
      },
      {
        pattern: /^[eEbBgGdDaA][\|\-\d\s]+$/m,
        weight: 0.6,
        description: 'Guitar tab string notation'
      },
      {
        pattern: /^\s*\d+[\-\d\s]*\d+\s*$/m,
        weight: 0.5,
        description: 'Guitar tab fret numbers'
      },
      {
        pattern: /[h^p~\/\\]/g,
        weight: 0.3,
        description: 'Guitar tab technique symbols'
      }
    ]);

    // Planning Center Online patterns
    this.formatPatterns.set(NotationFormat.PCO, [
      {
        pattern: /<b>[^<]+<\/b>/g,
        weight: 0.8,
        description: 'PCO bold annotations'
      },
      {
        pattern: /^[A-Z][a-z]+\s+\d+$/m,
        weight: 0.6,
        description: 'PCO section numbering'
      }
    ]);
  }

  /**
   * Calculate confidence score for a format
   */
  private calculateConfidence(text: string, patterns: FormatPattern[]): number {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const textLength = text.length;

    for (const { pattern, weight } of patterns) {
      maxPossibleScore += weight;
      
      const matches = text.match(pattern);
      if (matches) {
        // Base score from weight
        let score = weight;
        
        // Bonus for multiple matches
        if (matches.length > 1) {
          score *= Math.min(1.5, 1 + (matches.length - 1) * 0.1);
        }
        
        // Bonus for match density (matches per character)
        const density = matches.length / textLength;
        if (density > 0.01) { // More than 1% of characters are matches
          score *= 1.2;
        }
        
        totalScore += score;
      }
    }

    // Apply format-specific adjustments
    totalScore = this.applyFormatSpecificAdjustments(text, totalScore, patterns);

    // Normalize to 0-1 range
    const confidence = maxPossibleScore > 0 ? Math.min(1, totalScore / maxPossibleScore) : 0;
    
    // Apply minimum threshold
    return confidence > 0.1 ? confidence : 0;
  }

  /**
   * Apply format-specific confidence adjustments
   */
  private applyFormatSpecificAdjustments(text: string, score: number, patterns: FormatPattern[]): number {
    // Check if this is for Songbook format and if Guitar Tabs section headers are present
    const isSongbookPatterns = patterns.some(p => p.description.includes('Songbook'));
    if (isSongbookPatterns) {
      // If text has Guitar Tabs section headers, heavily penalize Songbook confidence
      const hasGuitarTabsSections = /^\[(?:Intro|Verse|Chorus|Bridge|Outro|Solo|Pre-Chorus|Tag|Coda|Instrumental|Refrain|Break|Interlude)(?:\s+\d+)?\]$/mi.test(text);
      if (hasGuitarTabsSections) {
        score *= 0.1; // Heavily reduce Songbook confidence
      }
    }

    // Check if this is for Guitar Tabs format
    const isGuitarTabsPatterns = patterns.some(p => p.description.includes('Guitar tabs'));
    if (isGuitarTabsPatterns) {
      // Boost confidence if section headers are present
      const hasGuitarTabsSections = /^\[(?:Intro|Verse|Chorus|Bridge|Outro|Solo|Pre-Chorus|Tag|Coda|Instrumental|Refrain|Break|Interlude)(?:\s+\d+)?\]$/mi.test(text);
      if (hasGuitarTabsSections) {
        score *= 1.5; // Boost Guitar Tabs confidence when section headers are present
      }
    }

    return score;
  }

  /**
   * Normalize text for better pattern matching
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Handle old Mac line endings
      .trim();
  }

  /**
   * Get detection statistics
   */
  getDetectionStats(text: string): {
    totalPatterns: number;
    matchedPatterns: number;
    formatScores: Record<string, number>;
    topFormat: string;
    confidence: number;
  } {
    const results = this.detectAllFormats(text);
    const formatScores: Record<string, number> = {};
    
    let totalPatterns = 0;
    let matchedPatterns = 0;

    for (const [format, patterns] of this.formatPatterns) {
      totalPatterns += patterns.length;
      
      for (const pattern of patterns) {
        if (text.match(pattern.pattern)) {
          matchedPatterns++;
        }
      }
      
      const result = results.find(r => r.format === format);
      formatScores[format] = result?.confidence || 0;
    }

    const topResult = results[0];

    return {
      totalPatterns,
      matchedPatterns,
      formatScores,
      topFormat: topResult?.format || 'unknown',
      confidence: topResult?.confidence || 0
    };
  }

  /**
   * Test format detection with detailed results
   */
  testDetection(text: string): {
    detectedFormat: NotationFormat;
    confidence: number;
    allResults: FormatDetectionResult[];
    patternMatches: Record<string, Array<{ pattern: string; matches: number; weight: number }>>;
  } {
    const allResults = this.detectAllFormats(text);
    const detectedFormat = allResults[0]?.format || NotationFormat.ONSONG;
    const confidence = allResults[0]?.confidence || 0;
    
    const patternMatches: Record<string, Array<{ pattern: string; matches: number; weight: number }>> = {};

    for (const [format, patterns] of this.formatPatterns) {
      patternMatches[format] = patterns.map(({ pattern, weight, description }) => ({
        pattern: description,
        matches: (text.match(pattern) || []).length,
        weight
      }));
    }

    return {
      detectedFormat,
      confidence,
      allResults,
      patternMatches
    };
  }
}