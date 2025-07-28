/**
 * Chord Parser implementation
 * Parses chord strings into components following Single Responsibility Principle
 */

import { IChordParser, ChordComponents, ValidationResult } from '../../../types/interfaces/core-interfaces';

/**
 * Enhanced chord parser that handles various chord notations
 */
export class ChordParser implements IChordParser {
  /**
   * Comprehensive regex for parsing chord components
   * Groups: root, accidental, quality, extensions, slash, bass note, bass accidental
   */
  private static readonly CHORD_REGEX = /^([A-G])([#b]?)([^/\s]*?)(?:\/([A-G])([#b]?))?$/;

  /**
   * Quality patterns with their normalized forms
   */
  private static readonly QUALITY_PATTERNS = new Map([
    ['', 'maj'],
    ['maj', 'maj'],
    ['major', 'maj'],
    ['M', 'maj'],
    ['m', 'min'],
    ['min', 'min'],
    ['minor', 'min'],
    ['-', 'min'],
    ['dim', 'dim'],
    ['diminished', 'dim'],
    ['°', 'dim'],
    ['o', 'dim'],
    ['aug', 'aug'],
    ['augmented', 'aug'],
    ['+', 'aug'],
    ['sus', 'sus'],
    ['sus4', 'sus'],
    ['sus2', 'sus'],
    ['suspended', 'sus'],
    ['dom', 'dom'],
    ['7', 'dom']
  ]);

  /**
   * Extension patterns
   */
  private static readonly EXTENSION_PATTERNS = [
    /^(add)(\d+)$/,           // add9, add11, etc.
    /^(sus)([24])$/,          // sus2, sus4
    /^(maj)([79]|11|13)$/,    // maj7, maj9, etc.
    /^(min|m)([79]|11|13)$/,  // m7, min9, etc.
    /^(dim)([79])$/,          // dim7, dim9
    /^(aug)([79])$/,          // aug7, aug9
    /^([679]|11|13)$/,        // 7, 9, 11, 13
    /^([#b])([59]|11|13)$/,   // #5, b9, etc.
    /^(no)([35])$/            // no3, no5
  ];

  /**
   * Parse a chord string into components
   */
  parse(chordString: string): ChordComponents {
    if (!chordString || typeof chordString !== 'string') {
      throw new Error('Chord string must be a non-empty string');
    }

    const trimmed = chordString.trim();
    if (trimmed.length === 0) {
      throw new Error('Chord string cannot be empty');
    }

    const match = trimmed.match(ChordParser.CHORD_REGEX);
    if (!match) {
      throw new Error(`Invalid chord format: ${chordString}`);
    }

    const [, rootNote, rootAccidental, qualityAndExtensions, bassNote, bassAccidental] = match;
    
    // Build root note
    const root = rootNote + (rootAccidental || '');
    
    // Parse quality and extensions
    const { quality, extensions } = this.parseQualityAndExtensions(qualityAndExtensions || '');
    
    // Build bass note if present
    const bassNoteComplete = bassNote ? bassNote + (bassAccidental || '') : undefined;

    return {
      root,
      quality,
      extensions,
      bassNote: bassNoteComplete
    };
  }

  /**
   * Check if a chord string is valid
   */
  isValid(chordString: string): boolean {
    try {
      this.parse(chordString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parse quality and extensions from the remaining chord string
   */
  private parseQualityAndExtensions(qualityAndExtensions: string): { quality: string; extensions: string[] } {
    if (!qualityAndExtensions) {
      return { quality: 'maj', extensions: [] };
    }

    let remaining = qualityAndExtensions;
    let quality = 'maj';
    const extensions: string[] = [];

    // First, try to match compound qualities that include extensions
    const compoundMatches = [
      { pattern: /^(maj7|major7|M7)/, quality: 'maj', extension: 'maj7' },
      { pattern: /^(maj9|major9|M9)/, quality: 'maj', extension: 'maj9' },
      { pattern: /^(maj11|major11|M11)/, quality: 'maj', extension: 'maj11' },
      { pattern: /^(maj13|major13|M13)/, quality: 'maj', extension: 'maj13' },
      { pattern: /^(m7|min7|minor7)/, quality: 'min', extension: 'm7' },
      { pattern: /^(m9|min9|minor9)/, quality: 'min', extension: 'm9' },
      { pattern: /^(m11|min11|minor11)/, quality: 'min', extension: 'm11' },
      { pattern: /^(m13|min13|minor13)/, quality: 'min', extension: 'm13' },
      { pattern: /^(dim7|diminished7|°7)/, quality: 'dim', extension: 'dim7' },
      { pattern: /^(aug7|augmented7|\+7)/, quality: 'aug', extension: 'aug7' },
      { pattern: /^(sus4|suspended4)/, quality: 'sus', extension: 'sus4' },
      { pattern: /^(sus2|suspended2)/, quality: 'sus', extension: 'sus2' }
    ];

    for (const compound of compoundMatches) {
      const match = remaining.match(compound.pattern);
      if (match) {
        quality = compound.quality;
        extensions.push(compound.extension);
        remaining = remaining.substring(match[0].length);
        break;
      }
    }

    // If no compound match, try basic qualities
    if (extensions.length === 0) {
      const sortedQualities = Array.from(ChordParser.QUALITY_PATTERNS.entries())
        .filter(([pattern]) => pattern !== '')
        .sort(([a], [b]) => b.length - a.length);

      for (const [pattern, normalizedQuality] of sortedQualities) {
        if (remaining.startsWith(pattern)) {
          quality = normalizedQuality;
          remaining = remaining.substring(pattern.length);
          break;
        }
      }
    }

    // Parse remaining extensions
    remaining = this.parseExtensions(remaining, extensions);

    return { quality, extensions };
  }

  /**
   * Parse extensions from the remaining string
   */
  private parseExtensions(remaining: string, extensions: string[]): string {
    let current = remaining;

    while (current.length > 0) {
      let foundExtension = false;

      for (const pattern of ChordParser.EXTENSION_PATTERNS) {
        const match = current.match(pattern);
        if (match) {
          if (match[1] && match[2]) {
            // Pattern with type and value (e.g., add9, sus4)
            extensions.push(match[1] + match[2]);
          } else if (match[1]) {
            // Pattern with just value (e.g., 7, 9)
            extensions.push(match[1]);
          }
          current = current.substring(match[0].length);
          foundExtension = true;
          break;
        }
      }

      if (!foundExtension) {
        // Try to match single characters or simple patterns
        const simpleMatch = current.match(/^([#b]?\d+|[#b][59]|no[35])/);
        if (simpleMatch) {
          extensions.push(simpleMatch[1]);
          current = current.substring(simpleMatch[0].length);
        } else {
          // If we can't parse the rest, include it as an extension
          if (current.length > 0) {
            extensions.push(current);
          }
          break;
        }
      }
    }

    return current;
  }

  /**
   * Get supported chord qualities
   */
  getSupportedQualities(): string[] {
    return Array.from(new Set(ChordParser.QUALITY_PATTERNS.values()));
  }

  /**
   * Get all quality patterns
   */
  getQualityPatterns(): Map<string, string> {
    return new Map(ChordParser.QUALITY_PATTERNS);
  }

  /**
   * Normalize a chord string (parse and rebuild)
   */
  normalize(chordString: string): string {
    const components = this.parse(chordString);
    return this.buildChordString(components);
  }

  /**
   * Build a chord string from components
   */
  private buildChordString(components: ChordComponents): string {
    let result = components.root;
    
    if (components.quality !== 'maj') {
      switch (components.quality) {
        case 'min':
          result += 'm';
          break;
        case 'dim':
          result += 'dim';
          break;
        case 'aug':
          result += 'aug';
          break;
        case 'sus':
          result += 'sus';
          break;
        case 'dom':
          result += '7';
          break;
      }
    }

    result += components.extensions.join('');

    if (components.bassNote) {
      result += `/${components.bassNote}`;
    }

    return result;
  }

  /**
   * Extract chord components for analysis
   */
  analyzeChord(chordString: string): {
    components: ChordComponents;
    analysis: {
      hasExtensions: boolean;
      hasBassNote: boolean;
      complexity: 'simple' | 'moderate' | 'complex';
      intervalStructure: string[];
    };
  } {
    const components = this.parse(chordString);
    
    const hasExtensions = components.extensions.length > 0;
    const hasBassNote = !!components.bassNote;
    
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (hasExtensions && hasBassNote) {
      complexity = 'complex';
    } else if (hasExtensions || hasBassNote) {
      complexity = 'moderate';
    }

    const intervalStructure = this.getIntervalStructure(components);

    return {
      components,
      analysis: {
        hasExtensions,
        hasBassNote,
        complexity,
        intervalStructure
      }
    };
  }

  /**
   * Get the interval structure of a chord
   */
  private getIntervalStructure(components: ChordComponents): string[] {
    const intervals = ['1']; // Root is always present

    switch (components.quality) {
      case 'maj':
        intervals.push('3', '5');
        break;
      case 'min':
        intervals.push('b3', '5');
        break;
      case 'dim':
        intervals.push('b3', 'b5');
        break;
      case 'aug':
        intervals.push('3', '#5');
        break;
      case 'sus':
        intervals.push('4', '5'); // Default sus4
        break;
      case 'dom':
        intervals.push('3', '5', 'b7');
        break;
    }

    // Add intervals from extensions
    for (const extension of components.extensions) {
      const intervalFromExtension = this.getIntervalFromExtension(extension);
      if (intervalFromExtension && !intervals.includes(intervalFromExtension)) {
        intervals.push(intervalFromExtension);
      }
    }

    return intervals;
  }

  /**
   * Get interval from extension string
   */
  private getIntervalFromExtension(extension: string): string | null {
    const extensionMap: Record<string, string> = {
      '7': 'b7',
      'maj7': '7',
      'm7': 'b7',
      '9': '9',
      'maj9': '9',
      'm9': '9',
      '11': '11',
      '13': '13',
      'add9': '9',
      'add11': '11',
      'sus2': '2',
      'sus4': '4',
      '#5': '#5',
      'b5': 'b5',
      '#9': '#9',
      'b9': 'b9',
      '#11': '#11',
      'b13': 'b13'
    };

    return extensionMap[extension] || null;
  }
}