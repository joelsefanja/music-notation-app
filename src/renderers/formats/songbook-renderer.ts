import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { BaseRenderer } from '../core/base-renderer';
import { NotationFormat, RenderingOptions, WhitespaceRules } from '../core/renderer.interface';

/**
 * Songbook format renderer
 * Renders chordsheets in traditional songbook format with chords above lyrics
 */
export class SongbookRenderer extends BaseRenderer {
    public readonly format = NotationFormat.SONGBOOK;

    /**
     * Get Songbook-specific whitespace rules
     */
    public getDefaultWhitespaceRules(): WhitespaceRules {
        return {
            emptyLinesAfterComments: 3, // Three empty lines after Songbook comments
            emptyLinesAfterSections: 2,
            emptyLinesBetweenSections: 2,
            preserveConsecutiveEmptyLines: false
        };
    }

    /**
     * Render Songbook-specific metadata
     */
    protected renderMetadata(chordsheet: Chordsheet, options?: RenderingOptions): string {
        if (!options?.includeMetadata) {
            return '';
        }

        const metadata: string[] = [];
        
        // Songbook format typically has title and artist prominently displayed
        if (chordsheet.title) {
            metadata.push(chordsheet.title.toUpperCase());
        }
        
        if (chordsheet.artist) {
            metadata.push(`by ${chordsheet.artist}`);
        }
        
        if (chordsheet.originalKey) {
            metadata.push(`Key: ${chordsheet.originalKey}`);
        }

        // Add additional metadata in a simple format
        if (chordsheet.metadata) {
            if (chordsheet.metadata.tempo) {
                metadata.push(`Tempo: ${chordsheet.metadata.tempo}`);
            }
            if (chordsheet.metadata.capo) {
                metadata.push(`Capo: ${chordsheet.metadata.capo}`);
            }
        }

        return metadata.length > 0 ? metadata.join('\n') + '\n\n' : '';
    }

    /**
     * Render Songbook section titles
     */
    protected renderSectionTitle(section: Section, options?: RenderingOptions): string {
        if (!section.title) {
            return '';
        }

        // Songbook format uses simple, clear section labels
        const formattedTitle = this.formatSectionTitle(section.type, section.title);
        return `${formattedTitle}\n`;
    }

    /**
     * Format section title for songbook display
     */
    private formatSectionTitle(sectionType: string, title: string): string {
        // Capitalize section titles for traditional songbook appearance
        switch (sectionType) {
            case 'verse':
                return title.charAt(0).toUpperCase() + title.slice(1);
            case 'chorus':
                return 'CHORUS';
            case 'bridge':
                return 'BRIDGE';
            case 'pre-chorus':
                return 'PRE-CHORUS';
            case 'intro':
                return 'INTRO';
            case 'outro':
                return 'OUTRO';
            case 'instrumental':
                return 'INSTRUMENTAL';
            case 'solo':
                return 'SOLO';
            case 'coda':
                return 'CODA';
            case 'tag':
                return 'TAG';
            default:
                return title.toUpperCase();
        }
    }

    /**
     * Songbook-specific validation
     */
    public canRender(chordsheet: Chordsheet): boolean {
        if (!super.canRender(chordsheet)) {
            return false;
        }

        if (!chordsheet.sections) {
            return false;
        }

        for (const section of chordsheet.sections) {
            if (!section.lines) {
                continue;
            }
            for (const line of section.lines) {
                if (line.type === 'text' && line.chords && line.chords.length > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Escape special characters for Songbook format
     */
    protected escapeSpecialCharacters(text: string): string {
        // Songbook format has minimal special character requirements
        // Just ensure parentheses don't conflict with comments
        return text;
    }

    /**
     * Override section spacing for songbook format
     */
    protected getSectionSpacing(options: RenderingOptions): number {
        return options.whitespaceRules?.emptyLinesBetweenSections ?? 2;
    }
}
