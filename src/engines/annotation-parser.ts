import { Annotation } from '../types';
import { AnnotationFormat } from '../types/format.types';

/**
 * Result of annotation parsing with position information
 */
export interface AnnotationParseResult {
  annotation: Annotation;
  originalText: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parser for handling different annotation formats in chord sheets
 */
export class AnnotationParser {
  /**
   * Regular expressions for different annotation formats
   */
  private static readonly ANNOTATION_PATTERNS = {
    [AnnotationFormat.ONSONG]: /^\*(.+)$/gm,           // *Comment
    [AnnotationFormat.SONGBOOK]: /^\(([^)]+)\)$/gm,    // (Comment)
    [AnnotationFormat.PCO]: /<b>([^<]+)<\/b>/gm        // <b>Comment</b>
  };

  /**
   * Parse all annotations from text and return them with position information
   * @param text - Text to parse for annotations
   * @returns Array of annotation parse results
   */
  public static parseAnnotations(text: string): AnnotationParseResult[] {
    const results: AnnotationParseResult[] = [];

    // Check each annotation format
    for (const [format, pattern] of Object.entries(this.ANNOTATION_PATTERNS)) {
      const annotationFormat = format as AnnotationFormat;
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;

      while ((match = regex.exec(text)) !== null) {
        const annotation: Annotation = {
          text: match[1].trim(),
          format: annotationFormat,
          position: this.determineAnnotationPosition(text, match.index, annotationFormat)
        };

        results.push({
          annotation,
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }

    // Sort by position in text
    return results.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Parse annotations of a specific format from text
   * @param text - Text to parse
   * @param format - Specific annotation format to look for
   * @returns Array of annotations in the specified format
   */
  public static parseAnnotationsOfFormat(text: string, format: AnnotationFormat): Annotation[] {
    const pattern = this.ANNOTATION_PATTERNS[format];
    if (!pattern) {
      throw new Error(`Unsupported annotation format: ${format}`);
    }

    const annotations: Annotation[] = [];
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      annotations.push({
        text: match[1].trim(),
        format,
        position: this.determineAnnotationPosition(text, match.index, format)
      });
    }

    return annotations;
  }

  /**
   * Convert annotation from one format to another
   * @param annotation - Annotation to convert
   * @param targetFormat - Target format to convert to
   * @returns Converted annotation text
   */
  public static convertAnnotation(annotation: Annotation, targetFormat: AnnotationFormat): string {
    const text = annotation.text;

    switch (targetFormat) {
      case AnnotationFormat.ONSONG:
        return `*${text}`;
      
      case AnnotationFormat.SONGBOOK:
        return `(${text})`;
      
      case AnnotationFormat.PCO:
        return `<b>${text}</b>`;
      
      default:
        throw new Error(`Unsupported target annotation format: ${targetFormat}`);
    }
  }

  /**
   * Remove all annotations from text
   * @param text - Text to clean
   * @returns Text with annotations removed
   */
  public static removeAnnotations(text: string): string {
    let cleanText = text;

    // Remove each annotation format
    for (const pattern of Object.values(this.ANNOTATION_PATTERNS)) {
      cleanText = cleanText.replace(pattern, '');
    }

    // Clean up extra whitespace and empty lines
    return cleanText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple empty lines with double newline
      .replace(/^\s*\n/gm, '') // Remove lines that are only whitespace
      .trim();
  }

  /**
   * Replace annotations in text with converted format
   * @param text - Original text with annotations
   * @param targetFormat - Format to convert annotations to
   * @returns Text with annotations converted to target format
   */
  public static convertAnnotationsInText(text: string, targetFormat: AnnotationFormat): string {
    const parseResults = this.parseAnnotations(text);
    let convertedText = text;

    // Process annotations in reverse order to maintain correct indices
    for (let i = parseResults.length - 1; i >= 0; i--) {
      const result = parseResults[i];
      const convertedAnnotation = this.convertAnnotation(result.annotation, targetFormat);
      
      // Replace the original annotation with the converted one
      convertedText = 
        convertedText.substring(0, result.startIndex) +
        convertedAnnotation +
        convertedText.substring(result.endIndex);
    }

    return convertedText;
  }

  /**
   * Determine the position of an annotation relative to content
   * @param text - Full text content
   * @param annotationIndex - Index where annotation appears
   * @param format - Format of the annotation
   * @returns Position classification
   */
  private static determineAnnotationPosition(
    text: string, 
    annotationIndex: number, 
    format: AnnotationFormat
  ): 'above' | 'inline' | 'beside' {
    const lines = text.split('\n');
    let currentIndex = 0;
    let lineIndex = 0;

    // Find which line the annotation is on
    for (let i = 0; i < lines.length; i++) {
      if (currentIndex + lines[i].length >= annotationIndex) {
        lineIndex = i;
        break;
      }
      currentIndex += lines[i].length + 1; // +1 for newline character
    }

    const line = lines[lineIndex];

    // Determine position based on format and context
    switch (format) {
      case AnnotationFormat.ONSONG:
        // OnSong annotations (*Comment) are typically on their own line above content
        return line.trim().startsWith('*') ? 'above' : 'inline';
      
      case AnnotationFormat.SONGBOOK:
        // Songbook Pro annotations (Comment) are typically above sections
        return line.trim().startsWith('(') && line.trim().endsWith(')') ? 'above' : 'inline';
      
      case AnnotationFormat.PCO:
        // PCO annotations <b>Comment</b> can be inline or beside content
        const hasOtherContent = line.replace(/<b>[^<]+<\/b>/g, '').trim().length > 0;
        return hasOtherContent ? 'beside' : 'above';
      
      default:
        return 'above';
    }
  }

  /**
   * Extract annotations and return clean text with annotation metadata
   * @param text - Text to process
   * @returns Object with clean text and extracted annotations
   */
  public static extractAnnotations(text: string): {
    cleanText: string;
    annotations: AnnotationParseResult[];
  } {
    const annotations = this.parseAnnotations(text);
    const cleanText = this.removeAnnotations(text);

    return {
      cleanText,
      annotations
    };
  }

  /**
   * Check if text contains annotations of a specific format
   * @param text - Text to check
   * @param format - Format to check for
   * @returns True if annotations of the format are found
   */
  public static hasAnnotationsOfFormat(text: string, format: AnnotationFormat): boolean {
    const pattern = this.ANNOTATION_PATTERNS[format];
    return pattern ? pattern.test(text) : false;
  }

  /**
   * Get all annotation formats present in the text
   * @param text - Text to analyze
   * @returns Array of annotation formats found
   */
  public static getAnnotationFormats(text: string): AnnotationFormat[] {
    const formats: AnnotationFormat[] = [];

    for (const [format, pattern] of Object.entries(this.ANNOTATION_PATTERNS)) {
      if (pattern.test(text)) {
        formats.push(format as AnnotationFormat);
      }
    }

    return formats;
  }

  /**
   * Format annotation for placement in target format with proper spacing
   * @param annotation - Annotation to format
   * @param targetFormat - Target format
   * @param placement - Where the annotation should be placed
   * @returns Formatted annotation with appropriate spacing
   */
  public static formatAnnotationWithSpacing(
    annotation: Annotation, 
    targetFormat: AnnotationFormat,
    placement: 'above' | 'inline' | 'beside' = 'above'
  ): string {
    const convertedAnnotation = this.convertAnnotation(annotation, targetFormat);

    switch (placement) {
      case 'above':
        // Annotations above content should have proper spacing
        return `\n\n\n${convertedAnnotation}\n`;
      
      case 'inline':
        // Inline annotations are embedded within content
        return convertedAnnotation;
      
      case 'beside':
        // Beside annotations are on the same line as content
        return ` ${convertedAnnotation}`;
      
      default:
        return convertedAnnotation;
    }
  }

  /**
   * Validate annotation format
   * @param text - Text to validate as annotation
   * @param format - Expected format
   * @returns True if text matches the annotation format
   */
  public static isValidAnnotation(text: string, format: AnnotationFormat): boolean {
    switch (format) {
      case AnnotationFormat.ONSONG:
        return /^\*(.+)$/.test(text);
      case AnnotationFormat.SONGBOOK:
        return /^\(([^)]+)\)$/.test(text);
      case AnnotationFormat.PCO:
        return /<b>([^<]+)<\/b>/.test(text);
      default:
        return false;
    }
  }
}