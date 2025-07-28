import { Line, TextLine, EmptyLine, AnnotationLine, isTextLine, isEmptyLine, isAnnotationLine } from '../../types/line';
import { ChordPlacement } from '../../types/chord';
import { ILineRenderer, NotationFormat, RenderingOptions } from './renderer.interface';

/**
 * Core line renderer that handles type-specific rendering for all Line types
 */
export class LineRenderer implements ILineRenderer {
    constructor(private format: NotationFormat) {}

    /**
     * Render any line type to the target format
     */
    public renderLine(line: Line, options?: RenderingOptions): string {
        if (isTextLine(line)) {
            return this.renderTextLine(line, options);
        } else if (isEmptyLine(line)) {
            return this.renderEmptyLine(line, options);
        } else if (isAnnotationLine(line)) {
            return this.renderAnnotationLine(line, options);
        }
        
        throw new Error(`Unknown line type: ${(line as any).type}`);
    }

    /**
     * Render a text line with chords
     */
    public renderTextLine(line: TextLine, options?: RenderingOptions): string {
        if (line.chords.length === 0) {
            // Simple text line without chords
            return line.text + '\n';
        }

        const chordPlacement = this.determineChordPlacement(options);
        
        switch (chordPlacement) {
            case 'above':
                return this.renderChordsAbove(line, options);
            case 'inline':
                return this.renderChordsInline(line, options);
            case 'auto':
                return this.renderChordsAuto(line, options);
            default:
                // Fallback to format-specific default
                if (chordPlacement === 'above') {
                    return this.renderChordsAbove(line, options);
                } else {
                    return this.renderChordsInline(line, options);
                }
        }
    }

    /**
     * Render empty lines
     */
    public renderEmptyLine(line: EmptyLine, options?: RenderingOptions): string {
        const count = line.count ?? 1;
        return '\n'.repeat(count);
    }

    /**
     * Render annotation lines with format-specific markup
     */
    public renderAnnotationLine(line: AnnotationLine, options?: RenderingOptions): string {
        const wrappedValue = this.wrapAnnotation(line.value, line.annotationType);
        
        // Apply format-specific whitespace rules for annotations
        const spacing = this.getAnnotationSpacing(line.annotationType, options);
        
        return wrappedValue + '\n' + (spacing > 0 ? '\n'.repeat(spacing) : '');
    }

    /**
     * Determine chord placement strategy based on format and options
     */
    private determineChordPlacement(options?: RenderingOptions): 'above' | 'inline' | 'auto' {
        if (options?.chordPlacement && options.chordPlacement !== 'auto') {
            return options.chordPlacement;
        }

        // Format-specific defaults
        switch (this.format) {
            case NotationFormat.CHORDPRO:
                return 'inline';
            case NotationFormat.ONSONG:
                return 'inline';
            case NotationFormat.SONGBOOK:
                return 'above';
            case NotationFormat.GUITAR_TABS:
                return 'above';
            case NotationFormat.NASHVILLE:
                return 'inline';
            default:
                return 'above';
        }
    }

    /**
     * Render chords above the text line
     */
    private renderChordsAbove(line: TextLine, options?: RenderingOptions): string {
        if (line.chords.length === 0) {
            return line.text + '\n';
        }

        // Sort chords by position
        const sortedChords = [...line.chords].sort((a, b) => a.startIndex - b.startIndex);
        
        // Build chord line
        const chordLine = this.buildChordLine(line.text, sortedChords, options);
        
        return chordLine + '\n' + line.text + '\n';
    }

    /**
     * Render chords inline with the text
     */
    private renderChordsInline(line: TextLine, options?: RenderingOptions): string {
        if (line.chords.length === 0) {
            return line.text + '\n';
        }

        // Sort chords by position (reverse order for insertion)
        const sortedChords = [...line.chords].sort((a, b) => b.startIndex - a.startIndex);
        
        let result = line.text;
        
        // Insert chords from right to left to maintain positions
        for (const chord of sortedChords) {
            const chordText = this.formatInlineChord(chord, options);
            result = result.slice(0, chord.startIndex) + chordText + result.slice(chord.startIndex);
        }
        
        return result + '\n';
    }

    /**
     * Auto-determine best rendering method based on format and content
     */
    private renderChordsAuto(line: TextLine, options?: RenderingOptions): string {
        // For auto mode, use format-specific defaults
        switch (this.format) {
            case NotationFormat.CHORDPRO:
            case NotationFormat.ONSONG:
            case NotationFormat.NASHVILLE:
                return this.renderChordsInline(line, options);
            case NotationFormat.SONGBOOK:
            case NotationFormat.GUITAR_TABS:
            default:
                return this.renderChordsAbove(line, options);
        }
    }

    /**
     * Build a chord line positioned above text
     */
    private buildChordLine(text: string, chords: ChordPlacement[], options?: RenderingOptions): string {
        const chordLine = new Array(text.length).fill(' ');
        
        for (const chord of chords) {
            const chordText = this.formatChordForAbove(chord, options);
            const startPos = Math.max(0, chord.startIndex);
            
            // Place chord text, ensuring it doesn't overflow
            for (let i = 0; i < chordText.length && startPos + i < chordLine.length; i++) {
                chordLine[startPos + i] = chordText[i];
            }
        }
        
        return chordLine.join('').trimEnd();
    }

