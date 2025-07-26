import { NotationFormat } from '../types';

/**
 * Result of format detection with confidence scoring
 */
export interface FormatDetectionResult {
  format: NotationFormat;
  confidence: number;
  indicators: string[];
}

/**
 * Pattern definitions for each notation format
 */
interface FormatPattern {
  name: NotationFormat;
  patterns: RegExp[];
  indicators: string[];
  weight: number;
}

/**
 * Format detection engine that analyzes text to determine notation format
 */
export class FormatDetector {
  private readonly formatPatterns: FormatPattern[] = [
    {
      name: NotationFormat.NASHVILLE,
      patterns: [
        /\b[1-7][mb°]?(?:sus[24]?|add[0-9]|maj[0-9]|[0-9]+)?(?:\/[1-7])?/g,
        /\b[1-7]\s*-\s*[1-7]/g,
        /\|[^|]*[1-7][^|]*\|/g
      ],
      indicators: ['Nashville numbers', 'numeric chord notation', 'bar notation with numbers'],
      weight: 1.0
    },
    {
      name: NotationFormat.ONSONG,
      patterns: [
        /\[[A-G][#b]?(?:m|maj|dim|aug)?(?:sus[24]?|add[0-9]|[0-9]+)?(?:\/[A-G][#b]?)?\]/g,
        /^\*[^*\n]+$/gm,
        /\[[A-G][#b]?[^\]]*\][^[]*\w/g
      ],
      indicators: ['chords in brackets', 'inline chord placement', 'OnSong annotations (*)'],
      weight: 1.0
    },
    {
      name: NotationFormat.SONGBOOK,
      patterns: [
        /^[A-G][#b]?(?:m|maj|dim|aug)?(?:sus[24]?|add[0-9]|[0-9]+)?(?:\/[A-G][#b]?)?\s+[A-G][#b]?/gm,
        /^\([^)]+\)$/gm,
        /^[A-G][#b]?(?:m|maj|dim|aug)?[^\n]*\n[a-z]/gmi
      ],
      indicators: ['chords above lyrics', 'chord-over-lyrics format', 'Songbook Pro annotations (())'],
      weight: 1.0
    },
    {
      name: NotationFormat.CHORDPRO,
      patterns: [
        /\{[^}]+\}/g,
        /\{title:[^}]+\}/gi,
        /\{artist:[^}]+\}/gi,
        /\{key:[^}]+\}/gi,
        /\{start_of_chorus\}/gi,
        /\{end_of_chorus\}/gi
      ],
      indicators: ['ChordPro directives {}', 'metadata tags', 'section markers'],
      weight: 1.0
    },
    {
      name: NotationFormat.GUITAR_TABS,
      patterns: [
        /^\[[A-Za-z][^\]]*\]$/gm,
        /^[A-G][#b]?(?:m|maj|dim|aug)?(?:sus[24]?|add[0-9]|[0-9]+)?(?:\/[A-G][#b]?)?\s*-\s*/gm,
        /^\s*[A-G][#b]?[^\n]*\n\s*[^A-G\(\[\n]/gm
      ],
      indicators: ['section headers in brackets', 'chord lines followed by lyrics', 'Guitar Tabs format'],
      weight: 1.0
    }
  ];

  /**
   * Detect the format of the given chord sheet text
   */
  public detectFormat(text: string): FormatDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        format: NotationFormat.ONSONG,
        confidence: 0,
        indicators: ['empty input - defaulting to OnSong']
      };
    }

    const results = this.formatPatterns.map(pattern => {
      const score = this.calculateFormatScore(text, pattern);
      return {
        format: pattern.name,
        confidence: score,
        indicators: score > 0 ? pattern.indicators : []
      };
    });

    // Sort by confidence score (highest first)
    results.sort((a, b) => b.confidence - a.confidence);

    const topResult = results[0];
    
    // If confidence is too low, apply fallback logic
    if (topResult.confidence < 0.3) {
      return this.applyFallbackDetection(text);
    }

