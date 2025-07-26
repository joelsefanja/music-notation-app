import { NotationFormat } from '../types';
import { FormatDetector, FormatDetectionResult } from './format-detector';
import { AutoKeyDetection, KeyDetectionResult } from './auto-key-detection';
import { ChordParser } from '../utils/chord-parser';
import { KeyTransposer } from '../utils/key-transposer';
import { OnSongParser } from '../parsers/annotations/on-song';
import { ChordProParser } from '../parsers/annotations/chord-pro';
import { SongbookParser } from '../parsers/annotations/songbook';
import { GuitarTabsParser } from '../parsers/annotations/guitar-tabs';
import { PlanningCenterParser } from '../parsers/annotations/planning-center';
import { BaseParser } from '../parsers/core/base-parser';
import { IAnnotationParseResult } from '../types/annotation';
import { Chord } from '../types/chord';
import { AnnotationFormat } from '../types'; // Ensure AnnotationFormat is imported if it's a separate enum

export interface ConversionResult {
  output: string;
  success: boolean;
  errors: ConversionError[];
  warnings: string[];
}

export interface ConversionError {
  type: 'PARSE_ERROR' | 'FORMAT_ERROR' | 'KEY_ERROR' | 'CONVERSION_ERROR';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  recoverable: boolean;
}

export interface ConversionOptions {
  preserveExtensions: boolean;
  handleSlashChords: boolean;
  convertAnnotations: boolean;
  maintainSpacing: boolean;
  autoDetectKey: boolean;
}

/**
 * Main conversion engine that orchestrates format detection, key detection,
 * chord parsing, and transposition services
 */
export class ConversionEngine {
  private formatDetector: FormatDetector;
  private autoKeyDetection: AutoKeyDetection;
  private parsers: Map<NotationFormat, BaseParser>;

  constructor() {
    this.formatDetector = new FormatDetector();
    this.autoKeyDetection = new AutoKeyDetection();
    this.parsers = new Map<NotationFormat, BaseParser>();
    this.initializeParsers();
  }

  private initializeParsers(): void {
    this.parsers.set(NotationFormat.ONSONG, new OnSongParser());
    this.parsers.set(NotationFormat.CHORDPRO, new ChordProParser());
    this.parsers.set(NotationFormat.SONGBOOK, new SongbookParser());
    this.parsers.set(NotationFormat.GUITAR_TABS, new GuitarTabsParser());
    this.parsers.set(NotationFormat.PCO, new PlanningCenterParser());
  }

