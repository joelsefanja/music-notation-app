import { Section } from '../../types';
import { SectionType, NotationFormat, AnnotationFormat } from '../../types/format';
import { ChordParser } from '../../utils/chord-parser';
import { Annotation } from '../../types/chord';
import { SongbookParser } from '../annotations/songbook';
import { PlanningCenterParser } from '../annotations/planning-center';
import { ChordProParser } from '../annotations/chord-pro';
import { OnSongParser } from '../annotations/on-song';
import { GuitarTabsParser } from '../annotations/guitar-tabs';
import { BaseParser } from './base-parser';

/**
 * Result of section parsing with position information
 */
export interface SectionParseResult {
  section: Section;
  startIndex: number;
  endIndex: number;
  originalText: string;
}

/**
 * Parser for identifying and parsing sections in chord sheets
 */
export class SectionParser {
  // Configuration for chord extraction styles
  private static chordExtractionStyles: Record<NotationFormat, 'brackets' | 'inline' | 'above'> = {
    [NotationFormat.GUITAR_TABS]: 'brackets',
    [NotationFormat.CHORDPRO]: 'brackets',
    [NotationFormat.PCO]: 'inline',
    [NotationFormat.ONSONG]: 'inline',
    [NotationFormat.SONGBOOK]: 'inline',
    [NotationFormat.NASHVILLE]: 'inline'
  };

  // Configuration for annotation parsers
  private static annotationParsers: Partial<Record<NotationFormat, { format: AnnotationFormat; parser: () => BaseParser }>> = {
    [NotationFormat.SONGBOOK]: { format: AnnotationFormat.SONGBOOK, parser: () => new SongbookParser() },
    [NotationFormat.PCO]: { format: AnnotationFormat.PCO, parser: () => new PlanningCenterParser() },
    [NotationFormat.CHORDPRO]: { format: AnnotationFormat.CHORDPRO, parser: () => new ChordProParser() },
    [NotationFormat.ONSONG]: { format: AnnotationFormat.ONSONG, parser: () => new OnSongParser() },
    [NotationFormat.GUITAR_TABS]: { format: AnnotationFormat.GUITAR_TABS, parser: () => new GuitarTabsParser() }
  };

