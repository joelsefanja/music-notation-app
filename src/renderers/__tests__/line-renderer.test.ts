import { LineRenderer } from '../core/line-renderer';
import { NotationFormat, RenderingOptions } from '../core/renderer.interface';
import { TextLine, EmptyLine, AnnotationLine } from '../../types/line';
import { ChordPlacement } from '../../types/chord';

describe('LineRenderer', () => {
    let renderer: LineRenderer;
    let options: RenderingOptions;

    beforeEach(() => {
        renderer = new LineRenderer(NotationFormat.CHORDPRO);
        options = {
            preserveOriginalText: false,
            chordPlacement: 'auto',
            includeMetadata: true
        };
    });

    describe('renderTextLine', () => {
        it('should render text line without chords', () => {
            const line: TextLine = {
                type: 'text',
                text: 'Amazing grace how sweet the sound',
                chords: []
            };

            const result = renderer.renderTextLine(line, options);
            expect(result).toBe('Amazing grace how sweet the sound\n');
        });

        it('should render text line with inline chords for ChordPro format', () => {
            const chords: ChordPlacement[] = [
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
            ];

            const line: TextLine = {
                type: 'text',
                text: 'Amazing grace how sweet the sound',
                chords
            };

            const result = renderer.renderTextLine(line, options);
            expect(result).toBe('[C]Amazing [F]grace how sweet the sound\n');
        });

        it('should render text line with chords above for Songbook format', () => {
            renderer = new LineRenderer(NotationFormat.SONGBOOK);
            
            const chords: ChordPlacement[] = [
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
            ];

            const line: TextLine = {
                type: 'text',
                text: 'Amazing grace how sweet the sound',
                chords
            };

            const result = renderer.renderTextLine(line, options);
            expect(result).toBe('C       F\nAmazing grace how sweet the sound\n');
        });

        it('should preserve original text when option is enabled', () => {
            const chords: ChordPlacement[] = [
                {
                    value: 'C',
                    originalText: '[Cmaj]',
                    startIndex: 0,
                    endIndex: 0
                }
            ];

            const line: TextLine = {
                type: 'text',
                text: 'Amazing grace',
                chords
            };

            const preserveOptions = { ...options, preserveOriginalText: true };
            const result = renderer.renderTextLine(line, preserveOptions);
            expect(result).toBe('[Cmaj]Amazing grace\n');
        });

        it('should handle chord placement override', () => {
            const chords: ChordPlacement[] = [
                {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 0
                }
            ];

            const line: TextLine = {
                type: 'text',
                text: 'Amazing grace',
                chords
            };

            const aboveOptions = { ...options, chordPlacement: 'above' as const };
            const result = renderer.renderTextLine(line, aboveOptions);
            expect(result).toBe('C\nAmazing grace\n');
        });
    });

    describe('renderEmptyLine', () => {
        it('should render single empty line', () => {
            const line: EmptyLine = {
                type: 'empty'
            };

            const result = renderer.renderEmptyLine(line, options);
            expect(result).toBe('\n');
        });

        it('should render multiple empty lines', () => {
            const line: EmptyLine = {
                type: 'empty',
                count: 3
            };

            const result = renderer.renderEmptyLine(line, options);
            expect(result).toBe('\n\n\n');
        });
    });

    describe('renderAnnotationLine', () => {
        it('should render ChordPro comment annotation', () => {
            const line: AnnotationLine = {
                type: 'annotation',
                value: 'This is a comment',
                annotationType: 'comment'
            };

            const result = renderer.renderAnnotationLine(line, options);
            expect(result).toBe('{comment: This is a comment}\n');
        });

        it('should render ChordPro instruction annotation', () => {
            const line: AnnotationLine = {
                type: 'annotation',
                value: 'Slowly',
                annotationType: 'instruction'
            };

            const result = renderer.renderAnnotationLine(line, options);
            expect(result).toBe('{Slowly}\n');
        });

        it('should render OnSong comment annotation', () => {
            renderer = new LineRenderer(NotationFormat.ONSONG);
            
            const line: AnnotationLine = {
                type: 'annotation',
                value: 'This is a comment',
                annotationType: 'comment'
            };

            const result = renderer.renderAnnotationLine(line, options);
            expect(result).toBe('*This is a comment\n');
        });

        it('should render Songbook comment with spacing', () => {
            renderer = new LineRenderer(NotationFormat.SONGBOOK);
            
            const line: AnnotationLine = {
                type: 'annotation',
                value: 'This is a comment',
                annotationType: 'comment'
            };

            const result = renderer.renderAnnotationLine(line, options);
            expect(result).toBe('(This is a comment)\n\n\n\n'); // 3 extra empty lines
        });

        it('should render Guitar Tabs comment annotation', () => {
            renderer = new LineRenderer(NotationFormat.GUITAR_TABS);
            
            const line: AnnotationLine = {
                type: 'annotation',
                value: 'This is a comment',
                annotationType: 'comment'
            };

            const result = renderer.renderAnnotationLine(line, options);
            expect(result).toBe('// This is a comment\n\n');
        });

        it('should render Nashville comment annotation', () => {
            renderer = new LineRenderer(NotationFormat.NASHVILLE);
            
            const line: AnnotationLine = {
                type: 'annotation',
                value: 'This is a comment',
                annotationType: 'comment'
            };

            const result = renderer.renderAnnotationLine(line, options);
            expect(result).toBe('(This is a comment)\n');
        });
    });

    describe('renderLine', () => {
        it('should route to correct renderer based on line type', () => {
            const textLine: TextLine = {
                type: 'text',
                text: 'Test text',
                chords: []
            };

            const emptyLine: EmptyLine = {
                type: 'empty'
            };

            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: 'Test comment',
                annotationType: 'comment'
            };

            expect(renderer.renderLine(textLine, options)).toBe('Test text\n');
            expect(renderer.renderLine(emptyLine, options)).toBe('\n');
            expect(renderer.renderLine(annotationLine, options)).toBe('{comment: Test comment}\n');
        });

        it('should throw error for unknown line type', () => {
            const invalidLine = { type: 'unknown' } as any;
            
            expect(() => renderer.renderLine(invalidLine, options)).toThrow('Unknown line type: unknown');
        });
    });
});