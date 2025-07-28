import { BaseLineParserWithChords } from '../base/base-line-parser-with-chords';
import { AnnotationFormat } from '../../../../types/line';
import { FormatValidatorFactory } from '../base/validation/format-validator-factory';
import { AnnotationPatterns } from '../base/annotation-patterns'; 
import { NashvilleConverter } from '../../nashville-converter';
import { ChordExtractionFactory } from '../base/chord-extraction/chord-extraction-factory';

/**
 * Nashville Number System parser - handles 1 4 5 1 notation with rhythmic symbols
 */
export class NashvilleParser extends BaseLineParserWithChords {
    protected readonly annotationPatterns = AnnotationPatterns.getAllPatterns();
    private converterService = new NashvilleConverter();

    protected getFormat(): AnnotationFormat {
        // Nashville uses a special strategy, but we'll handle it differently
        return AnnotationFormat.ONSONG; // Fallback, we override the extraction
    }

    public isValid(text: string): boolean {
        return FormatValidatorFactory.getNashvilleValidator().isValid(text);
    }

    protected extractChordsWithPositions(line: string) {
        return ChordExtractionFactory.getNashvilleStrategy().extractChords(line);
    }

    /**
     * Parse Nashville chord string - delegates to converter service
     */
    public parseNashvilleChord(numberStr: string, beforeSymbols = '', afterSymbols = '') {
        return this.converterService.parseNashvilleString(numberStr);
    }

    /**
     * Convert Nashville to standard chord - delegates to converter service
     */
    public nashvilleToChord(nashvilleChord: any, key: string) {
        return this.converterService.nashvilleToChord(nashvilleChord, key);
    }

    /**
     * Verbeterde annotatieregeldetectie voor Nashville-formaat
     */
    protected isAnnotationLine(line: string): boolean {
        const trimmed = line.trim();

        // Eerst controleren of het een sectiekop is (gebruik de base class methode)
        if (this.isSectionHeader(trimmed)) {
            return true;
        }

        // Controleer op veelvoorkomende annotatiepatronen
        const annotationPatterns = [
            /^\*.*$/,           // OnSong-stijl commentaren
            /^\(.*\)$/,         // Songbook-stijl commentaren
            /^\{(?:comment|c):/i, // ChordPro commentaren
            /^<b>.*<\/b>$/,     // PCO vetgedrukte annotaties
        ];

        // Controleer of het een annotatiepatroon is, maar geen Nashville-akkoord
        const isAnnotation = annotationPatterns.some(pattern => pattern.test(trimmed));
        
        // Specifieke regex voor Nashville-akkoorden tussen haakjes
        const isNashvilleChord = /^\[[1-7][#b]?[m°+]?(?:sus|add|maj|min)?[0-9]*(?:\/[1-7][#b]?)?\]$/.test(trimmed);

        return isAnnotation && !isNashvilleChord;
    }
}