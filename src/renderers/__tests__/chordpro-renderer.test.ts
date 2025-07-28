import { ChordProRenderer } from '../formats/chordpro-renderer';
import { NotationFormat } from '../core/renderer.interface';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { TextLine, AnnotationLine } from '../../types/line';

describe('ChordProRenderer', () => {
    let renderer: ChordProRenderer;
    let mockChordsheet: Chordsheet;

    beforeEach(() => {
        renderer = new ChordProRenderer();

        const textLine: TextLine = {
            type: 'text',
            text: 'Amazing grace how sweet the sound',
            chords: [
                {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 0
                },
                {
                    value: 'F',
                    originalText: '[F]',
                    startIndex: 8,
                    endIndex: 8
                }
            ]
        };

        const section: Section = {
            type: 'verse',
            title: 'Verse 1',
            lines: [textLine]
        };

        mockChordsheet = {
            id: 'test-song',
            title: 'Amazing Grace',
            artist: 'John Newton',
            originalKey: 'C',
            sections: [section],
            metadata: {
                album: 'Test Album',
                year: '2023',
                tempo: '120',
                capo: '2'
            }
        };
    });

    describe('format property', () => {
        it('should have correct format', () => {
            expect(renderer.format).toBe(NotationFormat.CHORDPRO);
        });
    });

    describe('getDefaultWhitespaceRules', () => {
        it('should return ChordPro-specific whitespace rules', () => {
            const rules = renderer.getDefaultWhitespaceRules();

            expect(rules.emptyLinesAfterComments).toBe(0);
            expect(rules.emptyLinesAfterSections).toBe(1);
            expect(rules.emptyLinesBetweenSections).toBe(1);
            expect(rules.preserveConsecutiveEmptyLines).toBe(true);
        });
    });

    describe('renderMetadata', () => {
        it('should render ChordPro-style metadata', () => {
            const result = renderer.render(mockChordsheet, { includeMetadata: true });

            expect(result.content).toContain('{title: Amazing Grace}');
            expect(result.content).toContain('{artist: John Newton}');
            expect(result.content).toContain('{key: C}');
            expect(result.content).toContain('{album: Test Album}');
            expect(result.content).toContain('{year: 2023}');
            expect(result.content).toContain('{tempo: 120}');
            expect(result.content).toContain('{capo: 2}');
        });

        it('should not render metadata when option is disabled', () => {
            const result = renderer.render(mockChordsheet, { includeMetadata: false });

            expect(result.content).not.toContain('{title:');
            expect(result.content).not.toContain('{artist:');
        });

        it('should handle missing metadata gracefully', () => {
            const chordsheetWithoutMetadata = {
                ...mockChordsheet,
                metadata: undefined
            };

            const result = renderer.render(chordsheetWithoutMetadata, { includeMetadata: true });

            expect(result.content).toContain('{title: Amazing Grace}');
            expect(result.content).toContain('{artist: John Newton}');
            expect(result.content).toContain('{key: C}');
            expect(result.content).not.toContain('{album:');
        });
    });

    describe('renderSectionTitle', () => {
        it('should render verse section with directive', () => {
            const section: Section = {
                type: 'verse',
                title: 'Verse 1',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('{verse: Verse 1}');
        });

        it('should render chorus section with directive', () => {
            const section: Section = {
                type: 'chorus',
                title: 'Chorus',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('{chorus: Chorus}');
        });

        it('should render bridge section with directive', () => {
            const section: Section = {
                type: 'bridge',
                title: 'Bridge',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('{bridge: Bridge}');
        });

        it('should render pre-chorus section with prechorus directive', () => {
            const section: Section = {
                type: 'pre-chorus',
                title: 'Pre-Chorus',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('{prechorus: Pre-Chorus}');
        });

        it('should render unknown section types as comments', () => {
            const section: Section = {
                type: 'intro',
                title: 'Intro',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('{comment: Intro}');
        });

        it('should not render section title when not provided', () => {
            const section: Section = {
                type: 'verse',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).not.toContain('{verse:');
            expect(result).not.toContain('{comment:');
        });
    });

    describe('escapeSpecialCharacters', () => {
        it('should escape ChordPro special characters', () => {
            const text = 'Text with {braces} and [brackets]';
            const escaped = renderer['escapeSpecialCharacters'](text);

            expect(escaped).toBe('Text with \\{braces\\} and \\[brackets\\]');
        });
    });

    describe('canRender', () => {
        it('should return true for valid chordsheet', () => {
            expect(renderer.canRender(mockChordsheet)).toBe(true);
        });

        it('should return false for invalid chordsheet', () => {
            const invalidChordsheet = {
                ...mockChordsheet,
                sections: null as any
            };

            expect(renderer.canRender(invalidChordsheet)).toBe(false);
        });
    });

    describe('full rendering', () => {
        it('should render complete ChordPro document', () => {
            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: 'Slowly',
                annotationType: 'instruction'
            };

            mockChordsheet.sections[0].lines.push(annotationLine);

            const result = renderer.render(mockChordsheet);

            expect(result.content).toContain('{title: Amazing Grace}');
            expect(result.content).toContain('{verse: Verse 1}');
            expect(result.content).toContain('[C]Amazing [F]grace how sweet the sound');
            expect(result.content).toContain('{Slowly}');
            expect(result.format).toBe(NotationFormat.CHORDPRO);
        });

        it('should preserve original text when requested', () => {
            mockChordsheet.sections[0].lines[0].chords[0].originalText = '[Cmaj7]';

            const result = renderer.render(mockChordsheet, { preserveOriginalText: true });

            expect(result.content).toContain('[Cmaj7]Amazing');
        });
    });
});