import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { Line } from '../../types/line';
import { 
    IRenderer, 
    NotationFormat, 
    RenderingOptions, 
    RenderingResult, 
    WhitespaceRules 
} from './renderer.interface';
import { LineRenderer } from './line-renderer';

/**
 * Abstract base class for all renderers providing common functionality
 */
export abstract class BaseRenderer implements IRenderer {
    private _lineRenderer?: LineRenderer;

    protected get lineRenderer(): LineRenderer {
        if (!this._lineRenderer) {
            this._lineRenderer = new LineRenderer(this.format);
        }
        return this._lineRenderer;
    }

    /**
     * The format this renderer targets (must be implemented by subclasses)
     */
    public abstract readonly format: NotationFormat;

    /**
     * Get format-specific whitespace rules (must be implemented by subclasses)
     */
    public abstract getDefaultWhitespaceRules(): WhitespaceRules;

    /**
     * Render format-specific metadata (can be overridden by subclasses)
     */
    protected renderMetadata(chordsheet: Chordsheet, options?: RenderingOptions): string {
        if (!options?.includeMetadata) {
            return '';
        }

        const metadata: string[] = [];
        
        if (chordsheet.title) {
            metadata.push(this.formatMetadataField('title', chordsheet.title));
        }
        
        if (chordsheet.artist) {
            metadata.push(this.formatMetadataField('artist', chordsheet.artist));
        }
        
        if (chordsheet.originalKey) {
            metadata.push(this.formatMetadataField('key', chordsheet.originalKey));
        }

        return metadata.length > 0 ? metadata.join('\n') + '\n\n' : '';
    }

    /**
     * Format a metadata field (can be overridden by subclasses for format-specific formatting)
     */
    protected formatMetadataField(field: string, value: string): string {
        return `${field}: ${value}`;
    }

    /**
     * Render a complete chordsheet to the target format
     */
    public render(chordsheet: Chordsheet, options?: RenderingOptions): RenderingResult {
        const startTime = performance.now();
        const warnings: string[] = [];
        
        if (!this.canRender(chordsheet)) {
            throw new Error(`Cannot render chordsheet in ${this.format} format`);
        }

        const mergedOptions = this.mergeOptions(options);
        const content: string[] = [];

        // Add metadata if requested
        const metadataContent = this.renderMetadata(chordsheet, mergedOptions);
        if (metadataContent) {
            content.push(metadataContent);
        }

        // Render sections
        let sectionsRendered = 0;
        let linesRendered = 0;
        let chordsRendered = 0;

        for (let i = 0; i < chordsheet.sections.length; i++) {
            const section = chordsheet.sections[i];
            const sectionContent = this.renderSection(section, mergedOptions);
            
            if (sectionContent.trim()) {
                content.push(sectionContent);
                sectionsRendered++;
                linesRendered += section.lines.length;
                
                // Count chords in this section
                section.lines.forEach(line => {
                    if (line.type === 'text') {
                        chordsRendered += line.chords.length;
                    }
                });

                // Add spacing between sections if not the last section
                if (i < chordsheet.sections.length - 1) {
                    const spacing = this.getSectionSpacing(mergedOptions);
                    if (spacing > 0) {
                        content.push('\n'.repeat(spacing));
                    }
                }
            }
        }

        const endTime = performance.now();
        
        return {
            content: content.join(''),
            format: this.format,
            metadata: {
                linesRendered,
                sectionsRendered,
                chordsRendered,
                renderingTime: endTime - startTime
            },
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /**
     * Render a single section to the target format
     */
    public renderSection(section: Section, options?: RenderingOptions): string {
        const mergedOptions = this.mergeOptions(options);
        const content: string[] = [];

        // Add section title if present
        const sectionTitle = this.renderSectionTitle(section, mergedOptions);
        if (sectionTitle) {
            content.push(sectionTitle);
        }

        // Render lines
        for (const line of section.lines) {
            const lineContent = this.renderLine(line, mergedOptions);
            content.push(lineContent);
        }

        return content.join('');
    }

    /**
     * Render a section title (can be overridden by subclasses for format-specific formatting)
     */
    protected renderSectionTitle(section: Section, options?: RenderingOptions): string {
        if (!section.title) {
            return '';
        }

        return `[${section.title}]\n`;
    }

    /**
     * Render a single line to the target format
     */
    public renderLine(line: Line, options?: RenderingOptions): string {
        const mergedOptions = this.mergeOptions(options);
        return this.lineRenderer.renderLine(line, mergedOptions);
    }

    /**
     * Get spacing between sections
     */
    protected getSectionSpacing(options: RenderingOptions): number {
        return options.whitespaceRules?.emptyLinesBetweenSections ?? 1;
    }

    /**
     * Merge provided options with defaults
     */
    protected mergeOptions(options?: RenderingOptions): RenderingOptions {
        const defaultOptions: RenderingOptions = {
            preserveOriginalText: false,
            chordPlacement: 'auto',
            includeMetadata: true,
            whitespaceRules: this.getDefaultWhitespaceRules()
        };

        if (!options) {
            return defaultOptions;
        }

        return {
            ...defaultOptions,
            ...options,
            whitespaceRules: {
                ...defaultOptions.whitespaceRules,
                ...options.whitespaceRules
            }
        };
    }

    /**
     * Validate that the chordsheet can be rendered in this format
     * Base implementation - can be overridden by subclasses for format-specific validation
     */
    public canRender(chordsheet: Chordsheet): boolean {
        if (!chordsheet || !chordsheet.sections) {
            return false;
        }

        // Basic validation - all sections should have valid lines
        return chordsheet.sections.every(section => 
            section.lines && Array.isArray(section.lines)
        );
    }

    /**
     * Utility method to escape special characters for the target format
     * Can be overridden by subclasses for format-specific escaping
     */
    protected escapeSpecialCharacters(text: string): string {
        return text;
    }

    /**
     * Utility method to normalize whitespace according to format rules
     */
    protected normalizeWhitespace(text: string, options: RenderingOptions): string {
        const rules = options.whitespaceRules;
        
        if (!rules?.preserveConsecutiveEmptyLines) {
            // Replace multiple consecutive newlines with single newlines
            text = text.replace(/\n{3,}/g, '\n\n');
        }

        return text;
    }
}