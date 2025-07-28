import {
    ValidationResult,
    ValidationError,
    ValidationWarning,
    validateChordsheet,
    validateSection,
    validateMetadata,
    validateLines,
    createTextLine,
    createEmptyLine,
    createAnnotationLine,
    createChordPlacement
} from '../../src/types/validation';
import { Chordsheet } from '../../src/types/chordsheet';
import { Section } from '../../src/types/section';
import { Metadata } from '../../src/types/metadata';
import { TextLine, EmptyLine, AnnotationLine } from '../../src/types/line';
import { ChordPlacement } from '../../src/types/chord';

describe('Validation Utilities', () => {
    describe('validateChordsheet', () => {
        it('should validate a valid chordsheet', () => {
            const chordsheet: Chordsheet = {
                id: 'test-id',
                title: 'Amazing Grace',
                artist: 'Traditional',
                originalKey: 'C',
                sections: [
                    {
                        type: 'verse',
                        title: 'Verse 1',
                        lines: [
                            {
                                type: 'text',
                                text: 'Amazing grace',
                                chords: []
                            }
                        ]
                    }
                ]
            };

            const result = validateChordsheet(chordsheet);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject null or undefined chordsheet', () => {
            const result = validateChordsheet(null);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('chordsheet');
        });

        it('should reject chordsheet with missing required fields', () => {
            const invalidChordsheet = {
                title: 'Test Song',
                // missing id and originalKey
                sections: []
            };

            const result = validateChordsheet(invalidChordsheet);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(e => e.field === 'id')).toBe(true);
            expect(result.errors.some(e => e.field === 'originalKey')).toBe(true);
        });

        it('should reject chordsheet with invalid sections', () => {
            const invalidChordsheet = {
                id: 'test-id',
                title: 'Test Song',
                originalKey: 'C',
                sections: 'not an array'
            };

            const result = validateChordsheet(invalidChordsheet);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'sections')).toBe(true);
        });

        it('should validate chordsheet with metadata', () => {
            const chordsheet: Chordsheet = {
                id: 'test-id',
                title: 'Test Song',
                originalKey: 'C',
                sections: [],
                metadata: {
                    tempo: 120,
                    timeSignature: '4/4'
                }
            };

            const result = validateChordsheet(chordsheet);
            expect(result.valid).toBe(true);
        });

        it('should reject chordsheet with invalid metadata', () => {
            const invalidChordsheet = {
                id: 'test-id',
                title: 'Test Song',
                originalKey: 'C',
                sections: [],
                metadata: {
                    tempo: 'not a number'
                }
            };

            const result = validateChordsheet(invalidChordsheet);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field.includes('metadata.tempo'))).toBe(true);
        });
    });

    describe('validateSection', () => {
        it('should validate a valid section', () => {
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

            const result = validateSection(section);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject section with invalid type', () => {
            const invalidSection = {
                type: 'invalid-type',
                lines: []
            };

            const result = validateSection(invalidSection);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'type')).toBe(true);
        });

        it('should reject section with invalid lines', () => {
            const invalidSection = {
                type: 'verse',
                lines: 'not an array'
            };

            const result = validateSection(invalidSection);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'lines')).toBe(true);
        });

        it('should validate all valid section types', () => {
            const validTypes = [
                'verse', 'chorus', 'bridge', 'pre-chorus', 'intro', 'outro',
                'instrumental', 'solo', 'coda', 'tag', 'note', 'unknown'
            ];

            validTypes.forEach(type => {
                const section = {
                    type,
                    lines: []
                };

                const result = validateSection(section);
                expect(result.valid).toBe(true);
            });
        });
    });

    describe('validateMetadata', () => {
        it('should validate valid metadata', () => {
            const metadata: Metadata = {
                title: 'Test Song',
                artist: 'Test Artist',
                key: 'C',
                tempo: 120,
                timeSignature: '4/4',
                capo: 2,
                custom: {
                    genre: 'Gospel',
                    year: '2023'
                }
            };

            const result = validateMetadata(metadata);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject null or undefined metadata', () => {
            const result = validateMetadata(null);
            expect(result.valid).toBe(false);
            expect(result.errors[0].field).toBe('metadata');
        });

        it('should reject metadata with invalid field types', () => {
            const invalidMetadata = {
                title: 123, // should be string
                tempo: 'fast', // should be number
                custom: [] // should be object
            };

            const result = validateMetadata(invalidMetadata);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'title')).toBe(true);
            expect(result.errors.some(e => e.field === 'tempo')).toBe(true);
            expect(result.errors.some(e => e.field === 'custom')).toBe(true);
        });

        it('should reject custom metadata with non-string values', () => {
            const invalidMetadata = {
                custom: {
                    validField: 'valid string',
                    invalidField: 123
                }
            };

            const result = validateMetadata(invalidMetadata);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'custom.invalidField')).toBe(true);
        });
    });

    describe('validateLines', () => {
        it('should validate valid lines array', () => {
            const lines = [
                {
                    type: 'text',
                    text: 'Test line',
                    chords: []
                },
                {
                    type: 'empty',
                    count: 1
                },
                {
                    type: 'annotation',
                    value: 'Test annotation',
                    annotationType: 'comment'
                }
            ];

            const result = validateLines(lines);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject non-array input', () => {
            const result = validateLines('not an array' as any);
            expect(result.valid).toBe(false);
            expect(result.errors[0].field).toBe('lines');
        });

        it('should reject array with invalid lines', () => {
            const invalidLines = [
                {
                    type: 'text',
                    text: 'Valid line',
                    chords: []
                },
                {
                    type: 'invalid-type',
                    text: 'Invalid line'
                }
            ];

            const result = validateLines(invalidLines);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'lines[1]')).toBe(true);
        });
    });

    describe('Factory Functions', () => {
        describe('createTextLine', () => {
            it('should create a valid TextLine', () => {
                const chords: ChordPlacement[] = [
                    {
                        value: 'C',
                        originalText: '[C]',
                        startIndex: 0,
                        endIndex: 3
                    }
                ];

                const line = createTextLine('Amazing grace', chords, 1);
                expect(line.type).toBe('text');
                expect(line.text).toBe('Amazing grace');
                expect(line.chords).toEqual(chords);
                expect(line.lineNumber).toBe(1);
            });

            it('should create TextLine with default empty chords', () => {
                const line = createTextLine('Test text');
                expect(line.type).toBe('text');
                expect(line.text).toBe('Test text');
                expect(line.chords).toEqual([]);
                expect(line.lineNumber).toBeUndefined();
            });

            it('should throw error for invalid chords', () => {
                const invalidChords = [
                    {
                        value: 'C',
                        originalText: '[C]',
                        startIndex: 5,
                        endIndex: 3 // invalid: endIndex < startIndex
                    }
                ];

                expect(() => createTextLine('Test', invalidChords)).toThrow();
            });
        });

        describe('createEmptyLine', () => {
            it('should create a valid EmptyLine with default count', () => {
                const line = createEmptyLine();
                expect(line.type).toBe('empty');
                expect(line.count).toBe(1);
                expect(line.lineNumber).toBeUndefined();
            });

            it('should create EmptyLine with specific count and lineNumber', () => {
                const line = createEmptyLine(3, 5);
                expect(line.type).toBe('empty');
                expect(line.count).toBe(3);
                expect(line.lineNumber).toBe(5);
            });

            it('should throw error for invalid count', () => {
                expect(() => createEmptyLine(0)).toThrow();
                expect(() => createEmptyLine(-1)).toThrow();
            });
        });

        describe('createAnnotationLine', () => {
            it('should create a valid AnnotationLine with default type', () => {
                const line = createAnnotationLine('Test annotation');
                expect(line.type).toBe('annotation');
                expect(line.value).toBe('Test annotation');
                expect(line.annotationType).toBe('comment');
                expect(line.lineNumber).toBeUndefined();
            });

            it('should create AnnotationLine with specific type and lineNumber', () => {
                const line = createAnnotationLine('Play slowly', 'instruction', 3);
                expect(line.type).toBe('annotation');
                expect(line.value).toBe('Play slowly');
                expect(line.annotationType).toBe('instruction');
                expect(line.lineNumber).toBe(3);
            });

            it('should throw error for empty value', () => {
                expect(() => createAnnotationLine('')).toThrow();
                expect(() => createAnnotationLine('   ')).toThrow();
            });
        });

        describe('createChordPlacement', () => {
            it('should create a valid ChordPlacement', () => {
                const placement = createChordPlacement('C', '[C]', 0, 3, 'above');
                expect(placement.value).toBe('C');
                expect(placement.originalText).toBe('[C]');
                expect(placement.startIndex).toBe(0);
                expect(placement.endIndex).toBe(3);
                expect(placement.placement).toBe('above');
            });

            it('should create ChordPlacement without optional placement', () => {
                const placement = createChordPlacement('G', 'G', 5, 6);
                expect(placement.value).toBe('G');
                expect(placement.originalText).toBe('G');
                expect(placement.startIndex).toBe(5);
                expect(placement.endIndex).toBe(6);
                expect(placement.placement).toBeUndefined();
            });

            it('should throw error for invalid indices', () => {
                expect(() => createChordPlacement('C', '[C]', -1, 3)).toThrow();
                expect(() => createChordPlacement('C', '[C]', 5, 3)).toThrow();
            });

            it('should throw error for empty values', () => {
                expect(() => createChordPlacement('', '[C]', 0, 3)).toThrow();
                expect(() => createChordPlacement('C', '', 0, 3)).toThrow();
                expect(() => createChordPlacement('   ', '[C]', 0, 3)).toThrow();
            });
        });
    });

    describe('ValidationResult interface', () => {
        it('should have correct structure', () => {
            const result: ValidationResult = {
                valid: true,
                errors: [],
                warnings: []
            };

            expect(result.valid).toBe(true);
            expect(Array.isArray(result.errors)).toBe(true);
            expect(Array.isArray(result.warnings)).toBe(true);
        });

        it('should handle errors and warnings', () => {
            const error: ValidationError = {
                field: 'test.field',
                message: 'Test error message',
                value: 'invalid value'
            };

            const warning: ValidationWarning = {
                field: 'test.field',
                message: 'Test warning message',
                value: 'warning value'
            };

            const result: ValidationResult = {
                valid: false,
                errors: [error],
                warnings: [warning]
            };

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors[0]).toEqual(error);
            expect(result.warnings[0]).toEqual(warning);
        });
    });
});