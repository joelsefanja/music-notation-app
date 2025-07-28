import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { BaseRenderer } from '../core/base-renderer';
import { NotationFormat, RenderingOptions, WhitespaceRules } from '../core/renderer.interface';

/**
 * OnSong format renderer
 * Renders chordsheets in OnSong format with inline chord notation
 */
export class OnSongRenderer extends BaseRenderer {
    public readonly format = NotationFormat.ONSONG;

    /**
     * Get OnSong-specific whitespace rules
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
     * Render OnSong-specific metadata
     */
    protected renderMetadata(chordsheet: Chordsheet, options?: RenderingOptions): string {
        if (!options?.includeMetadata) {
            return '';
        }

        const metadata: string[] = [];
        
        if (chordsheet.title) {
            metadata.push(`Title: ${chordsheet.title}`);
        }
        
        if (chordsheet.artist) {
            metadata.push(`Artist: ${chordsheet.artist}`);
        }
        
        if (chordsheet.originalKey) {
            metadata.push(`Key: ${chordsheet.originalKey}`);
        }

        // Add additional OnSong metadata if available
        if (chordsheet.metadata) {
            if (chordsheet.metadata.album) {
                metadata.push(`Album: ${chordsheet.metadata.album}`);
            }
            if (chordsheet.metadata.year) {
                metadata.push(`Year: ${chordsheet.metadata.year}`);
            }
            if (chordsheet.metadata.tempo) {
                metadata.push(`Tempo: ${chordsheet.metadata.tempo}`);
            }
            if (chordsheet.metadata.capo) {
                metadata.push(`Capo: ${chordsheet.metadata.capo}`);
            }
            if (chordsheet.metadata.ccli) {
                metadata.push(`CCLI: ${chordsheet.metadata.ccli}`);
            }
        }

        return metadata.length > 0 ? metadata.join('\n') + '\n\n' : '';
    }

    /**
     * Render OnSong section titles
     */
    protected renderSectionTitle(section: Section, options?: RenderingOptions): string {
        if (!section.title) {
            return '';
        }

        // OnSong uses simple section labels
        return `${section.title}:\n`;
    }

    /**
     * OnSong-specific validation
     */
    public canRender(chordsheet: Chordsheet): boolean {
        if (!super.canRender(chordsheet)) {
            return false;
        }

        // OnSong can render most content
        return true;
    }

    /**
     * Escape special characters for OnSong format
     */
    protected escapeSpecialCharacters(text: string): string {
        // OnSong has minimal special character requirements
        return text;
    }
}