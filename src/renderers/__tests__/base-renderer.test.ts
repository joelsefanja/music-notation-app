import { BaseRenderer } from '../core/base-renderer';
import { NotationFormat, RenderingOptions, WhitespaceRules } from '../core/renderer.interface';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { TextLine, EmptyLine, AnnotationLine } from '../../types/line';
import { ChordPlacement } from '../../types/chord';

// Test implementation of BaseRenderer
class TestRenderer extends BaseRenderer {
    public readonly format = NotationFormat.CHORDPRO;

    public getDefaultWhitespaceRules(): WhitespaceRules {
        return {
            emptyLinesAfterComments: 0,
            emptyLinesAfterSections: 1,
            emptyLinesBetweenSections: 1,
            preserveConsecutiveEmptyLines: true
        };
    }
}

describe('BaseRenderer', () => {
    let renderer: TestRenderer;
    let mockChordsheet: Chordsheet;

    beforeEach(() => {
        renderer = new TestRenderer();
        
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

        const emptyLine: EmptyLine = {
            type: 'empty',
            count: 2
        };

        const annotationLine: AnnotationLine = {
            type: 'annotation',
            value: 'Slowly',
            annotationType: 'instruction'
        };

        const section: Section = {
            type: 'verse',
            title: 'Verse 1',
            lines: [textLine, emptyLine, annotationLine]
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

    describe('render', () => {
        it('should render complete chordsheet with metadata', () => {
            const options: RenderingOptions = {
                includeMetadata: true,
                preserveOriginalText: false,
                chordPlacement: 'auto'
            };

            const result = renderer.render(mockChordsheet, options);

            expect(result.content).toContain('title: Amazing Grace');
            expect(result.content).toContain('artist: John Newton');
            expect(result.content).toContain('key: C');
            expect(result.content).toContain('[Verse 1]');
            expect(result.content).toContain('[C]Amazing [F]grace how sweet the sound');
            expect(result.format).toBe(NotationFormat.CHORDPRO);
            expect(result.metadata?.sectionsRendered).toBe(1);
            expect(result.metadata?.linesRendered).toBe(3);
            expect(result.metadata?.chordsRendered).toBe(2);
        });

        it('should render without metadata when option is disabled', () => {
            const options: RenderingOptions = {
                includeMetadata: false
            };

            const result = renderer.render(mockChordsheet, options);

            expect(result.content).not.toContain('title: Amazing Grace');
            expect(result.content).toContain('[Verse 1]');
        });

        it('should handle multiple sections with spacing', () => {
            const section2: Section = {
                type: 'chorus',
                title: 'Chorus',
                lines: [
                    {
                        type: 'text',
                        text: 'How sweet the sound',
                        chords: []
                    }
                ]
            };

            mockChordsheet.sections.push(section2);

            const result = renderer.render(mockChordsheet);

            expect(result.content).toContain('[Verse 1]');
            expect(result.content).toContain('[Chorus]');
            expect(result.metadata?.sectionsRendered).toBe(2);
        });

        it('should throw error if chordsheet cannot be rendered', () => {
            const invalidChordsheet = {
                ...mockChordsheet,
                sections: null as any
            };

            expect(() => renderer.render(invalidChordsheet)).toThrow('Cannot render chordsheet in chordpro format');
        });

        it('should include rendering time in metadata', () => {
            const result = renderer.render(mockChordsheet);
            
            expect(result.metadata?.renderingTime).toBeDefined();
            expect(typeof result.metadata?.renderingTime).toBe('number');
            expect(result.metadata!.renderingTime!).toBeGreaterThan(0);
        });
    });

    describe('renderSection', () => {
        it('should render section with title and lines', () => {
            const section: Section = {
                type: 'verse',
                title: 'Verse 1',
                lines: [
                    {
                        type: 'text',
                        text: 'Test line',
                        chords: []
                    }
                ]
            };

            const result = renderer.renderSection(section);

            expect(result).toContain('[Verse 1]');
            expect(result).toContain('Test line');
        });

        it('should render section without title', () => {
            const section: Section = {
                type: 'verse',
                lines: [
                    {
                        type: 'text',
                        text: 'Test line',
                        chords: []
                    }
                ]
            };

            const result = renderer.renderSection(section);

            expect(result).not.toContain('[');
            expect(result).toContain('Test line');
        });
    });

    describe('renderLine', () => {
        it('should delegate to line renderer', () => {
            const line: TextLine = {
                type: 'text',
                text: 'Test line',
                chords: []
            };

            const result = renderer.renderLine(line);

            expect(result).toBe('Test line\n');
        });
    });

    describe('canRender', () => {
        it('should return true for valid chordsheet', () => {
            expect(renderer.canRender(mockChordsheet)).toBe(true);
        });

        it('should return false for null chordsheet', () => {
            expect(renderer.canRender(null as any)).toBe(false);
        });

        it('should return false for chordsheet without sections', () => {
            const invalidChordsheet = {
                ...mockChordsheet,
                sections: null as any
            };

            expect(renderer.canRender(invalidChordsheet)).toBe(false);
        });

        it('should return false for chordsheet with invalid sections', () => {
            const invalidChordsheet = {
                ...mockChordsheet,
                sections: [
                    {
                        type: 'verse',
                        lines: null as any
                    }
                ]
            };

            expect(renderer.canRender(invalidChordsheet)).toBe(false);
        });
    });

    describe('mergeOptions', () => {
        it('should use defaults when no options provided', () => {
            const result = renderer['mergeOptions']();

            expect(result.preserveOriginalText).toBe(false);
            expect(result.chordPlacement).toBe('auto');
            expect(result.includeMetadata).toBe(true);
            expect(result.whitespaceRules).toBeDefined();
        });

        it('should merge provided options with defaults', () => {
            const options: RenderingOptions = {
                preserveOriginalText: true,
                chordPlacement: 'above'
            };

            const result = renderer['mergeOptions'](options);

            expect(result.preserveOriginalText).toBe(true);
            expect(result.chordPlacement).toBe('above');
            expect(result.includeMetadata).toBe(true); // Default value
        });

        it('should merge whitespace rules', () => {
            const options: RenderingOptions = {
                whitespaceRules: {
                    emptyLinesAfterComments: 5
                }
            };

            const result = renderer['mergeOptions'](options);

            expect(result.whitespaceRules?.emptyLinesAfterComments).toBe(5);
            expect(result.whitespaceRules?.emptyLinesAfterSections).toBe(1); // Default value
        });
    });
});