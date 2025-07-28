import { BaseParser } from './base-parser';
import { TextLine, ChordPlacement, AnnotationFormat } from '../../../../types/line';
import { ChordExtractionFactory } from './chord-extraction/chord-extraction-factory';

export abstract class BaseLineParserWithChords extends BaseParser {
  protected abstract getFormat(): AnnotationFormat;

  /**
   * Implementeert de `parseContentLine` van `BaseParser`, en specialiseert deze voor regels
   * die akkoorden kunnen bevatten.
   */
  protected parseContentLine(line: string, lineNumber: number): TextLine {
    const chords: ChordPlacement[] = [];
    let text = line;

    try {
      const strategy = ChordExtractionFactory.getStrategy(this.getFormat());
      const chordMatches = strategy.extractChords(line);

      for (const match of chordMatches) {
        try {
          const normalizedChord = strategy.normalizeChord(match.chord);

          const startIndex = Math.max(0, match.startIndex);
          const endIndex = Math.min(line.length, Math.max(startIndex, match.endIndex));

          chords.push({
            value: normalizedChord,
            originalText: match.originalText,
            startIndex,
            endIndex,
            placement: match.placement || 'inline'
          });
        } catch (chordError) {
          console.warn(`Line ${lineNumber}: Invalid chord "${match.chord}". Skipped. Error: ${chordError instanceof Error ? chordError.message : 'Unknown error'}`);
        }
      }

      text = strategy.removeChordMarkup(line);

    } catch (error) {
      console.warn(`Line ${lineNumber}: Could not process chords. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      text = line;
    }

    return {
      type: 'text',
      text,
      chords,
      lineNumber
    };
  }
}
