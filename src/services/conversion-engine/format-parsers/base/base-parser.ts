import { AnnotationFormat, AnnotationLine, EmptyLine, Line, TextLine } from '../../../../types/line';
import { ConversionError, ConversionErrorFactory } from '../../../../types/conversion-error';
import { ErrorRecoveryService } from '../../error-recovery/error-recovery-service';
import { LineProcessorFactory } from './parsing/line-processor-factory'; 

/**
 * Resultaat van het parsen met foutherstelinformatie
 */
export interface ParseResult {
  lines: Line[];
  errors: ConversionError[];
  warnings: string[];
  partialSuccess: boolean;
}

export abstract class BaseParser {
  protected abstract readonly annotationPatterns: { [key in AnnotationFormat]?: RegExp };
  protected errorRecovery: ErrorRecoveryService;

  constructor() {
    this.errorRecovery = new ErrorRecoveryService();
  }

  public abstract isValid(text: string): boolean;

  /**
   * Parse text and return canonical model (placeholder for now)
   */
  public async parse(text: string): Promise<{
    success: boolean;
    canonicalModel?: any;
    errors?: any[];
    warnings?: string[];
  }> {
    try {
      const parseResult = this.parseToLines(text);
      return {
        success: parseResult.partialSuccess,
        canonicalModel: {
          metadata: {
            id: Date.now().toString(),
            title: '',
            artist: '',
            originalKey: 'C'
          },
          sections: [{
            type: 'verse',
            lines: parseResult.lines
          }],
          parseInfo: {
            sourceFormat: 'unknown',
            parseTimestamp: new Date(),
            parseErrors: parseResult.errors,
            parseWarnings: parseResult.warnings
          }
        },
        errors: parseResult.errors,
        warnings: parseResult.warnings
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown parse error',
          line: 0,
          column: 0,
          recoverable: false
        }],
        warnings: []
      };
    }
  }

  /**
   * Verbeterde parseermethode die Line-objecten genereert met juiste typediscriminatie
   * en uitgebreid foutherstel.
   */
  public parseToLines(text: string): ParseResult {
    const lines: Line[] = [];
    const errors: ConversionError[] = [];
    const warnings: string[] = [];
    let partialSuccess = true;

    if (!text || typeof text !== 'string') {
      const error = ConversionErrorFactory.createParseError('Ongeldige invoer: tekst moet een niet-lege string zijn');
      return { lines: [], errors: [error], warnings, partialSuccess: false };
    }

    const inputLines = text.split('\n');
    let lineNumber = 1;

    for (let i = 0; i < inputLines.length; i++) {
      try {
        const currentLine = inputLines[i];

        // Controleer op opeenvolgende lege regels
        if (this.isEmptyLine(currentLine)) {
          const emptyLineResult = this.parseEmptyLines(inputLines, i);
          lines.push(emptyLineResult.line);
          i = emptyLineResult.nextIndex - 1; // -1 omdat de lus zal ophogen
          lineNumber = emptyLineResult.nextIndex + 1;
          continue;
        }

        // Controleer op annotatieregels
        if (this.isAnnotationLine(currentLine)) {
          try {
            const annotationLine = this.parseAnnotationLine(currentLine, lineNumber);
            lines.push(annotationLine);
          } catch (error) {
            const parseError = ConversionErrorFactory.createParseError(
              `Kan annotatie niet parsen: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
              lineNumber,
              undefined,
              'Controleer annotatiesyntax'
            );

            // Probeer foutherstel
            const recoveryResult = this.errorRecovery.recover(parseError, currentLine);

            if (recoveryResult.success && recoveryResult.partialResult) {
              lines.push(recoveryResult.partialResult as AnnotationLine);
              warnings.push(...recoveryResult.warnings);
              errors.push(...recoveryResult.errors); // Add errors from recovery
            } else {
              // Terugval naar tekstregel
              lines.push(this.createFallbackTextLine(currentLine, lineNumber));
              errors.push(parseError);
              warnings.push(`Regel ${lineNumber}: Annotatie behandeld als tekst vanwege parseerfout`);
            }
            partialSuccess = false;
          }
        } else {
          // Delegeer het parsen van inhoudsregels (die akkoorden kunnen bevatten) aan subklassen
          try {
            const contentLine = this.parseContentLine(currentLine, lineNumber);
            lines.push(contentLine);
          } catch (error) {
            const parseError = ConversionErrorFactory.createParseError(
              `Kan inhoudsregel niet parsen: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
              lineNumber,
              undefined,
              'Controleer regelsyntax en -opmaak'
            );

            const recoveryResult = this.errorRecovery.recover(parseError, currentLine);

            if (recoveryResult.success && recoveryResult.partialResult) {
                lines.push(recoveryResult.partialResult as Line); // Kan TextLine of een ander type zijn
                warnings.push(...recoveryResult.warnings);
                errors.push(...recoveryResult.errors); // Add errors from recovery
            } else {
                lines.push(this.createFallbackTextLine(currentLine, lineNumber));
                errors.push(parseError);
                warnings.push(`Regel ${lineNumber}: Geparseerd als platte tekst vanwege fout`);
            }
            partialSuccess = false;
          }
        }

        lineNumber++;
      } catch (error) {
        const unexpectedError = ConversionErrorFactory.createParseError(
          `Onverwachte fout bij het verwerken van regel ${lineNumber}: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
          lineNumber
        );

        const recoveryResult = this.errorRecovery.recover(unexpectedError, inputLines[i]);

        if (recoveryResult.success && recoveryResult.partialResult) {
          lines.push(recoveryResult.partialResult as Line);
          warnings.push(...recoveryResult.warnings);
          errors.push(...recoveryResult.errors); // Add errors from recovery
        } else {
          errors.push(unexpectedError);
          warnings.push(`Regel ${lineNumber}: Overgeslagen vanwege onverwachte fout`);
        }

        lineNumber++;
        partialSuccess = false;
      }
    }

    return { lines, errors, warnings, partialSuccess };
  }

  // Nieuwe abstracte methode voor subklassen om hun specifieke regelparsing te implementeren
  protected abstract parseContentLine(line: string, lineNumber: number): TextLine | AnnotationLine; // Of algemener 'Line' als subklassen andere regeltypen kunnen retourneren

  public remove(text: string): string {
    let cleanText = text;
    for (const pattern of Object.values(this.annotationPatterns)) {
      if (pattern) {
        // Maak een nieuwe RegExp-instantie met globale vlag om `lastIndex`-problemen te voorkomen bij het `replace`en
        const tempPattern = new RegExp(pattern.source, 'g');
        cleanText = cleanText.replace(tempPattern, '');
      }
    }
    return cleanText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Meerdere lege regels samenvouwen
      .replace(/^\s*\n/gm, '')         // Lege regels aan het begin van de tekst/secties verwijderen
      .trim();
  }

  /**
   * Controleer of een regel leeg is (bevat alleen witruimte)
   */
  protected isEmptyLine(line: string): boolean {
    return line.trim().length === 0;
  }

  /**
   * Parseer opeenvolgende lege regels en retourneer een EmptyLine-object
   */
  protected parseEmptyLines(lines: string[], startIndex: number): { line: EmptyLine; nextIndex: number } {
    let count = 0;
    let currentIndex = startIndex;

    // Tel opeenvolgende lege regels
    while (currentIndex < lines.length && this.isEmptyLine(lines[currentIndex])) {
      count++;
      currentIndex++;
    }

    return {
      line: {
        type: 'empty',
        count,
        lineNumber: startIndex + 1
      },
      nextIndex: currentIndex
    };
  }

  /**
   * Controleer of een regel een sectiekop is (Verse, Chorus, etc.)
   */
  protected isSectionHeader(line: string): boolean {
    const trimmed = line.trim();
    
    // Sectiepatronen voor verschillende formaten
    const sectionPatterns = [
      /^\[(?:Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Post-Chorus|Refrain|Tag|Vamp|Interlude|Solo|Break|Instrumental)(?:\s*\d+)?\]$/i,
      /^(?:Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Post-Chorus|Refrain|Tag|Vamp|Interlude|Solo|Break|Instrumental)(?:\s*\d+)?:?\s*$/i,
      /^\{(?:start_of_|end_of_)(?:verse|chorus|bridge|intro|outro|pre_chorus|post_chorus|refrain|tag|vamp|interlude|solo|break|instrumental)\}$/i
    ];

    return sectionPatterns.some(pattern => pattern.test(trimmed));
  }

  /**
   * Parseer een sectiekop en retourneer het sectietype
   */
  protected parseSectionHeader(line: string): { type: string; title?: string } {
    const trimmed = line.trim();
    
    // Patroon voor [Verse 1], [Chorus], etc.
    const bracketMatch = trimmed.match(/^\[([^[\]]+)\]$/i);
    if (bracketMatch) {
      const content = bracketMatch[1].trim();
      const parts = content.split(/\s+/);
      return {
        type: parts[0].toLowerCase(),
        title: content
      };
    }

    // Patroon voor "Verse 1:", "Chorus:", etc.
    const colonMatch = trimmed.match(/^([^:]+):?\s*$/i);
    if (colonMatch) {
      const content = colonMatch[1].trim();
      const parts = content.split(/\s+/);
      return {
        type: parts[0].toLowerCase(),
        title: content
      };
    }

    // ChordPro sectiepatronen
    const chordProMatch = trimmed.match(/^\{(?:start_of_|end_of_)?([^}]+)\}$/i);
    if (chordProMatch) {
      const sectionType = chordProMatch[1].replace(/_/g, ' ').trim();
      return {
        type: sectionType.toLowerCase(),
        title: sectionType
      };
    }

    return {
      type: 'unknown',
      title: trimmed
    };
  }

  /**
   * Controleer of een regel annotaties bevat
   * Dit is een basisimplementatie - subklassen kunnen deze uitbreiden voor formaatspecifieke logica indien nodig,
   * maar deze veelvoorkomende patronen dekken de basis.
   */
  protected isAnnotationLine(line: string): boolean {
    const trimmed = line.trim();

    // Eerst controleren of het een sectiekop is
    if (this.isSectionHeader(trimmed)) {
      return true; // Sectiekoppen worden behandeld als annotaties
    }

    // Veelvoorkomende annotatiepatronen
    const commonPatterns = [
      /^\*.*$/,           // OnSong/Algemene commentaren (*)
      /^\(.*\)$/,         // Songbook commentaren (haakjes)
      /^\{(?:comment|c):/i, // ChordPro commentaren
      /^<b>.*<\/b>$/,     // PCO vetgedrukte annotaties
    ];

    // Controleer of een van de formaatspecifieke annotatiepatronen (van `this.annotationPatterns`) overeenkomt
    const formatSpecificMatch = Object.values(this.annotationPatterns).some(pattern => {
        if (pattern) {
            // Maak een nieuwe RegExp-instantie om `lastIndex`-problemen te voorkomen bij het `test`en
            return new RegExp(pattern.source, pattern.flags).test(trimmed);
        }
        return false;
    });

    return commonPatterns.some(pattern => pattern.test(trimmed)) || formatSpecificMatch;
  }

  /**
   * Parseer een annotatieregel
   */
  protected parseAnnotationLine(line: string, lineNumber: number): AnnotationLine {
    const trimmed = line.trim();
    let value = trimmed;
    let annotationType: 'comment' | 'section' | 'instruction' | 'tempo' | 'dynamics' = 'comment';

    // Eerst controleren of het een sectiekop is
    if (this.isSectionHeader(trimmed)) {
      const sectionInfo = this.parseSectionHeader(trimmed);
      value = sectionInfo.title || sectionInfo.type;
      annotationType = 'section';
    } else if (trimmed.startsWith('*')) {
      value = trimmed.substring(1).trim();
      annotationType = 'comment';
    } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      value = trimmed.substring(1, trimmed.length - 1).trim();
      annotationType = this.classifyAnnotationType(value);
    } else if (trimmed.match(/^\{(?:comment|c):/i)) {
      const match = trimmed.match(/^\{(?:comment|c):\s*(.+?)\}$/i);
      value = match ? match[1].trim() : trimmed;
      annotationType = 'comment';
    } else if (trimmed.startsWith('<b>') && trimmed.endsWith('</b>')) {
      value = trimmed.substring(3, trimmed.length - 4).trim();
      annotationType = this.classifyAnnotationType(value);
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Algemene regel tussen haakjes, classificeer inhoud
        value = trimmed.substring(1, trimmed.length - 1).trim();
        annotationType = this.classifyAnnotationType(value);
    }

    return {
      type: 'annotation',
      value,
      annotationType,
      lineNumber
    };
  }

  /**
   * Classificeer annotatietype op basis van inhoud
   */
  protected classifyAnnotationType(content: string): 'comment' | 'instruction' | 'tempo' | 'dynamics' | 'section' {
    const lowerContent = content.toLowerCase();

    // Sectie-indicatoren
    if (lowerContent.match(/\b(verse|chorus|bridge|intro|outro|pre[-\s]?chorus|post[-\s]?chorus|refrain|tag|vamp|interlude|solo|break|instrumental)\b/) ||
        lowerContent.match(/\b(verse|chorus|bridge)\s*\d+\b/) ||
        lowerContent.match(/\b(v|c|b)\d+\b/)) {
      return 'section';
    }

    // Tempo-indicatoren
    if (lowerContent.match(/\b(tempo|slow(er)?|fast(er)?|moderate|allegro|andante|adagio|presto|largo|vivace|steady)\b/) ||
        lowerContent.match(/\b\d+\s*bpm\b/) ||
        lowerContent.match(/\ballegroi?\b/)) {
      return 'tempo';
    }

    // Dynamische indicatoren
    if (lowerContent.match(/\b(dynamics|loud(er)?|soft(ly|er)?|forte|piano|crescendo|diminuendo|ff|f|mf|mp|p|pp|sfz|sforzando)\b/)) {
      return 'dynamics';
    }

    // Instructie-indicatoren
    if (lowerContent.match(/\b(instruction|repeat|play|stop|pause|hold|fermata|ritard(ando)?|accel(erando)?|da capo|dal segno|fine|coda|simile|tacet)\b/) ||
        lowerContent.match(/\brepeat\s*\d+x?\b/) ||
        lowerContent.match(/\b\d+x\b/) ||
        lowerContent.match(/\b(play\s+\w+|hold\s+\w+)\b/)) {
      return 'instruction';
    }

    return 'comment';
  }

  /**
   * Maak een terugvaltekstregel wanneer het parsen mislukt of de inhoud eenvoudige tekst is.
   * Dit is nu een concrete methode in BaseParser.
   */
  protected createFallbackTextLine(line: string, lineNumber: number): TextLine {
    return {
      type: 'text',
      text: line,
      chords: [], // Geen akkoorden standaard voor een terugval
      lineNumber
    };
  }

  protected determineAnnotationPosition(
    text: string,
    annotationIndex: number,
    format: AnnotationFormat
  ): 'above' | 'inline' | 'beside' {
    const lines = text.split('\n');
    let currentIndex = 0;
    let lineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentIndex + lines[i].length >= annotationIndex) {
        lineIndex = i;
        break;
      }
      currentIndex += lines[i].length + 1;
    }

    const line = lines[lineIndex];

    switch (format) {
      case AnnotationFormat.ONSONG:
        return line.trim().startsWith('*') ? 'above' : 'inline';
      case AnnotationFormat.SONGBOOK:
        return line.trim().startsWith('(') && line.trim().endsWith(')') ? 'above' : 'inline';
      case AnnotationFormat.PCO:
        const hasOtherContentPCO = line.replace(/<b>[^<]+<\/b>/g, '').trim().length > 0;
        return hasOtherContentPCO ? 'beside' : 'above';
      case AnnotationFormat.CHORDPRO:
        const annotationRegex = /\{(?:comment|c):\s*(.+?)\}/;
        const cleanedLine = line.replace(annotationRegex, '').trim();
        return cleanedLine.length > 0 ? 'beside' : 'above';
      case AnnotationFormat.GUITAR_TABS:
        // Voor GuitarTabs is een sectiekop zoals [Intro] of een commentaar zoals *comment
        // meestal "boven" de volgende tabregels.
        // Als het de enige inhoud op de regel is, is het 'above'.
        // Bijgewerkt: Regex voor sectiekoppen is nu hoofdletterongevoelig voor trefwoorden.
        const gtSectionRegex = /^\[(intro|verse|chorus|bridge|outro|solo|instrumental)(?:\s\d+)?\]$/i; // Hoofdletterongevoelig
        const gtCommentRegex = /^\*(.+)$/; // The regex from GuitarTabsParser for comments

        if (gtSectionRegex.test(line.trim())) {
             return 'above'; // Sectiekoppen zijn meestal boven
        }
        if (gtCommentRegex.test(line.trim())) {
            // Als de regel *alleen* het commentaar bevat, is het 'above', anders 'beside'
            return line.trim().replace(gtCommentRegex, '').trim().length === 0 ? 'above' : 'beside';
        }
        return 'above'; // Standaard voor andere gevallen in GuitarTabs-context
      default:
        return 'above';
    }
  }
}
