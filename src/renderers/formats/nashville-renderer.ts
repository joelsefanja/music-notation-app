import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { BaseRenderer } from '../core/base-renderer';
import { NotationFormat, RenderingOptions, WhitespaceRules } from '../core/renderer.interface';

/**
 * Nashville Number System format renderer
 * Renders chordsheets in Nashville Number System format with inline number notation
 */
export class NashvilleRenderer extends BaseRenderer {
    public readonly format = NotationFormat.NASHVILLE;

    /**
     * Get Nashville-specific whitespace rules
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
     * Render Nashville-specific metadata
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

        // Add Nashville-specific metadata
        if (chordsheet.metadata) {
            if (chordsheet.metadata.tempo) {
                metadata.push(`Tempo: ${chordsheet.metadata.tempo}`);
            }
            if (chordsheet.metadata.timeSignature) {
                metadata.push(`Time: ${chordsheet.metadata.timeSignature}`);
            }
            if (chordsheet.metadata.capo) {
                metadata.push(`Capo: ${chordsheet.metadata.capo}`);
            }
        }

        return metadata.length > 0 ? metadata.join('\n') + '\n\n' : '';
    }

    /**
     * Render Nashville section titles
     */
    protected renderSectionTitle(section: Section, options?: RenderingOptions): string {
        if (!section.title) {
            return '';
        }

        // Nashville format uses simple section labels
        return `${section.title}:\n`;
    }

    /**
     * Nashville-specific validation
     */
    public canRender(chordsheet: Chordsheet): boolean {
        if (!super.canRender(chordsheet)) {
            return false;
        }

        // Nashville format requires a key to be meaningful
        if (!chordsheet.originalKey) {
            return false;
        }

        return true;
    }

    /**
     * Escape special characters for Nashville format
     */
    protected escapeSpecialCharacters(text: string): string {
        // Nashville format has minimal special character requirements
        return text;
    }
}
