import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { BaseRenderer } from '../core/base-renderer';
import { NotationFormat, RenderingOptions, WhitespaceRules } from '../core/renderer.interface';

/**
 * ChordPro format renderer
 * Renders chordsheets in ChordPro format with inline chord notation
 */
export class ChordProRenderer extends BaseRenderer {
    public readonly format = NotationFormat.CHORDPRO;

    /**
     * Get ChordPro-specific whitespace rules
     */
    public getDefaultWhitespaceRules(): WhitespaceRules {
        return {
            emptyLinesAfterComments: 0,
            emptyLinesAfterSections: 1,
            emptyLinesBetweenSections: 1,
            preserveConsecutiveEmptyLines: true
        };
    }

    /**
     * Render ChordPro-specific metadata
     */
    protected renderMetadata(chordsheet: Chordsheet, options?: RenderingOptions): string {
        if (!options?.includeMetadata) {
            return '';
        }

        const metadata: string[] = [];
        
        if (chordsheet.title) {
            metadata.push(`{title: ${chordsheet.title}}`);
        }
        
        if (chordsheet.artist) {
            metadata.push(`{artist: ${chordsheet.artist}}`);
        }
        
        if (chordsheet.originalKey) {
            metadata.push(`{key: ${chordsheet.originalKey}}`);
        }

        // Add additional ChordPro metadata if available
        if (chordsheet.metadata) {
            if (chordsheet.metadata.album) {
                metadata.push(`{album: ${chordsheet.metadata.album}}`);
            }
            if (chordsheet.metadata.year) {
                metadata.push(`{year: ${chordsheet.metadata.year}}`);
            }
            if (chordsheet.metadata.tempo) {
                metadata.push(`{tempo: ${chordsheet.metadata.tempo}}`);
            }
            if (chordsheet.metadata.capo) {
                metadata.push(`{capo: ${chordsheet.metadata.capo}}`);
            }
        }

        return metadata.length > 0 ? metadata.join('\n') + '\n\n' : '';
    }

    /**
     * Render ChordPro section titles with proper directives
     */
    protected renderSectionTitle(section: Section, options?: RenderingOptions): string {
        if (!section.title) {
            return '';
        }

        // Map section types to ChordPro directives
        const sectionDirective = this.getSectionDirective(section.type);
        
        if (sectionDirective) {
            return `{${sectionDirective}: ${section.title}}\n`;
        }

        // Fallback to comment for unknown section types
        return `{comment: ${section.title}}\n`;
    }

    /**
     * Get ChordPro directive for section type
     */
    private getSectionDirective(sectionType: string): string | null {
        const directiveMap: Record<string, string> = {
            'verse': 'verse',
            'chorus': 'chorus',
            'bridge': 'bridge',
            'pre-chorus': 'prechorus',
            'intro': 'comment',
            'outro': 'comment',
            'instrumental': 'comment',
            'solo': 'comment',
            'coda': 'comment',
            'tag': 'comment',
            'note': 'comment',
            'unknown': 'comment'
        };

        return directiveMap[sectionType] || null;
    }

    /**
     * Escape special characters for ChordPro format
     */
    protected escapeSpecialCharacters(text: string): string {
        return text
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]');
    }

    /**
     * ChordPro-specific validation
     */
    public canRender(chordsheet: Chordsheet): boolean {
        if (!super.canRender(chordsheet)) {
            return false;
        }

        // ChordPro can render most content, but check for any format-specific issues
        return true;
    }
}