  // Regex patterns for section headers
  private static headerRegexes: Partial<Record<NotationFormat, RegExp>> = {
    [NotationFormat.GUITAR_TABS]: /^\[([^\]]*)\]$/,
    [NotationFormat.CHORDPRO]: /^\{(?:start_of_)?(verse|chorus|bridge|intro|outro|instrumental|pre_chorus|post_chorus|tag|vamp|interlude)(?:_(\d+))?\}$/i,
    [NotationFormat.ONSONG]: /^(V\d+|C\d*|B\d*|Verse\s*\d*|Chorus|Bridge|Intro|Outro|\d+\.|\w+):?\s*$/i,
    [NotationFormat.SONGBOOK]: /^\(([^\)]+)\)$/,
  };

  // Regex for ChordPro metadata
  private static chordProMetadataRegex = /^\{(title|artist|key|tempo|capo|time|duration|copyright|comment|sot|eot)[^}]*\}$/i;

  // Section type mapping
  private static sectionTypeMap: Array<{ pattern: RegExp | string; type: SectionType }> = [
    { pattern: /pre[-_\s]?chorus/i, type: SectionType.PRE_CHORUS },
    { pattern: /post[-_\s]?chorus/i, type: SectionType.POST_CHORUS },
    { pattern: /chorus|refrain|^c\d*$/i, type: SectionType.CHORUS },
    { pattern: /bridge|middle 8|^b\d*$/i, type: SectionType.BRIDGE },
    { pattern: /intro|introduction/i, type: SectionType.INTRO },
    { pattern: /outro|ending|coda/i, type: SectionType.OUTRO },
    { pattern: /instrumental|solo/i, type: SectionType.INSTRUMENTAL },
    { pattern: /tag/i, type: SectionType.TAG },
    { pattern: /vamp/i, type: SectionType.VAMP },
    { pattern: /interlude/i, type: SectionType.INTERLUDE },
    { pattern: /verse|^v\d+|\d+\.?$/i, type: SectionType.VERSE },
  ];

  /**
   * Clean content by removing section headers
   */
  private static cleanContent(content: string, format: NotationFormat): string {
    let cleaned = content;
    if (format === NotationFormat.GUITAR_TABS) {
      cleaned = content.replace(/^\[[^\]]+\]\s*$/gm, '');
    } else if (format === NotationFormat.CHORDPRO) {
      cleaned = content.replace(/^\{(?:start_of_|end_of_)?(?:verse|chorus|bridge|intro|outro|instrumental|pre_chorus|post_chorus|tag|vamp|interlude)(?:_\d+)?\}\s*$/gmi, '');
    } else if (format === NotationFormat.ONSONG) {
      cleaned = content.replace(/^(?:V\d+|C\d*|B\d*|Verse\s*\d*|Chorus|Bridge|Intro|Outro|\d+\.|\w+):?\s*$/gmi, '');
    } else if (format === NotationFormat.SONGBOOK) {
      cleaned = content.replace(/^\(([^\)]+)\)\s*\n?/gm, '');
    }
    return cleaned;
  }

  /**
   * Calculate character index for a line number
   */
  private static calculateLineIndex(lines: string[], lineNumber: number): number {
    return lines.slice(0, Math.min(lineNumber, lines.length))
      .reduce((index, line) => index + line.length + 1, 0);
  }

  /**
   * Parse sections from text based on the provided format
   */
  public static parseSections(text: string, format: NotationFormat): SectionParseResult[] {
    if (!text || !text.trim()) {
      return [];
    }

    const lines = text.split('\n');
    const sections: SectionParseResult[] = [];
    let currentSectionContent: string[] = [];

    let currentSectionName: string | undefined;
    let currentSectionType: SectionType | undefined;
    let sectionStartLine = 0;

    const currentRegex = this.headerRegexes[format];

    // If no regex for format, treat as single section
    if (!currentRegex) {
      const content = text.trim();
      if (content) {
        sections.push({
          section: this.createSection({ type: SectionType.VERSE, name: 'Verse' }, content, format),
          startIndex: 0,
          endIndex: text.length,
          originalText: content
        });
      }
      return sections;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip ChordPro metadata
      if (format === NotationFormat.CHORDPRO && 
          trimmedLine.match(this.chordProMetadataRegex) &&
          !trimmedLine.match(/^\{(?:start_of_|end_of_)?(?:verse|chorus|bridge|intro|outro|instrumental|pre_chorus|post_chorus|tag|vamp|interlude)/i)) {
        continue;
      }

      // Check if this line is a section header
      const match = trimmedLine.match(currentRegex); // Use the format-specific regex
      const isHeader = !!match && trimmedLine.length > 0; // A non-empty line that matches the header regex is a header

      if (isHeader) {
        // Save previous section if we have content
        if (currentSectionContent.length > 0 && currentSectionName) {
          const originalText = currentSectionContent.join('\n');
          const content = originalText.trim();
          if (content) {
            sections.push({
              section: this.createSection(
                { type: currentSectionType || SectionType.VERSE, name: currentSectionName },
                originalText,
                format
              ),
              startIndex: this.calculateLineIndex(lines, sectionStartLine),
              endIndex: this.calculateLineIndex(lines, i) - 1,
              originalText: originalText
            });
          }
        }

        // Start new section
        currentSectionContent = [line]; // Include the header line
        sectionStartLine = i;

        // Extract section name and type
        if (format === NotationFormat.CHORDPRO) {
          const sectionName = match![1];
          const sectionNumber = match![2];
          currentSectionName = `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}${sectionNumber ? ` ${sectionNumber}` : ''}`;
          currentSectionType = sectionName.toLowerCase() as SectionType;
        } else {
          const rawName = match![1].trim();
          const { type, name } = this.inferSectionTypeAndName(rawName);
          currentSectionType = type;
          currentSectionName = name;
        }
      } else {
        // Add content line to current section
        if (currentSectionName) {
          currentSectionContent.push(line);
        } else if (line.trim()) { // Only add if it's not an empty line
          // No section header found yet, start default section with content
          currentSectionContent.push(line);
          if (!currentSectionName) { // Initialize default section if not already
            currentSectionName = 'Verse';
            currentSectionType = SectionType.VERSE;
            sectionStartLine = 0;
          }
        }
      }
    }

    // Add the last section
    if (currentSectionContent.length > 0 && currentSectionName) {
      const originalText = currentSectionContent.join('\n');
      const content = originalText.trim();
      if (content) {
        sections.push({
          section: this.createSection(
            { type: currentSectionType || SectionType.VERSE, name: currentSectionName },
            originalText,
            format
          ),
          startIndex: this.calculateLineIndex(lines, sectionStartLine),
          endIndex: text.length,
          originalText: originalText
        });
      }
    }

    // Fallback: if no sections found and we have content, try implicit parsing
    if (sections.length === 0 && text.trim()) {
      return this.identifyImplicitSections(text);
    }

    return sections;
  }

  /**
   * Format sections with proper spacing
   */
  public static formatSectionsWithSpacing(sections: Section[], hasAnnotations: boolean = false): string {
    const formattedSections = sections.map(section => {
      const sectionHeader = this.formatSectionHeader(section.name, NotationFormat.GUITAR_TABS);
      return `${sectionHeader}\n${section.content}`;
    });
    return formattedSections.join(hasAnnotations ? '\n\n\n' : '\n\n');
  }

  /**
   * Format section header based on target format
   */
  public static formatSectionHeader(sectionName: string, targetFormat: NotationFormat): string {
    const formatters: Record<NotationFormat, (name: string) => string> = {
      [NotationFormat.GUITAR_TABS]: name => name.replace(/^\[|\]$/g, '') + ':',
      [NotationFormat.CHORDPRO]: name => {
        const chordProName = name.toLowerCase().replace(/\s+/g, '_');
        const match = chordProName.match(/^(verse|chorus|bridge)_?(\d+)?$/);
        if (match) {
          const base = match[1];
          const num = match[2] || '';
          return `{start_of_${base}${num ? `_${num}` : ''}}`;
        }
        return `{${chordProName}}`;
      },
      [NotationFormat.ONSONG]: name => name + ':',
      [NotationFormat.SONGBOOK]: name => `(${name})`,
      [NotationFormat.NASHVILLE]: name => name + ':',
      [NotationFormat.PCO]: name => `<b>${name}</b>`
    };
    return (formatters[targetFormat] || formatters[NotationFormat.ONSONG])(sectionName);
  }

  /**
   * Convert Guitar Tabs section headers to standard format
   */
  public static convertGuitarTabsHeaders(text: string): string {
    return text.replace(/^\[([^\]]+)\]$/gm, (match, sectionName) => sectionName.trim() + ':');
  }

  /**
   * Create a complete Section object from parsed data
   */
  private static createSection(sectionData: Partial<Section>, content: string, format: NotationFormat): Section {
    // Remove section headers from content to avoid false chord parsing
    const cleanedContent = this.cleanContent(content, format);

    // Parse chords
    const chordExtractionStyle = this.chordExtractionStyles[format] === 'above' ? 'inline' : this.chordExtractionStyles[format] || 'inline';
    const chords = ChordParser.extractChordsFromText(cleanedContent, chordExtractionStyle)
      .filter(chord => chord.root !== 'Invalid');

    // Parse annotations
    const annotationConfig = this.annotationParsers[format];
    const annotations = annotationConfig
      ? annotationConfig.parser().parseOfFormat(content, annotationConfig.format)
      : [];

    return {
      type: sectionData.type || SectionType.VERSE,
      name: sectionData.name || 'Verse',
      content: content.trim(),
      chords,
      annotations
    };
  }

  /**
   * Infer section type and name from header - with special handling for counters
   */
  private static inferSectionTypeAndName(header: string): { type: SectionType; name: string } {
    const normalizedName = header.replace(/:$/, '').toLowerCase().trim();
    let sectionType = SectionType.VERSE;
    let sectionName = header.replace(/:$/, '').trim();

    // Handle numbered sections (1., 2., etc.)
    const numberedMatch = normalizedName.match(/^(\d+)\.?$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      return { type: SectionType.VERSE, name: `Verse ${num}` };
    }

    // Handle abbreviated forms with counters
    const abbreviatedMatch = normalizedName.match(/^([a-z])(\d*)$/);
    if (abbreviatedMatch) {
      const abbrev = abbreviatedMatch[1];
      const num = abbreviatedMatch[2];
      
      switch (abbrev) {
        case 'v':
          return { type: SectionType.VERSE, name: `Verse ${num || (num === '' ? '1' : '')}` };
        case 'c':
          return { type: SectionType.CHORUS, name: num ? `Chorus ${num}` : 'Chorus' };
        case 'b':
          return { type: SectionType.BRIDGE, name: num ? `Bridge ${num}` : (num === '' ? 'Bridge 1' : 'Bridge') };
        default:
          return { type: SectionType.VERSE, name: sectionName };
      }
    }

    // Handle full word sections
    const mapping = this.sectionTypeMap.find(({ pattern }) => 
      typeof pattern === 'string' ? normalizedName.includes(pattern) : pattern.test(normalizedName)
    ); // Use test() for regex patterns
    
    if (mapping) {
      sectionType = mapping.type;
      
      // Special handling for specific section types
      if (sectionType === SectionType.VERSE) {
        const verseMatch = normalizedName.match(/verse\s*(\d+)?/);
        if (verseMatch) {
          const num = verseMatch[1];
          sectionName = `Verse ${num || '1'}`;
        } else if (normalizedName === 'verse') {
          sectionName = 'Verse 1';
        }
      } else if (sectionType === SectionType.CHORUS) {
        const chorusMatch = normalizedName.match(/chorus\s*(\d+)?/);
        if (chorusMatch) {
          const num = chorusMatch[1];
          sectionName = num ? `Chorus ${num}` : 'Chorus';
        } else if (normalizedName === 'chorus') {
          sectionName = 'Chorus';
        }
      } else if (sectionType === SectionType.BRIDGE) {
        const bridgeMatch = normalizedName.match(/bridge\s*(\d+)?/);
        if (bridgeMatch) {
          const num = bridgeMatch[1];
          sectionName = num ? `Bridge ${num}` : 'Bridge';
        }
      } else {
        // Capitalize first letter for other section types
        sectionName = header.charAt(0).toUpperCase() + header.slice(1);
      }
    } else {
      // Default fallback
      sectionName = header.charAt(0).toUpperCase() + header.slice(1);
    }

    return { type: sectionType, name: sectionName };
  }

  /**
   * Identify implicit sections based on blank lines
   */
  public static identifyImplicitSections(text: string): SectionParseResult[] {
    const sections: SectionParseResult[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    let currentIndex = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      if (paragraph) {
        const sectionName = `Verse ${i + 1}`;
        const endIndex = currentIndex + paragraph.length;
        
        sections.push({
          section: this.createSection(
            { type: SectionType.VERSE, name: sectionName },
            paragraph,
            NotationFormat.ONSONG
          ),
          startIndex: currentIndex,
          endIndex: endIndex,
          originalText: paragraph
        });
        
        // Update currentIndex to account for the paragraph and separator
        currentIndex = text.indexOf(paragraph, currentIndex) + paragraph.length;
        if (i < paragraphs.length - 1) {
          // Find the next paragraph to calculate proper spacing
          const nextParagraph = paragraphs[i + 1].trim();
          if (nextParagraph) {
            currentIndex = text.indexOf(nextParagraph, currentIndex);
          }
        }
      }
    }
    
    // If no blank lines found, treat entire text as single section
    if (sections.length === 0 && text.trim()) {
      sections.push({
        section: this.createSection(
          { type: SectionType.VERSE, name: 'Verse 1' },
          text.trim(),
          NotationFormat.ONSONG
        ),
        startIndex: 0,
        endIndex: text.length,
        originalText: text.trim()
      });
    }

    return sections;
  }

  /**
   * Merge sections with their annotations
   */
  public static mergeSectionsWithAnnotations(
    sections: SectionParseResult[],
    annotations: { annotation: Annotation; startIndex: number; endIndex: number }[]
  ): SectionParseResult[] {
    return sections.map(sectionResult => ({
      ...sectionResult,
      section: {
        ...sectionResult.section,
        annotations: annotations
          .filter(ann => ann.startIndex >= sectionResult.startIndex && ann.endIndex <= sectionResult.endIndex)
          .map(ann => ann.annotation)
      }
    }));
  }
}