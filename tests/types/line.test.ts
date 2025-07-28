import {
    Line,
    TextLine,
    EmptyLine,
    AnnotationLine,
    isTextLine,
    isEmptyLine,
    isAnnotationLine,
    validateLine
} from '../../src/types/line';
import { ChordPlacement } from '../../src/types/chord';

describe('Line Types', () => {
    describe('TextLine', () => {
        it('should create a valid TextLine', () => {
            const chords: ChordPlacement[] = [
                {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 3
                }
            ];

            const textLine: TextLine = {
                type: 'text',
                text: 'Amazing grace',
                chords,
                lineNumber: 1
            };

            expect(textLine.type).toBe('text');
            expect(textLine.text).toBe('Amazing grace');
            expect(textLine.chords).toEqual(chords);
            expect(textLine.lineNumber).toBe(1);
        });

        it('should create TextLine without optional lineNumber', () => {
            const textLine: TextLine = {
                type: 'text',
                text: 'Amazing grace',
                chords: []
            };

            expect(textLine.type).toBe('text');
            expect(textLine.text).toBe('Amazing grace');
            expect(textLine.chords).toEqual([]);
            expect(textLine.lineNumber).toBeUndefined();
        });

        it('should create TextLine with multiple chords', () => {
            const chords: ChordPlacement[] = [
                {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 3
                },
                {
                    value: 'F',
                    originalText: '[F]',
                    startIndex: 8,
                    endIndex: 11
                }
            ];

            const textLine: TextLine = {
                type: 'text',
                text: 'Amazing grace how sweet',
                chords
            };

            expect(textLine.chords).toHaveLength(2);
            expect(textLine.chords[0].value).toBe('C');
            expect(textLine.chords[1].value).toBe('F');
        });
    });

    describe('EmptyLine', () => {
        it('should create a valid EmptyLine with default count', () => {
            const emptyLine: EmptyLine = {
                type: 'empty'
            };

            expect(emptyLine.type).toBe('empty');
            expect(emptyLine.count).toBeUndefined();
            expect(emptyLine.lineNumber).toBeUndefined();
        });

        it('should create EmptyLine with specific count', () => {
            const emptyLine: EmptyLine = {
                type: 'empty',
                count: 3,
                lineNumber: 5
            };

            expect(emptyLine.type).toBe('empty');
            expect(emptyLine.count).toBe(3);
            expect(emptyLine.lineNumber).toBe(5);
        });

        it('should create EmptyLine with count but no lineNumber', () => {
            const emptyLine: EmptyLine = {
                type: 'empty',
                count: 2
            };

            expect(emptyLine.type).toBe('empty');
            expect(emptyLine.count).toBe(2);
            expect(emptyLine.lineNumber).toBeUndefined();
        });
    });

    describe('AnnotationLine', () => {
        it('should create a valid AnnotationLine with comment type', () => {
            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: 'This is a comment',
                annotationType: 'comment',
                lineNumber: 2
            };

            expect(annotationLine.type).toBe('annotation');
            expect(annotationLine.value).toBe('This is a comment');
            expect(annotationLine.annotationType).toBe('comment');
            expect(annotationLine.lineNumber).toBe(2);
        });

        it('should create AnnotationLine with instruction type', () => {
            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: 'Play slowly',
                annotationType: 'instruction'
            };

            expect(annotationLine.type).toBe('annotation');
            expect(annotationLine.value).toBe('Play slowly');
            expect(annotationLine.annotationType).toBe('instruction');
            expect(annotationLine.lineNumber).toBeUndefined();
        });

        it('should create AnnotationLine with tempo type', () => {
            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: '120 BPM',
                annotationType: 'tempo'
            };

            expect(annotationLine.annotationType).toBe('tempo');
        });

        it('should create AnnotationLine with dynamics type', () => {
            const annotationLine: AnnotationLine = {
                type: 'annotation',
                value: 'forte',
                annotationType: 'dynamics'
            };

            expect(annotationLine.annotationType).toBe('dynamics');
        });
    });

    describe('Type Guards', () => {
        const textLine: TextLine = {
            type: 'text',
            text: 'Test text',
            chords: []
        };

        const emptyLine: EmptyLine = {
            type: 'empty',
            count: 1
        };

        const annotationLine: AnnotationLine = {
            type: 'annotation',
            value: 'Test annotation',
            annotationType: 'comment'
        };

        describe('isTextLine', () => {
            it('should return true for TextLine', () => {
                expect(isTextLine(textLine)).toBe(true);
            });

            it('should return false for EmptyLine', () => {
                expect(isTextLine(emptyLine)).toBe(false);
            });

            it('should return false for AnnotationLine', () => {
                expect(isTextLine(annotationLine)).toBe(false);
            });
        });

        describe('isEmptyLine', () => {
            it('should return true for EmptyLine', () => {
                expect(isEmptyLine(emptyLine)).toBe(true);
            });

            it('should return false for TextLine', () => {
                expect(isEmptyLine(textLine)).toBe(false);
            });

            it('should return false for AnnotationLine', () => {
                expect(isEmptyLine(annotationLine)).toBe(false);
            });
        });

        describe('isAnnotationLine', () => {
            it('should return true for AnnotationLine', () => {
                expect(isAnnotationLine(annotationLine)).toBe(true);
            });

            it('should return false for TextLine', () => {
                expect(isAnnotationLine(textLine)).toBe(false);
            });

            it('should return false for EmptyLine', () => {
                expect(isAnnotationLine(emptyLine)).toBe(false);
            });
        });
    });

    describe('Line Validation', () => {
        describe('validateLine', () => {
            it('should validate a valid TextLine', () => {
                const line: TextLine = {
                    type: 'text',
                    text: 'Test text',
                    chords: [
                        {
                            value: 'C',
                            originalText: '[C]',
                            startIndex: 0,
                            endIndex: 3
                        }
                    ],
                    lineNumber: 1
                };

                expect(validateLine(line)).toBe(true);
            });

            it('should validate a valid EmptyLine', () => {
                const line: EmptyLine = {
                    type: 'empty',
                    count: 2,
                    lineNumber: 3
                };

                expect(validateLine(line)).toBe(true);
            });

            it('should validate a valid AnnotationLine', () => {
                const line: AnnotationLine = {
                    type: 'annotation',
                    value: 'Test annotation',
                    annotationType: 'comment',
                    lineNumber: 4
                };

                expect(validateLine(line)).toBe(true);
            });

            it('should reject null or undefined', () => {
                expect(validateLine(null)).toBe(false);
                expect(validateLine(undefined)).toBe(false);
            });

            it('should reject non-object values', () => {
                expect(validateLine('string')).toBe(false);
                expect(validateLine(123)).toBe(false);
                expect(validateLine([])).toBe(false);
            });

            it('should reject invalid type', () => {
                const invalidLine = {
                    type: 'invalid',
                    text: 'Test'
                };

                expect(validateLine(invalidLine)).toBe(false);
            });

            it('should reject TextLine with missing text', () => {
                const invalidLine = {
                    type: 'text',
                    chords: []
                };

                expect(validateLine(invalidLine)).toBe(false);
            });

            it('should reject TextLine with non-array chords', () => {
                const invalidLine = {
                    type: 'text',
                    text: 'Test',
                    chords: 'not an array'
                };

                expect(validateLine(invalidLine)).toBe(false);
            });

            it('should reject EmptyLine with invalid count', () => {
                const invalidLine = {
                    type: 'empty',
                    count: -1
                };

                expect(validateLine(invalidLine)).toBe(false);
            });

            it('should reject AnnotationLine with missing value', () => {
                const invalidLine = {
                    type: 'annotation',
                    annotationType: 'comment'
                };

                expect(validateLine(invalidLine)).toBe(false);
            });

            it('should reject AnnotationLine with invalid annotationType', () => {
                const invalidLine = {
                    type: 'annotation',
                    value: 'Test',
                    annotationType: 'invalid'
                };

                expect(validateLine(invalidLine)).toBe(false);
            });

            it('should reject lines with invalid lineNumber', () => {
                const invalidLine = {
                    type: 'text',
                    text: 'Test',
                    chords: [],
                    lineNumber: 'not a number'
                };

                expect(validateLine(invalidLine)).toBe(false);
            });
        });
    });

    describe('Discriminated Union', () => {
        it('should work with discriminated union type', () => {
            const lines: Line[] = [
                {
                    type: 'text',
                    text: 'Amazing grace',
                    chords: []
                },
                {
                    type: 'empty',
                    count: 2
                },
                {
                    type: 'annotation',
                    value: 'Slowly',
                    annotationType: 'instruction'
                }
            ];

            expect(lines).toHaveLength(3);
            expect(lines[0].type).toBe('text');
            expect(lines[1].type).toBe('empty');
            expect(lines[2].type).toBe('annotation');

            // Type narrowing should work
            lines.forEach(line => {
                switch (line.type) {
                    case 'text':
                        expect(typeof line.text).toBe('string');
                        expect(Array.isArray(line.chords)).toBe(true);
                        break;
                    case 'empty':
                        expect(line.count === undefined || typeof line.count === 'number').toBe(true);
                        break;
                    case 'annotation':
                        expect(typeof line.value).toBe('string');
                        expect(['comment', 'instruction', 'tempo', 'dynamics'].includes(line.annotationType)).toBe(true);
                        break;
                }
            });
        });
    });
});