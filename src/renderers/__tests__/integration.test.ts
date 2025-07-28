import { createRenderer, getSupportedFormats, isFormatSupported } from '../index';
import { NotationFormat } from '../core/renderer.interface';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { TextLine, EmptyLine, AnnotationLine } from '../../types/line';

describe('Rendering Engine Integration Tests', () => {
    let complexChordsheet: Chordsheet;

    beforeEach(() => {
        // Create a complex chordsheet with multiple sections and line types
        const verse1: Section = {
            type: 'verse',
            title: 'Verse 1',
            lines: [
                {
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
                        },
                        {
                            value: 'G',
                            originalText: '[G]',
                            startIndex: 18,
                            endIndex: 18
                        },
                        {
                            value: 'C',
                            originalText: '[C]',
                            startIndex: 28,
                            endIndex: 28
                        }
                    ]
                } as TextLine,
                {
                    type: 'text',
                    text: 'That saved a wretch like me',
                    chords: [
                        {
                            value: 'Am',
                            originalText: '[Am]',
                            startIndex: 0,
                            endIndex: 0
                        },
                        {
                            value: 'F',
                            originalText: '[F]',
                            startIndex: 13,
                            endIndex: 13
                        },
                        {
                            value: 'G',
                            originalText: '[G]',
                            startIndex: 21,
                            endIndex: 21
                        }
                    ]
                } as TextLine,
                {
                    type: 'empty',
                    count: 2
                } as EmptyLine
            ]
        };

        const chorus: Section = {
            type: 'chorus',
            title: 'Chorus',
            lines: [
                {
                    type: 'annotation',
                    value: 'With feeling',
                    annotationType: 'instruction'
                } as AnnotationLine,
                {
                    type: 'text',
                    text: 'How sweet the sound',
                    chords: [
                        {
                            value: 'F',
                            originalText: '[F]',
                            startIndex: 0,
                            endIndex: 0
                        },
                        {
                            value: 'C',
                            originalText: '[C]',
                            startIndex: 9,
                            endIndex: 9
                        },
                        {
                            value: 'G',
                            originalText: '[G]',
                            startIndex: 13,
                            endIndex: 13
                        }
                    ]
                } as TextLine,
                {
                    type: 'empty'
                } as EmptyLine
            ]
        };

        const bridge: Section = {
            type: 'bridge',
            title: 'Bridge',
            lines: [
                {
                    type: 'annotation',
                    value: 'Instrumental break',
                    annotationType: 'comment'
                } as AnnotationLine,
                {
                    type: 'empty',
                    count: 3
                } as EmptyLine
            ]
        };

        complexChordsheet = {
            id: 'amazing-grace',
            title: 'Amazing Grace',
            artist: 'John Newton',
            originalKey: 'C',
            sections: [verse1, chorus, bridge],
            metadata: {
                album: 'Traditional Hymns',
                year: '1779',
                tempo: '80',
                capo: '0',
                ccli: '12345'
            }
        };
    });

    describe('Format Support', () => {
        it('should support all expected formats', () => {
            const formats = getSupportedFormats();

            expect(formats).toContain(NotationFormat.CHORDPRO);
            expect(formats).toContain(NotationFormat.ONSONG);
            expect(formats).toContain(NotationFormat.SONGBOOK);
            expect(formats).toContain(NotationFormat.GUITAR_TABS);
            expect(formats).toContain(NotationFormat.NASHVILLE);
        });

        it('should correctly identify supported formats', () => {
            expect(isFormatSupported(NotationFormat.CHORDPRO)).toBe(true);
            expect(isFormatSupported(NotationFormat.ONSONG)).toBe(true);
            expect(isFormatSupported(NotationFormat.SONGBOOK)).toBe(true);
            expect(isFormatSupported(NotationFormat.GUITAR_TABS)).toBe(true);
            expect(isFormatSupported(NotationFormat.NASHVILLE)).toBe(true);
            expect(isFormatSupported('unsupported' as NotationFormat)).toBe(false);
        });
    });

    describe('Cross-Format Rendering', () => {
        it('should render to ChordPro format correctly', () => {
            const renderer = createRenderer(NotationFormat.CHORDPRO);
            const result = renderer.render(complexChordsheet);

            expect(result.format).toBe(NotationFormat.CHORDPRO);
            expect(result.content).toContain('{title: Amazing Grace}');
            expect(result.content).toContain('{artist: John Newton}');
            expect(result.content).toContain('{verse: Verse 1}');
            expect(result.content).toContain('{chorus: Chorus}');
            expect(result.content).toContain('[C]Amazing [F]grace how [G]sweet the [C]sound');
            expect(result.content).toContain('{With feeling}');
            expect(result.content).toContain('{comment: Instrumental break}');
        });

        it('should render to OnSong format correctly', () => {
            const renderer = createRenderer(NotationFormat.ONSONG);
            const result = renderer.render(complexChordsheet);

            expect(result.format).toBe(NotationFormat.ONSONG);
            expect(result.content).toContain('Title: Amazing Grace');
            expect(result.content).toContain('Artist: John Newton');
            expect(result.content).toContain('Verse 1:');
            expect(result.content).toContain('Chorus:');
            expect(result.content).toContain('[C]Amazing [F]grace how [G]sweet the [C]sound');
            expect(result.content).toContain('*With feeling');
            expect(result.content).toContain('*Instrumental break');
        });

        it('should render to Songbook format correctly', () => {
            const renderer = createRenderer(NotationFormat.SONGBOOK);
            const result = renderer.render(complexChordsheet);

            expect(result.format).toBe(NotationFormat.SONGBOOK);
            expect(result.content).toContain('AMAZING GRACE');
            expect(result.content).toContain('by John Newton');
            expect(result.content).toContain('Verse 1');
            expect(result.content).toContain('CHORUS');
            // Should have chords above text
            expect(result.content).toContain('C       F         G         C');
            expect(result.content).toContain('Amazing grace how sweet the sound');
            expect(result.content).toContain('(With feeling)');
            expect(result.content).toContain('(Instrumental break)');
        });

        it('should render to Guitar Tabs format correctly', () => {
            const renderer = createRenderer(NotationFormat.GUITAR_TABS);
            const result = renderer.render(complexChordsheet);

            expect(result.format).toBe(NotationFormat.GUITAR_TABS);
            expect(result.content).toContain('// Amazing Grace');
            expect(result.content).toContain('// Artist: John Newton');
            expect(result.content).toContain('// Verse 1');
            expect(result.content).toContain('// Chorus');
            // Should have chords above text
            expect(result.content).toContain('C       F         G         C');
            expect(result.content).toContain('Amazing grace how sweet the sound');
            expect(result.content).toContain('[With feeling]');
            expect(result.content).toContain('// Instrumental break');
        });

        it('should render to Nashville format correctly', () => {
            const renderer = createRenderer(NotationFormat.NASHVILLE);
            const result = renderer.render(complexChordsheet);

            expect(result.format).toBe(NotationFormat.NASHVILLE);
            expect(result.content).toContain('Title: Amazing Grace');
            expect(result.content).toContain('Key: C');
            expect(result.content).toContain('Verse 1:');
            expect(result.content).toContain('Chorus:');
            expect(result.content).toContain('[C]Amazing [F]grace how [G]sweet the [C]sound');
            expect(result.content).toContain('[With feeling]');
            expect(result.content).toContain('(Instrumental break)');
        });
    });

    describe('Empty Line Handling', () => {
        it('should handle single empty lines correctly across formats', () => {
            const formats = [
                NotationFormat.CHORDPRO,
                NotationFormat.ONSONG,
                NotationFormat.SONGBOOK,
                NotationFormat.GUITAR_TABS,
                NotationFormat.NASHVILLE
            ];

            formats.forEach(format => {
                const renderer = createRenderer(format);
                const result = renderer.render(complexChordsheet);

                // Should contain single newlines for empty lines
                expect(result.content).toContain('\n');
            });
        });

        it('should handle multiple consecutive empty lines correctly', () => {
            const formats = [
                NotationFormat.CHORDPRO,
                NotationFormat.ONSONG,
                NotationFormat.SONGBOOK,
                NotationFormat.GUITAR_TABS,
                NotationFormat.NASHVILLE
            ];

            formats.forEach(format => {
                const renderer = createRenderer(format);
                const result = renderer.render(complexChordsheet);

                // Bridge section has 3 consecutive empty lines
                expect(result.content).toContain('\n\n\n');
            });
        });
    });

    describe('Annotation Handling', () => {
        it('should handle different annotation types across formats', () => {
            const testChordsheet: Chordsheet = {
                ...complexChordsheet,
                sections: [
                    {
                        type: 'verse',
                        title: 'Test',
                        lines: [
                            {
                                type: 'annotation',
                                value: 'Test comment',
                                annotationType: 'comment'
                            } as AnnotationLine,
                            {
                                type: 'annotation',
                                value: 'Test instruction',
                                annotationType: 'instruction'
                            } as AnnotationLine,
                            {
                                type: 'annotation',
                                value: '120 BPM',
                                annotationType: 'tempo'
                            } as AnnotationLine,
                            {
                                type: 'annotation',
                                value: 'forte',
                                annotationType: 'dynamics'
                            } as AnnotationLine,
                            {
                                type: 'text',
                                text: 'Test line',
                                chords: [
                                    {
                                        value: 'C',
                                        originalText: '[C]',
                                        startIndex: 0,
                                        endIndex: 0
                                    }
                                ]
                            } as TextLine
                        ]
                    }
                ]
            };

            // ChordPro format
            const chordproRenderer = createRenderer(NotationFormat.CHORDPRO);
            const chordproResult = chordproRenderer.render(testChordsheet);
            expect(chordproResult.content).toContain('{comment: Test comment}');
            expect(chordproResult.content).toContain('{Test instruction}');
            expect(chordproResult.content).toContain('{tempo: 120 BPM}');

            // OnSong format
            const onsongRenderer = createRenderer(NotationFormat.ONSONG);
            const onsongResult = onsongRenderer.render(testChordsheet);
            expect(onsongResult.content).toContain('*Test comment');
            expect(onsongResult.content).toContain('*Test instruction');
            expect(onsongResult.content).toContain('Tempo: 120 BPM');

            // Songbook format
            const songbookRenderer = createRenderer(NotationFormat.SONGBOOK);
            const songbookResult = songbookRenderer.render(testChordsheet);
            expect(songbookResult.content).toContain('(Test comment)');
            expect(songbookResult.content).toContain('(Test instruction)');
            expect(songbookResult.content).toContain('(120 BPM)');
        });
    });

    describe('Chord Placement', () => {
        it('should use inline placement for inline formats', () => {
            const inlineFormats = [
                NotationFormat.CHORDPRO,
                NotationFormat.ONSONG,
                NotationFormat.NASHVILLE
            ];

            inlineFormats.forEach(format => {
                const renderer = createRenderer(format);
                const result = renderer.render(complexChordsheet);

                // Should contain inline chord notation
                expect(result.content).toMatch(/\[C\]Amazing/);
            });
        });

        it('should use above placement for above formats', () => {
            const aboveFormats = [
                NotationFormat.SONGBOOK,
                NotationFormat.GUITAR_TABS
            ];

            aboveFormats.forEach(format => {
                const renderer = createRenderer(format);
                const result = renderer.render(complexChordsheet);

                // Should have chord line above text line
                expect(result.content).toMatch(/C\s+F\s+G\s+C\s*\nAmazing grace how sweet the sound/);
            });
        });
    });

    describe('Original Text Preservation', () => {
        it('should preserve original text when requested', () => {
            // Modify chord to have different original text
            if (complexChordsheet.sections[0].lines[0].type === 'text') {
                (complexChordsheet.sections[0].lines[0] as TextLine).chords[0].originalText = '[Cmaj7]';
            }

            const formats = getSupportedFormats();

            formats.forEach(format => {
                const renderer = createRenderer(format);
                const result = renderer.render(complexChordsheet, {
                    preserveOriginalText: true
                });

                if (format === NotationFormat.SONGBOOK || format === NotationFormat.GUITAR_TABS) {
                    // Above formats should clean the original text
                    expect(result.content).toContain('Cmaj7');
                } else {
                    // Inline formats should preserve brackets
                    expect(result.content).toContain('[Cmaj7]');
                }
            });
        });
    });

    describe('Performance and Metadata', () => {
        it('should provide rendering metadata for all formats', () => {
            const formats = getSupportedFormats();

            formats.forEach(format => {
                const renderer = createRenderer(format);
                const result = renderer.render(complexChordsheet);

                expect(result.metadata).toBeDefined();
                expect(result.metadata!.linesRendered).toBeGreaterThan(0);
                expect(result.metadata!.sectionsRendered).toBe(3);
                expect(result.metadata!.chordsRendered).toBeGreaterThan(0);
                expect(result.metadata!.renderingTime).toBeGreaterThan(0);
            });
        });

        it('should handle large chordsheets efficiently', () => {
            // Create a large chordsheet
            const largeSections: Section[] = [];
            for (let i = 0; i < 50; i++) {
                largeSections.push({
                    type: 'verse',
                    title: `Verse ${i + 1}`,
                    lines: [
                        {
                            type: 'text',
                            text: `Line ${i + 1} with some text`,
                            chords: [
                                {
                                    value: 'C',
                                    originalText: '[C]',
                                    startIndex: 0,
                                    endIndex: 0
                                }
                            ]
                        } as TextLine
                    ]
                });
            }

            const largeChordsheet: Chordsheet = {
                ...complexChordsheet,
                sections: largeSections
            };

            const renderer = createRenderer(NotationFormat.CHORDPRO);
            const startTime = performance.now();
            const result = renderer.render(largeChordsheet);
            const endTime = performance.now();

            expect(result.metadata!.sectionsRendered).toBe(50);
            expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
        });
    });
});
