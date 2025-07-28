import { Line, EmptyLine, AnnotationLine, TextLine } from '../../../../../types/line';

/**
 * Strategy interface for processing different types of lines
 */
export interface LineProcessor {
  canProcess(line: string): boolean;
  process(line: string, lineNumber: number): Line;
}

/**
 * Processes empty lines
 */
export class EmptyLineProcessor implements LineProcessor {
  canProcess(line: string): boolean {
    return line.trim().length === 0;
  }

  process(line: string, lineNumber: number): EmptyLine {
    return {
      type: 'empty',
      count: 1,
      lineNumber
    };
  }
}

/**
 * Processes annotation lines (sections, comments, etc.)
 */
export class AnnotationLineProcessor implements LineProcessor {
  private sectionPatterns = [
    /^\[(?:Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Post-Chorus|Refrain|Tag|Vamp|Interlude|Solo|Break|Instrumental)(?:\s*\d+)?\]$/i,
    /^(?:Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Post-Chorus|Refrain|Tag|Vamp|Interlude|Solo|Break|Instrumental)(?:\s*\d+)?:?\s*$/i,
    /^\{(?:start_of_|end_of_)(?:verse|chorus|bridge|intro|outro|pre_chorus|post_chorus|refrain|tag|vamp|interlude|solo|break|instrumental)\}$/i
  ];

  private annotationPatterns = [
    /^\*.*$/,           // OnSong/General comments (*)
    /^\(.*\)$/,         // Songbook comments (parentheses)
    /^\{(?:comment|c):/i, // ChordPro comments
    /^<b>.*<\/b>$/,     // PCO bold annotations
  ];

  canProcess(line: string): boolean {
    const trimmed = line.trim();
    return this.isSectionHeader(trimmed) || this.isAnnotation(trimmed);
  }

  process(line: string, lineNumber: number): AnnotationLine {
    const trimmed = line.trim();
    let value = trimmed;
    let annotationType: 'comment' | 'section' | 'instruction' | 'tempo' | 'dynamics' = 'comment';

    if (this.isSectionHeader(trimmed)) {
      const sectionInfo = this.parseSectionHeader(trimmed);
      value = sectionInfo.title || sectionInfo.type;
      annotationType = 'section';
    } else {
      value = this.extractAnnotationValue(trimmed);
      annotationType = this.classifyAnnotationType(value);
    }

    return {
      type: 'annotation',
      value,
      annotationType,
      lineNumber
    };
  }

  private isSectionHeader(line: string): boolean {
    return this.sectionPatterns.some(pattern => pattern.test(line));
  }

  private isAnnotation(line: string): boolean {
    return this.annotationPatterns.some(pattern => pattern.test(line));
  }

  private parseSectionHeader(line: string): { type: string; title?: string } {
    const bracketMatch = line.match(/^\[([^[\]]+)\]$/i);
    if (bracketMatch) {
      const content = bracketMatch[1].trim();
      const parts = content.split(/\s+/);
      return { type: parts[0].toLowerCase(), title: content };
    }

    const colonMatch = line.match(/^([^:]+):?\s*$/i);
    if (colonMatch) {
      const content = colonMatch[1].trim();
      const parts = content.split(/\s+/);
      return { type: parts[0].toLowerCase(), title: content };
    }

    return { type: 'unknown', title: line };
  }

  private extractAnnotationValue(line: string): string {
    if (line.startsWith('*')) return line.substring(1).trim();
    if (line.startsWith('(') && line.endsWith(')')) return line.substring(1, line.length - 1).trim();
    if (line.startsWith('<b>') && line.endsWith('</b>')) return line.substring(3, line.length - 4).trim();
    
    const chordProMatch = line.match(/^\{(?:comment|c):\s*(.+?)\}$/i);
    if (chordProMatch) return chordProMatch[1].trim();
    
    return line;
  }

  private classifyAnnotationType(content: string): 'comment' | 'instruction' | 'tempo' | 'dynamics' | 'section' {
    const lowerContent = content.toLowerCase();

    if (lowerContent.match(/\b(tempo|slow(er)?|fast(er)?|moderate|allegro|andante|adagio|presto|largo|vivace|steady)\b/)) {
      return 'tempo';
    }
    if (lowerContent.match(/\b(dynamics|loud(er)?|soft(ly|er)?|forte|piano|crescendo|diminuendo|ff|f|mf|mp|p|pp|sfz|sforzando)\b/)) {
      return 'dynamics';
    }
    if (lowerContent.match(/\b(instruction|repeat|play|stop|pause|hold|fermata|ritard(ando)?|accel(erando)?|da capo|dal segno|fine|coda|simile|tacet)\b/)) {
      return 'instruction';
    }

    return 'comment';
  }
}