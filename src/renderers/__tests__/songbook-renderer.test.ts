import { SongbookRenderer } from '../formats/songbook-renderer';
import { NotationFormat } from '../core/renderer.interface';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { TextLine, AnnotationLine } from '../../types/line';
import { beforeEach, describe, it } from 'node:test';
import { expect } from '@playwright/test';

describe('SongbookRenderer', () => {
    let renderer: SongbookRenderer;
    let mockChordsheet: Chordsheet;

    beforeEach(() => {
        renderer = new SongbookRenderer();

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
            sections: [section]
        };
    });

    describe('format property', () => {
        it('should have correct format', () => {
            expect(renderer.format).toBe(NotationFormat.SONGBOOK);
        });
    });

    describe('getDefaultWhitespaceRules', () => {
        it('should return Songbook-specific whitespace rules', () => {
            const rules = renderer.getDefaultWhitespaceRules();

            expect(rules.emptyLinesAfterComments).toBe(3);
            expect(rules.emptyLinesAfterSections).toBe(2);
            expect(rules.emptyLinesBetweenSections).toBe(2);
            expect(rules.preserveConsecutiveEmptyLines).toBe(false);
        });
    });

    describe('renderMetadata', () => {
        it('should render Songbook-style metadata', () => {
            const result = renderer.render(mockChordsheet, { includeMetadata: true });

            expect(result.content).toContain('AMAZING GRACE'); // Title in uppercase
            expect(result.content).toContain('by John Newton');
            expect(result.content).toContain('Key: C');
        });

        it('should handle metadata with tempo and capo', () => {
            mockChordsheet.metadata = {
                tempo: '120',
                capo: '2'
            };

            const result = renderer.render(mockChordsheet, { includeMetadata: true });

            expect(result.content).toContain('Tempo: 120');
            expect(result.content).toContain('Capo: 2');
        });
    });

    describe('renderSectionTitle', () => {
        it('should render verse section title', () => {
            const section: Section = {
                type: 'verse',
                title: 'verse 1',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('Verse 1'); // Capitalized
        });

        it('should render chorus section title', () => {
            const section: Section = {
                type: 'chorus',
                title: 'Chorus',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('CHORUS'); // Uppercase
        });

        it('should render bridge section title', () => {
            const section: Section = {
                type: 'bridge',
                title: 'Bridge',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('BRIDGE'); // Uppercase
        });

        it('should render pre-chorus section title', () => {
            const section: Section = {
                type: 'pre-chorus',
                title: 'Pre-Chorus',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('PRE-CHORUS'); // Uppercase
        });

        it('should render other section types in uppercase', () => {
            const section: Section = {
                type: 'intro',
                title: 'Intro',
                lines: []
            };

            const result = renderer.renderSection(section);
            expect(result).toContain('INTRO'); // Uppercase
        });
    });

    describe('canRender', () => {
        it('should return true for chordsheet with chords', () => {
            expect(renderer.canRender(mockChordsheet)).toBe(true);
        });

        it('should return false for chordsheet without chords', () => {
            const chordsheetWithoutChords = {
                ...mockChordsheet,
                sections: [
                    {
                        type: 'verse' as const,
                        title: 'Verse 1',
                        lines: [
                            {
                                type: 'text' as const,
                                text: 'Amazing grace',
                                chords: []
                            }
                        ]
                    }
                ]
            };

            expect(renderer.canRender(chordsheetWithoutChords)).toBe(false);
        });

        it('should return false for invalid chordsheet', () => {
            const invalidChordsheet = {
                ...mockChordsheet,
                sections: null as any
            };

            expect(renderer.canRender(invalidChordsheet)).toBe(false);
        });
    });

    describe('chord placement', () => {
        it('should render chords above text by default', () => {
            const result = renderer.render(mockChordsheet);

            // Should contain chord line above text line
            expect(result.content).toContain('C       F\nAmazing grace how sweet the sound');
        });

        it('should handle complex chord positioning', () => {
            const textLine: TextLine = {
                type: 'text',
                text: 'Amazing grace how sweet the sound that saved',
                chords: [
                    {
                        value: 'C',
                        originalText: '[C]',
                        startIndex: 0,
                        endIndex: 0
                    },
                    {
                        value: 'Am',
                        originalText: '[Am]',
                        startIndex: 14,
                        endIndex: 14
                    },
                    {
                        value: 'F',
                        originalText: '[F]',
                        startIndex: 33,
                        endIndex: 33
                    }
                ]
            };

            const section: Section = {
                type: 'verse',
                title: 'Verse 1',
                lines: [textLine]
            };

            const chordsheet = {
                ...mockChordsheet,
                sections: [section]
            };

            const result = renderer.render(chordsheet);

            // Check that chords are positioned correctly above text
            expect(result.content).toContain('C             Am');
            expect(result.content).toContain('Amazing grace how sweet the sound that saved');
        });
    });

    describe('annotation handling', () => {
        it('should render comments with three empty lines after', () => {
            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: 'Play slowly',
                annotationType: 'comment'
            };

            mockChordsheet.sections[0].lines.push(annotationLine);

            const result = renderer.render(mockChordsheet);

            expect(result.content).toContain('(Play slowly)\n\n\n\n'); // Comment with 3 extra empty lines
        });
    });

    describe('section spacing', () => {
        it('should use correct spacing between sections', () => {
            const section2: Section = {
                type: 'chorus',
                title: 'Chorus',
                lines: [
                    {
                        type: 'text',
                        text: 'How sweet the sound',
                        chords: [
                            {
                                value: 'G',
                                originalText: '[G]',
                                startIndex: 0,
                                endIndex: 0
                            }
                        ]
                    }
                ]
            };

            mockChordsheet.sections.push(section2);

            const result = renderer.render(mockChordsheet);

            // Should have 2 empty lines between sections (default for songbook)
            expect(result.content).toMatch(/Verse 1\n.*\n\n.*CHORUS/s);
        });
    });

    describe('full rendering', () => {
        it('should render complete Songbook document', () => {
            const result = renderer.render(mockChordsheet);

            expect(result.content).toContain('AMAZING GRACE');
            expect(result.content).toContain('by John Newton');
            expect(result.content).toContain('Verse 1');
            expect(result.content).toContain('C       F');
            expect(result.content).toContain('Amazing grace how sweet the sound');
            expect(result.format).toBe(NotationFormat.SONGBOOK);
        });
    });
});