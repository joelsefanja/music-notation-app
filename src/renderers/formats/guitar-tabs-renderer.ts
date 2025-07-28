import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { BaseRenderer } from '../core/base-renderer';
import { NotationFormat, RenderingOptions, WhitespaceRules } from '../core/renderer.interface';

/**
 * Guitar Tabs format renderer
 * Renders chordsheets in guitar tablature format with chords above lyrics
 */
export class GuitarTabsRenderer extends BaseRenderer {
    public readonly format = NotationFormat.GUITAR_TABS;

    /**
     * Get Guitar Tabs-specific whitespace rules
     */
    public getDefaultWhitespaceRules(): WhitespaceRules {
        return {
            emptyLinesAfterComments: 1,
            emptyLinesAfterSections: 2,
            emptyLinesBetweenSections: 2,
            preserveConsecutiveEmptyLines: true
        };
    }

    /**
     * Render Guitar Tabs-specific metadata
     */
    protected renderMetadata(chordsheet: Chordsheet, options?: RenderingOptions): string {
        if (!options?.includeMetadata) {
            return '';
        }

        const metadata: string[] = [];
        
        // Guitar tabs format with clear headers
        if (chordsheet.title) {
            metadata.push(`// ${chordsheet.title}`);
        }
        
        if (chordsheet.artist) {
            metadata.push(`// Artist: ${chordsheet.artist}`);
        }
        
        if (chordsheet.originalKey) {
            metadata.push(`// Key: ${chordsheet.originalKey}`);
        }

        // Add guitar-specific metadata
        if (chordsheet.metadata) {
            if (chordsheet.metadata.tempo) {
                metadata.push(`// Tempo: ${chordsheet.metadata.tempo}`);
            }
            if (chordsheet.metadata.capo) {
                metadata.push(`// Capo: ${chordsheet.metadata.capo}`);
            }
            if (chordsheet.metadata.tuning) {
                metadata.push(`// Tuning: ${chordsheet.metadata.tuning}`);
            }
        }

        return metadata.length > 0 ? metadata.join('\n') + '\n\n' : '';
    }

    /**
     * Render Guitar Tabs section titles
     */
    protected renderSectionTitle(section: Section, options?: RenderingOptions): string {
        if (!section.title) {
            return '';
        }

        // Guitar tabs format with comment-style section headers
        return `// ${section.title}\n`;
    }

    /**
     * Guitar Tabs-specific validation
     */
    public canRender(chordsheet: Chordsheet): boolean {
        if (!super.canRender(chordsheet)) {
            return false;
        }

        // Guitar tabs format works with any chord content
        return true;
    }

    /**
     * Escape special characters for Guitar Tabs format
     */
    protected escapeSpecialCharacters(text: string): string {
        // Guitar tabs format has minimal special character requirements
        return text;
    }

    /**
     * Override section spacing for guitar tabs format
     */
    protected getSectionSpacing(options: RenderingOptions): number {
        return options.whitespaceRules?.emptyLinesBetweenSections ?? 2;
    }
}