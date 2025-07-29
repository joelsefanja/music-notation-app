import { BaseParser } from '../base/base-parser';
import { AnnotationFormat, TextLine, ChordLine } from '../../../../types/line';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns';
import { Chord } from '../../../../types/chord';

/**
 * Guitar Tabs format parser - handles [Section] headers and chord lines above lyrics
 */
export class GuitarTabsParser extends BaseParser {
  protected readonly annotationPatterns = AnnotationPatterns.getPatterns(AnnotationFormat.GUITAR_TABS);

  public isValid(text: string): boolean {
    return FormatValidatorFactory.getValidator(AnnotationFormat.GUITAR_TABS).isValid(text);
  }

  protected parseContentLine(line: string, lineNumber: number): TextLine | ChordLine {
    // Check if this is a chord line (contains only chords and whitespace)
    const chordPattern = /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?(?:\s+[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?)*\s*$/;
    
    if (chordPattern.test(line.trim())) {
      // Parse as chord line
      const chords: Chord[] = [];
      const chordMatches = line.match(/[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?/g) || [];
      
      let position = 0;
      for (const match of chordMatches) {
        const matchIndex = line.indexOf(match, position);
        if (matchIndex !== -1) {
          chords.push({
            name: match,
            position: matchIndex,
            lineNumber
          });
          position = matchIndex + match.length;
        }
      }

      return {
        type: 'chord',
        chords,
        lineNumber
      };
    }

    // Otherwise parse as regular text line
    return {
      type: 'text',
      text: line,
      chords: [],
      lineNumber
    };
  }
}