    /**
     * Format a chord for above-text placement
     */
    private formatChordForAbove(chord: ChordPlacement, options?: RenderingOptions): string {
        if (options?.preserveOriginalText && chord.originalText) {
            // Remove format-specific brackets/markup for above placement
            return this.cleanChordText(chord.originalText);
        }
        
        return chord.value;
    }

    /**
     * Format a chord for inline placement
     */
    private formatInlineChord(chord: ChordPlacement, options?: RenderingOptions): string {
        if (options?.preserveOriginalText && chord.originalText) {
            return chord.originalText;
        }
        
        // Apply format-specific inline formatting
        return this.wrapInlineChord(chord.value);
    }

    /**
     * Wrap a chord for inline placement based on format
     */
    private wrapInlineChord(chordValue: string): string {
        switch (this.format) {
            case NotationFormat.CHORDPRO:
                return `[${chordValue}]`;
            case NotationFormat.ONSONG:
                return `[${chordValue}]`;
            case NotationFormat.NASHVILLE:
                return `[${chordValue}]`;
            case NotationFormat.SONGBOOK:
                return chordValue; // Songbook typically uses above placement
            case NotationFormat.GUITAR_TABS:
                return chordValue; // Guitar tabs typically use above placement
            default:
                return `[${chordValue}]`;
        }
    }

    /**
     * Clean chord text by removing format-specific markup
     */
    private cleanChordText(originalText: string): string {
        // Remove common chord markup patterns
        return originalText
            .replace(/^\[|\]$/g, '') // Remove square brackets
            .replace(/^\(|\)$/g, '') // Remove parentheses
            .replace(/^{|}$/g, '')   // Remove curly braces
            .trim();
    }

    /**
     * Wrap annotation with format-specific markup
     */
    private wrapAnnotation(value: string, annotationType: string): string {
        switch (this.format) {
            case NotationFormat.CHORDPRO:
                return this.wrapChordProAnnotation(value, annotationType);
            case NotationFormat.ONSONG:
                return this.wrapOnSongAnnotation(value, annotationType);
            case NotationFormat.SONGBOOK:
                return this.wrapSongbookAnnotation(value, annotationType);
            case NotationFormat.GUITAR_TABS:
                return this.wrapGuitarTabsAnnotation(value, annotationType);
            case NotationFormat.NASHVILLE:
                return this.wrapNashvilleAnnotation(value, annotationType);
            default:
                return value;
        }
    }

    /**
     * ChordPro annotation formatting
     */
    private wrapChordProAnnotation(value: string, annotationType: string): string {
        switch (annotationType) {
            case 'comment':
                return `{comment: ${value}}`;
            case 'instruction':
                return `{${value}}`;
            case 'tempo':
                return `{tempo: ${value}}`;
            case 'dynamics':
                return `{comment: ${value}}`;
            default:
                return `{comment: ${value}}`;
        }
    }

    /**
     * OnSong annotation formatting
     */
    private wrapOnSongAnnotation(value: string, annotationType: string): string {
        switch (annotationType) {
            case 'comment':
                return `*${value}`;
            case 'instruction':
                return `*${value}`;
            case 'tempo':
                return `Tempo: ${value}`;
            case 'dynamics':
                return `*${value}`;
            default:
                return `*${value}`;
        }
    }

    /**
     * Songbook annotation formatting
     */
    private wrapSongbookAnnotation(value: string, annotationType: string): string {
        switch (annotationType) {
            case 'comment':
                return `(${value})`;
            case 'instruction':
                return `(${value})`;
            case 'tempo':
                return `(${value})`;
            case 'dynamics':
                return `(${value})`;
            default:
                return `(${value})`;
        }
    }

    /**
     * Guitar Tabs annotation formatting
     */
    private wrapGuitarTabsAnnotation(value: string, annotationType: string): string {
        switch (annotationType) {
            case 'comment':
                return `// ${value}`;
            case 'instruction':
                return `[${value}]`;
            case 'tempo':
                return `Tempo: ${value}`;
            case 'dynamics':
                return `[${value}]`;
            default:
                return `// ${value}`;
        }
    }

    /**
     * Nashville annotation formatting
     */
    private wrapNashvilleAnnotation(value: string, annotationType: string): string {
        switch (annotationType) {
            case 'comment':
                return `(${value})`;
            case 'instruction':
                return `[${value}]`;
            case 'tempo':
                return `Tempo: ${value}`;
            case 'dynamics':
                return `(${value})`;
            default:
                return `(${value})`;
        }
    }

    /**
     * Get spacing after annotations based on format and type
     */
    private getAnnotationSpacing(annotationType: string, options?: RenderingOptions): number {
        const rules = options?.whitespaceRules;
        
        if (rules?.emptyLinesAfterComments !== undefined && annotationType === 'comment') {
            return rules.emptyLinesAfterComments;
        }

        // Format-specific defaults
        switch (this.format) {
            case NotationFormat.SONGBOOK:
                return annotationType === 'comment' ? 3 : 1; // Three empty lines after Songbook comments
            case NotationFormat.CHORDPRO:
                return 0;
            case NotationFormat.ONSONG:
                return 0;
            case NotationFormat.GUITAR_TABS:
                return 1;
            case NotationFormat.NASHVILLE:
                return 0;
            default:
                return 0;
        }
    }
}