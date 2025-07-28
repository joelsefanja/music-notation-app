import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { Line, TextLine, EmptyLine, AnnotationLine } from '../../types/line';

/**
 * Supported notation formats for rendering
 */
export enum NotationFormat {
    CHORDPRO = 'chordpro',
    ONSONG = 'onsong',
    SONGBOOK = 'songbook',
    GUITAR_TABS = 'guitar_tabs',
    NASHVILLE = 'nashville'
}

/**
 * Rendering options that can be passed to renderers
 */
export interface RenderingOptions {
    preserveOriginalText?: boolean; // Use originalText from ChordPlacement when available
    chordPlacement?: 'above' | 'inline' | 'auto'; // Override chord placement
    includeMetadata?: boolean; // Include metadata in output
    whitespaceRules?: WhitespaceRules; // Format-specific whitespace rules
}

/**
 * Format-specific whitespace rules
 */
export interface WhitespaceRules {
    emptyLinesAfterComments?: number; // Number of empty lines after comments
    emptyLinesAfterSections?: number; // Number of empty lines after sections
    emptyLinesBetweenSections?: number; // Number of empty lines between sections
    preserveConsecutiveEmptyLines?: boolean; // Whether to preserve multiple empty lines
}

/**
 * Result of a rendering operation
 */
export interface RenderingResult {
    content: string; // The rendered content
    format: NotationFormat; // The target format
    metadata?: {
        linesRendered: number;
        sectionsRendered: number;
        chordsRendered: number;
        renderingTime?: number;
    };
    warnings?: string[]; // Any warnings during rendering
}

/**
 * Base interface for all renderers
 */
export interface IRenderer {
    /**
     * The format this renderer targets
     */
    readonly format: NotationFormat;

    /**
     * Render a complete chordsheet to the target format
     */
    render(chordsheet: Chordsheet, options?: RenderingOptions): RenderingResult;

    /**
     * Render a single section to the target format
     */
    renderSection(section: Section, options?: RenderingOptions): string;

    /**
     * Render a single line to the target format
     */
    renderLine(line: Line, options?: RenderingOptions): string;

    /**
     * Get the default whitespace rules for this format
     */
    getDefaultWhitespaceRules(): WhitespaceRules;

    /**
     * Validate that the chordsheet can be rendered in this format
     */
    canRender(chordsheet: Chordsheet): boolean;
}

/**
 * Interface for line-specific rendering methods
 */
export interface ILineRenderer {
    /**
     * Render a text line with chords
     */
    renderTextLine(line: TextLine, options?: RenderingOptions): string;

    /**
     * Render empty lines
     */
    renderEmptyLine(line: EmptyLine, options?: RenderingOptions): string;

    /**
     * Render annotation lines
     */
    renderAnnotationLine(line: AnnotationLine, options?: RenderingOptions): string;
}

/**
 * Factory interface for creating renderers
 */
export interface IRendererFactory {
    /**
     * Create a renderer for the specified format
     */
    createRenderer(format: NotationFormat): IRenderer;

    /**
     * Get all supported formats
     */
    getSupportedFormats(): NotationFormat[];

    /**
     * Check if a format is supported
     */
    isFormatSupported(format: NotationFormat): boolean;
}