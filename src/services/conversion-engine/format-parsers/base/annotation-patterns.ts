import { AnnotationFormat } from '../../../../types/format';

/**
 * Common annotation patterns for all formats
 */
export class AnnotationPatterns {
  /**
   * Get annotation patterns for a specific format
   */
  static getPatterns(format: AnnotationFormat): { [key in AnnotationFormat]?: RegExp } {
    switch (format) {
      case AnnotationFormat.ONSONG:
        return {
          [AnnotationFormat.ONSONG]: /^\*(.+)$/
        };
      
      case AnnotationFormat.CHORDPRO:
        return {
          [AnnotationFormat.CHORDPRO]: /\{(?:comment|c):\s*(.+?)\}/i
        };
      
      case AnnotationFormat.SONGBOOK:
        return {
          [AnnotationFormat.SONGBOOK]: /^\((.+)\)$/
        };
      
      case AnnotationFormat.PCO:
        return {
          [AnnotationFormat.PCO]: /<b>(.+?)<\/b>/
        };
      
      case AnnotationFormat.GUITAR_TABS:
        return {
          [AnnotationFormat.GUITAR_TABS]: /^\*(.+)$|^\[(intro|verse|chorus|bridge|outro|solo|instrumental)(?:\s\d+)?\]$/i
        };
      
      default:
        return {};
    }
  }

  /**
   * Get all common annotation patterns
   */
  static getAllPatterns(): { [key in AnnotationFormat]?: RegExp } {
    return {
      [AnnotationFormat.ONSONG]: /^\*(.+)$/,
      [AnnotationFormat.CHORDPRO]: /\{(?:comment|c):\s*(.+?)\}/i,
      [AnnotationFormat.SONGBOOK]: /^\((.+)\)$/,
      [AnnotationFormat.PCO]: /<b>(.+?)<\/b>/,
      [AnnotationFormat.GUITAR_TABS]: /^\*(.+)$|^\[(intro|verse|chorus|bridge|outro|solo|instrumental)(?:\s\d+)?\]$/i
    };
  }
}