    return topResult;
  }

  /**
   * Calculate confidence score for a specific format pattern
   */
  private calculateFormatScore(text: string, pattern: FormatPattern): number {
    let score = 0;
    const lines = text.split('\n');
    const totalLines = lines.length;

    pattern.patterns.forEach(regex => {
      const matches = text.match(regex);
      if (matches) {
        // Base score from number of matches
        score += matches.length * 0.1;
        
        // Bonus for pattern density
        const density = matches.length / totalLines;
        score += density * 0.5;
      }
    });

    // Apply format-specific scoring logic
    const formatBonus = this.applyFormatSpecificScoring(text, pattern.name);
    score += formatBonus;

    // Normalize score to 0-1 range, but allow slight overflow for tie-breaking
    return Math.min(score * pattern.weight, 1.5);
  }

  /**
   * Apply format-specific scoring rules
   */
  private applyFormatSpecificScoring(text: string, format: NotationFormat): number {
    let bonus = 0;

    switch (format) {
      case NotationFormat.NASHVILLE:
        // Look for Nashville-specific patterns
        if (/\b[1-7]\s*-\s*[1-7]/.test(text)) bonus += 0.3;
        if (/\|[^|]*[1-7][^|]*\|/.test(text)) bonus += 0.2;
        if (/\b[1-7][mb°]/.test(text)) bonus += 0.2;
        // Penalize if it has chord letters (less likely to be Nashville)
        if (/\b[A-G][#b]?(?:m|maj)/.test(text)) bonus -= 0.1;
        // Penalize if it has ChordPro metadata (more likely ChordPro)
        if (/\{title:/gi.test(text)) bonus -= 0.2;
        break;

      case NotationFormat.ONSONG:
        // Look for OnSong-specific patterns
        if (/\[[A-G][#b]?[^\]]*\][^[]*\w/.test(text)) bonus += 0.3;
        if (/^\*[^*\n]+$/gm.test(text)) bonus += 0.2;
        // Penalize if it has section headers in brackets (more likely Guitar Tabs)
        if (/^\[[A-Za-z][^\]]*\]$/gm.test(text)) bonus -= 0.2;
        // Penalize if it has ChordPro metadata (more likely ChordPro)
        if (/\{title:/gi.test(text)) bonus -= 0.2;
        break;

      case NotationFormat.SONGBOOK:
        // Look for Songbook Pro patterns
        if (/^\([^)]+\)$/gm.test(text)) bonus += 0.3;
        if (/^[A-G][#b]?(?:m|maj|dim|aug)?[^\n]*\n[a-z]/gmi.test(text)) bonus += 0.4;
        if (/^[A-G][#b]?(?:m|maj|dim|aug)?(?:sus[24]?|add[0-9]|[0-9]+)?(?:\/[A-G][#b]?)?\s+[A-G][#b]?/gm.test(text)) bonus += 0.3;
        // Penalize if it has section headers in brackets (more likely Guitar Tabs)
        if (/^\[[A-Za-z][^\]]*\]$/gm.test(text)) bonus -= 0.4;
        // Penalize if it has chord brackets (more likely OnSong)
        if (/\[[A-G][#b]?[^\]]*\]/.test(text)) bonus -= 0.3;
        break;

      case NotationFormat.CHORDPRO:
        // Look for ChordPro directives
        if (/\{title:/gi.test(text)) bonus += 0.8;
        if (/\{artist:/gi.test(text)) bonus += 0.4;
        if (/\{key:/gi.test(text)) bonus += 0.4;
        if (/\{start_of_chorus\}/gi.test(text)) bonus += 0.4;
        if (/\{end_of_chorus\}/gi.test(text)) bonus += 0.4;
        if (/\{start_of_verse\}/gi.test(text)) bonus += 0.4;
        if (/\{[^}]+\}/.test(text)) bonus += 0.2;
        break;

      case NotationFormat.GUITAR_TABS:
        // Look for Guitar Tabs patterns
        if (/^\[[A-Za-z][^\]]*\]$/gm.test(text)) bonus += 0.6;
        if (/^[A-G][#b]?(?:m|maj|dim|aug)?(?:sus[24]?|add[0-9]|[0-9]+)?(?:\/[A-G][#b]?)?\s*-\s*/gm.test(text)) bonus += 0.3;
        if (/^\s*[A-G][#b]?[^\n]*\n\s*[^A-G\(\[\n]/gm.test(text)) bonus += 0.2;
        // Strong bonus for multiple section headers
        const sectionHeaders = text.match(/^\[[A-Za-z][^\]]*\]$/gm);
        if (sectionHeaders && sectionHeaders.length > 1) bonus += 0.4;
        // Bonus for common section names
        if (/^\[(Intro|Verse|Chorus|Bridge|Outro)\]/gmi.test(text)) bonus += 0.3;
        // Penalize if it has chord brackets (more likely OnSong)
        if (/\[[A-G][#b]?[^\]]*\]/.test(text)) bonus -= 0.2;
        break;
    }

    return bonus;
  }

  /**
   * Apply fallback detection when confidence is low
   */
  private applyFallbackDetection(text: string): FormatDetectionResult {
    // Check for basic chord patterns
    const hasChordBrackets = /\[[A-G][#b]?[^\]]*\]/.test(text);
    const hasChordLines = /^[A-G][#b]?(?:m|maj|dim|aug)?(?:sus[24]?|add[0-9]|[0-9]+)?(?:\/[A-G][#b]?)?$/gm.test(text);
    const hasNumbers = /\b[1-7]/.test(text);
    const hasSectionHeaders = /^\[[A-Za-z][^\]]*\]$/gm.test(text);

    if (hasChordBrackets && !hasSectionHeaders) {
      return {
        format: NotationFormat.ONSONG,
        confidence: 0.5,
        indicators: ['fallback: detected chord brackets']
      };
    }

    if (hasNumbers && !/\b[A-G][#b]?(?:m|maj)/.test(text)) {
      return {
        format: NotationFormat.NASHVILLE,
        confidence: 0.4,
        indicators: ['fallback: detected numeric notation']
      };
    }

    if (hasChordLines && !hasSectionHeaders && !hasChordBrackets) {
      return {
        format: NotationFormat.SONGBOOK,
        confidence: 0.4,
        indicators: ['fallback: detected chord lines']
      };
    }

    // Ultimate fallback
    return {
      format: NotationFormat.ONSONG,
      confidence: 0.2,
      indicators: ['fallback: default to OnSong format']
    };
  }

  /**
   * Get all possible formats with their confidence scores
   */
  public detectAllFormats(text: string): FormatDetectionResult[] {
    if (!text || text.trim().length === 0) {
      return [{
        format: NotationFormat.ONSONG,
        confidence: 0,
        indicators: ['empty input']
      }];
    }

    return this.formatPatterns.map(pattern => {
      const score = this.calculateFormatScore(text, pattern);
      return {
        format: pattern.name,
        confidence: score,
        indicators: score > 0 ? pattern.indicators : []
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }
}