  /**
   * Convert text from one format to another with optional key transposition
   */
  async convert(
    input: string,
    sourceFormat: NotationFormat,
    targetFormat: NotationFormat,
    sourceKey?: string,
    targetKey?: string,
    options: Partial<ConversionOptions> = {}
  ): Promise<ConversionResult> {
    const defaultOptions: ConversionOptions = {
      preserveExtensions: true,
      handleSlashChords: true,
      convertAnnotations: true,
      maintainSpacing: true,
      autoDetectKey: true,
      ...options
    };

    if (!input.trim()) {
      return {
        output: '',
        success: true,
        errors: [],
        warnings: []
      };
    }

    const sourceParser = this.parsers.get(sourceFormat);
    const targetParser = this.parsers.get(targetFormat);

    const parserError = this._handleParserErrors(sourceParser, targetParser, sourceFormat, targetFormat, input);
    if (parserError) {
      return parserError;
    }

    let contentForChordProcessing = input;
    let originalAnnotationParseResults: IAnnotationParseResult[] = [];

    // Step 1: Parse and potentially remove annotations from source text using the source parser
    if (defaultOptions.convertAnnotations && sourceParser) {
      originalAnnotationParseResults = sourceParser.parse(input);
      contentForChordProcessing = sourceParser.remove(input);
    }

    // Step 2: Extract and transpose chords
    const originalChords = ChordParser.extractChordsFromText(contentForChordProcessing, this.getChordExtractionFormat(sourceFormat));
    const transpositionResult = this._transposeChords(originalChords, sourceKey, targetKey, input);

    if (!transpositionResult.success) {
      return transpositionResult.result!; // Non-null assertion
    }
    const transposedChords = transpositionResult.chords!; // Non-null assertion

    // Step 3: Reconstruct the text with transposed chords and converted annotations
    const convertedText = this.reconstructText(
      contentForChordProcessing, // Text after original annotations removed
      originalChords,
      transposedChords,
      originalAnnotationParseResults,
      sourceFormat, // Pass sourceFormat
      targetFormat,
      defaultOptions,
      targetParser! // Assert non-null after error handling
    );

    return {
      output: convertedText,
      success: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Helper method to handle parser-related errors.
   */
  private _handleParserErrors(
    sourceParser: BaseParser | undefined,
    targetParser: BaseParser | undefined,
    sourceFormat: NotationFormat,
    targetFormat: NotationFormat,
    input: string
  ): ConversionResult | null {
    if (!sourceParser) {
      return {
        output: input,
        success: false,
        errors: [{ type: 'FORMAT_ERROR', message: `No parser found for source format: ${NotationFormat[sourceFormat]}`, recoverable: false }],
        warnings: []
      };
    }
    if (!targetParser) {
      return {
        output: input,
        success: false,
        errors: [{ type: 'FORMAT_ERROR', message: `No parser found for target format: ${NotationFormat[targetFormat]}`, recoverable: false }],
        warnings: []
      };
    }
    return null;
  }

  /**
   * Helper method to handle chord transposition.
   */
  private _transposeChords(
    originalChords: Chord[],
    sourceKey: string | undefined,
    targetKey: string | undefined,
    input: string
  ): { success: boolean; chords?: Chord[]; result?: ConversionResult } {
    if (sourceKey && targetKey && sourceKey !== targetKey) {
      try {
        const transposed = KeyTransposer.transposeToKey(originalChords, sourceKey, targetKey);
        return { success: true, chords: transposed };
      } catch (error) {
        return {
          success: false,
          result: {
            output: input,
            success: false,
            errors: [{
              type: 'KEY_ERROR',
              message: `Failed to transpose from ${sourceKey} to ${targetKey}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              recoverable: true,
              suggestion: 'Check that both keys are valid'
            }],
            warnings: []
          }
        };
      }
    }
    return { success: true, chords: originalChords };
  }

  /**
   * Detect format of input text
   */
  detectFormat(text: string): FormatDetectionResult {
    return this.formatDetector.detectFormat(text);
  }

  /**
   * Detect key of input text
   */
  detectKey(text: string, format?: NotationFormat): KeyDetectionResult {
    const extractionFormat = this.getChordExtractionFormat(format);
    return this.autoKeyDetection.detectKey(text, extractionFormat);
  }

  /**
   * Extract chords from text based on format
   */
  private extractChordsFromFormat(text: string, format: NotationFormat) {
    const extractionFormat = this.getChordExtractionFormat(format);
    return ChordParser.extractChordsFromText(text, extractionFormat);
  }

  /**
   * Get chord extraction format based on notation format
   */
  private getChordExtractionFormat(format?: NotationFormat): 'brackets' | 'inline' {
    switch (format) {
      case NotationFormat.ONSONG:
      case NotationFormat.CHORDPRO:
      case NotationFormat.PCO:
        return 'brackets';
      case NotationFormat.SONGBOOK:
      case NotationFormat.GUITAR_TABS:
      case NotationFormat.NASHVILLE:
        return 'inline';
      default:
        return 'brackets';
    }
  }

  /**
   * Reconstructs the text with transposed chords and converted annotations.
   * This method fully utilizes the provided annotation parsers for annotation conversion.
   * However, chord formatting (e.g., adding brackets `[]` for OnSong or curly braces `{}` for ChordPro)
   * is *not* handled by the annotation parsers and thus remains a direct string manipulation,
   * as the existing `BaseParser` implementations are annotation-specific and do not contain methods
   * for formatting the entire song text including chords and lyrics.
   */
  private reconstructText(
    textWithoutOriginalAnnotations: string,
    originalChords: Chord[],
    transposedChords: Chord[],
    originalAnnotationParseResults: IAnnotationParseResult[],
    sourceFormat: NotationFormat, // New parameter
    targetFormat: NotationFormat,
    options: ConversionOptions,
    targetParser: BaseParser
  ): string {
    let result = this._replaceChordsInText(textWithoutOriginalAnnotations, originalChords, transposedChords, sourceFormat, targetFormat);

    if (options.convertAnnotations) {
      result = this._insertConvertedAnnotations(result, originalAnnotationParseResults, targetFormat, targetParser);
    }

    return result;
  }

  /**
   * Helper method to replace original chords with transposed chords in the text,
   * handling format-specific delimiters.
   */
  private _replaceChordsInText(
    text: string,
    originalChords: Chord[],
    transposedChords: Chord[],
    sourceFormat: NotationFormat,
    targetFormat: NotationFormat
  ): string {
    let result = text;
    const sourceChordPattern = this._getChordPatternForExtraction(sourceFormat);
    let originalChordIndex = 0;

    result = result.replace(sourceChordPattern, (match) => {
      const originalChordObject = originalChords[originalChordIndex];
      const transposedChordObject = transposedChords[originalChordIndex];
      originalChordIndex++;

      // If for some reason the chord objects don't align, return original match
      if (!originalChordObject || !transposedChordObject) {
        return match;
      }

      // Format the transposed chord for the target format
      return this._formatChordForNotation(transposedChordObject, targetFormat);
    });

    return result;
  }

  /**
   * Helper to get regex for extracting chords based on the *source* format's delimiters.
   */
  private _getChordPatternForExtraction(format: NotationFormat): RegExp {
    switch (format) {
      case NotationFormat.ONSONG:
      case NotationFormat.GUITAR_TABS:
        // Matches chords like [C], [Am], [C/G], etc.
        return /(\[[A-G][b#]?(?:maj|min|m|M|sus|add|dim|aug|dom)?[0-9]*(?:(?:[/-][A-G][b#]?)?)\])/g;
      case NotationFormat.CHORDPRO:
      case NotationFormat.PCO:
        // Matches chords like {C}, {Am}, {C/G}, etc.
        return /(\{[A-G][b#]?(?:maj|min|m|M|sus|add|dim|aug|dom)?[0-9]*(?:(?:[/-][A-G][b#]?)?)\})/g;
      case NotationFormat.SONGBOOK:
      case NotationFormat.NASHVILLE:
        // Matches inline chords like C, Am directly.
        // This pattern might be too broad if actual lyrics contain chord symbols.
        // For robustness, this would ideally be integrated with a more sophisticated parser.
        return /([A-G][b#]?(?:maj|min|m|M|sus|add|dim|aug|dom)?[0-9]*(?:(?:[/-][A-G][b#]?)?))/g;
      default:
        // Default to a generic chord pattern if format is unknown or not explicitly handled.
        return /([A-G][b#]?(?:maj|min|m|M|sus|add|dim|aug|dom)?[0-9]*(?:(?:[/-][A-G][b#]?)?))/g;
    }
  }

  /**
   * Helper to format a Chord object into a string with specific notation format delimiters.
   */
  private _formatChordForNotation(chord: Chord, targetFormat: NotationFormat): string {
    const chordString = ChordParser.chordToString(chord);
    switch (targetFormat) {
      case NotationFormat.ONSONG:
      case NotationFormat.GUITAR_TABS:
        return `[${chordString}]`;
      case NotationFormat.CHORDPRO:
      case NotationFormat.PCO:
        return `{${chordString}}`;
      case NotationFormat.SONGBOOK:
      case NotationFormat.NASHVILLE:
        return chordString; // No specific delimiters for these inline formats
      default:
        return chordString;
    }
  }

  /**
   * Helper method to convert and insert annotations back into the text.
   */
  private _insertConvertedAnnotations(
    text: string,
    originalAnnotationParseResults: IAnnotationParseResult[],
    targetFormat: NotationFormat,
    targetParser: BaseParser
  ): string {
    const lines = text.split('\n'); // Changed to const
    const annotationsByLine: { [key: number]: { convertedText: string; position: 'above' | 'inline' | 'beside' }[] } = {};

    originalAnnotationParseResults.forEach(parseResult => {
      // Cast targetFormat to AnnotationFormat
      const finalConvertedAnnotationText = targetParser.convert(parseResult.annotation, targetFormat as unknown as AnnotationFormat); // Cast to unknown first
      const originalLineIndex = text.substring(0, parseResult.startIndex).split('\n').length - 1;

      if (!annotationsByLine[originalLineIndex]) {
        annotationsByLine[originalLineIndex] = [];
      }
      annotationsByLine[originalLineIndex].push({
        convertedText: finalConvertedAnnotationText,
        position: parseResult.annotation.position
      });
    });

    const newLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineAnnotations = annotationsByLine[i];

      if (lineAnnotations) {
        lineAnnotations.forEach(ann => {
          if (ann.position === 'above') {
            newLines.push(ann.convertedText);
            newLines.push(line);
          } else {
            newLines.push(`${line} ${ann.convertedText}`);
          }
        });
      } else {
        newLines.push(line);
      }
    }
    return newLines.join('\n');
  }

  /**
   * Get all possible format detections
   */
  detectAllFormats(text: string): FormatDetectionResult[] {
    return this.formatDetector.detectAllFormats(text);
  }

  /**
   * Get all possible key detections
   */
  detectAllKeys(text: string, format?: NotationFormat): KeyDetectionResult[] {
    const extractionFormat = this.getChordExtractionFormat(format);
    return this.autoKeyDetection.detectAllKeys(text, extractionFormat);
  }
}
