import {
    ChordPlacement,
    Chord,
    ChordQuality,
    ChordExtension,
    validateChordPlacement,
    validateChord,
    validateChordExtension
} from '../../src/types/chord';
import { Annotation } from '../../src/types/annotation';
import { AnnotationFormat } from '../../src/types/format';
import { describe, it, expect } from 'node:test';

describe('Chord Types', () => {
    describe('ChordPlacement interface', () => {
        it('should create a valid ChordPlacement', () => {
            const placement: ChordPlacement = {
                value: 'Cmaj7',
                originalText: '[Cmaj7]',
                startIndex: 0,
                endIndex: 7,
                placement: 'above'
            };

            expect(placement.value).toBe('Cmaj7');
            expect(placement.originalText).toBe('[Cmaj7]');
            expect(placement.startIndex).toBe(0);
            expect(placement.endIndex).toBe(7);
            expect(placement.placement).toBe('above');
        });

        it('should create ChordPlacement without optional placement', () => {
            const placement: ChordPlacement = {
                value: 'G',
                originalText: 'G',
                startIndex: 5,
                endIndex: 6
            };

            expect(placement.value).toBe('G');
            expect(placement.originalText).toBe('G');
            expect(placement.startIndex).toBe(5);
            expect(placement.endIndex).toBe(6);
            expect(placement.placement).toBeUndefined();
        });

        it('should accept all valid placement values', () => {
            const placements: Array<'above' | 'inline' | 'between'> = ['above', 'inline', 'between'];
            
            placements.forEach(placement => {
                const chordPlacement: ChordPlacement = {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 3,
                    placement
                };
                expect(chordPlacement.placement).toBe(placement);
            });
        });
    });

    describe('Chord interface', () => {
        it('should create a valid Chord', () => {
            const extensions: ChordExtension[] = [
                { type: 'add', value: '7', position: 1 }
            ];

            const chord: Chord = {
                root: 'C',
                quality: ChordQuality.MAJOR,
                extensions,
                bassNote: 'E',
                originalNotation: 'Cmaj7/E',
                nashvilleNumber: '1maj7/3'
            };

            expect(chord.root).toBe('C');
            expect(chord.quality).toBe(ChordQuality.MAJOR);
            expect(chord.extensions).toEqual(extensions);
            expect(chord.bassNote).toBe('E');
            expect(chord.originalNotation).toBe('Cmaj7/E');
            expect(chord.nashvilleNumber).toBe('1maj7/3');
        });

        it('should create Chord without optional fields', () => {
            const chord: Chord = {
                root: 'F',
                quality: ChordQuality.MINOR,
                extensions: [],
                originalNotation: 'Fm'
            };

            expect(chord.root).toBe('F');
            expect(chord.quality).toBe(ChordQuality.MINOR);
            expect(chord.extensions).toEqual([]);
            expect(chord.bassNote).toBeUndefined();
            expect(chord.originalNotation).toBe('Fm');
            expect(chord.nashvilleNumber).toBeUndefined();
        });

        it('should accept all chord qualities', () => {
            const qualities = Object.values(ChordQuality);
            
            qualities.forEach(quality => {
                const chord: Chord = {
                    root: 'G',
                    quality,
                    extensions: [],
                    originalNotation: `G${quality}`
                };
                expect(chord.quality).toBe(quality);
            });
        });
    });

    describe('ChordExtension interface', () => {
        it('should create valid ChordExtension', () => {
            const extension: ChordExtension = {
                type: 'add',
                value: '9',
                position: 2
            };

            expect(extension.type).toBe('add');
            expect(extension.value).toBe('9');
            expect(extension.position).toBe(2);
        });

        it('should accept all extension types', () => {
            const types: Array<'add' | 'sus' | 'maj' | 'min' | 'dim' | 'aug'> = 
                ['add', 'sus', 'maj', 'min', 'dim', 'aug'];
            
            types.forEach(type => {
                const extension: ChordExtension = {
                    type,
                    value: '7',
                    position: 1
                };
                expect(extension.type).toBe(type);
            });
        });
    });

    describe('Validation Functions', () => {
        describe('validateChordPlacement', () => {
            it('should validate a valid ChordPlacement', () => {
                const placement: ChordPlacement = {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 3,
                    placement: 'above'
                };

                expect(validateChordPlacement(placement)).toBe(true);
            });

            it('should validate ChordPlacement without optional placement', () => {
                const placement: ChordPlacement = {
                    value: 'G',
                    originalText: 'G',
                    startIndex: 5,
                    endIndex: 6
                };

                expect(validateChordPlacement(placement)).toBe(true);
            });

            it('should reject null or undefined', () => {
                expect(validateChordPlacement(null)).toBe(false);
                expect(validateChordPlacement(undefined)).toBe(false);
            });

            it('should reject non-object values', () => {
                expect(validateChordPlacement('string')).toBe(false);
                expect(validateChordPlacement(123)).toBe(false);
            });

            it('should reject missing required fields', () => {
                const invalidPlacement = {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0
                    // missing endIndex
                };

                expect(validateChordPlacement(invalidPlacement)).toBe(false);
            });

            it('should reject invalid startIndex/endIndex', () => {
                const invalidPlacement = {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 5,
                    endIndex: 3 // endIndex < startIndex
                };

                expect(validateChordPlacement(invalidPlacement)).toBe(false);
            });

            it('should reject negative startIndex', () => {
                const invalidPlacement = {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: -1,
                    endIndex: 3
                };

                expect(validateChordPlacement(invalidPlacement)).toBe(false);
            });

            it('should reject invalid placement value', () => {
                const invalidPlacement = {
                    value: 'C',
                    originalText: '[C]',
                    startIndex: 0,
                    endIndex: 3,
                    placement: 'invalid'
                };

                expect(validateChordPlacement(invalidPlacement)).toBe(false);
            });
        });

        describe('validateChord', () => {
            it('should validate a valid Chord', () => {
                const chord: Chord = {
                    root: 'C',
                    quality: ChordQuality.MAJOR,
                    extensions: [
                        { type: 'add', value: '7', position: 1 }
                    ],
                    bassNote: 'E',
                    originalNotation: 'Cmaj7/E',
                    nashvilleNumber: '1maj7/3'
                };

                expect(validateChord(chord)).toBe(true);
            });

            it('should validate Chord without optional fields', () => {
                const chord: Chord = {
                    root: 'F',
                    quality: ChordQuality.MINOR,
                    extensions: [],
                    originalNotation: 'Fm'
                };

                expect(validateChord(chord)).toBe(true);
            });

            it('should reject null or undefined', () => {
                expect(validateChord(null)).toBe(false);
                expect(validateChord(undefined)).toBe(false);
            });

            it('should reject invalid quality', () => {
                const invalidChord = {
                    root: 'C',
                    quality: 'invalid',
                    extensions: [],
                    originalNotation: 'C'
                };

                expect(validateChord(invalidChord)).toBe(false);
            });

            it('should reject invalid extensions array', () => {
                const invalidChord = {
                    root: 'C',
                    quality: ChordQuality.MAJOR,
                    extensions: [{ type: 'invalid', value: '7', position: 1 }],
                    originalNotation: 'C'
                };

                expect(validateChord(invalidChord)).toBe(false);
            });
        });

        describe('validateChordExtension', () => {
            it('should validate a valid ChordExtension', () => {
                const extension: ChordExtension = {
                    type: 'add',
                    value: '9',
                    position: 2
                };

                expect(validateChordExtension(extension)).toBe(true);
            });

            it('should reject null or undefined', () => {
                expect(validateChordExtension(null)).toBe(false);
                expect(validateChordExtension(undefined)).toBe(false);
            });

            it('should reject invalid type', () => {
                const invalidExtension = {
                    type: 'invalid',
                    value: '7',
                    position: 1
                };

                expect(validateChordExtension(invalidExtension)).toBe(false);
            });

            it('should reject missing required fields', () => {
                const invalidExtension = {
                    type: 'add',
                    value: '7'
                    // missing position
                };

                expect(validateChordExtension(invalidExtension)).toBe(false);
            });
        });
    });

    describe('ChordQuality enum', () => {
        it('should have all expected values', () => {
            expect(ChordQuality.MAJOR).toBe('maj');
            expect(ChordQuality.MINOR).toBe('min');
            expect(ChordQuality.DIMINISHED).toBe('dim');
            expect(ChordQuality.AUGMENTED).toBe('aug');
            expect(ChordQuality.SUSPENDED).toBe('sus');
            expect(ChordQuality.DOMINANT).toBe('dom');
        });

        it('should contain exactly 6 values', () => {
            const values = Object.values(ChordQuality);
            expect(values).toHaveLength(6);
        });
    });

    // Legacy Annotation interface tests for backward compatibility
    describe('Legacy Annotation interface', () => {
        it('should accept valid annotation objects', () => {
            const annotation: Annotation = {
                text: 'Slowly',
                format: AnnotationFormat.ONSONG,
                position: 'above'
            };

            expect(annotation.text).toBe('Slowly');
            expect(annotation.format).toBe(AnnotationFormat.ONSONG);
            expect(annotation.position).toBe('above');
        });

        it('should accept all valid position values', () => {
            const positions: Array<'above' | 'inline' | 'beside'> = ['above', 'inline', 'beside'];
            
            positions.forEach(pos => {
                const annotation: Annotation = {
                    text: 'Test annotation',
                    format: AnnotationFormat.SONGBOOK,
                    position: pos
                };
                expect(annotation.position).toBe(pos);
            });
        });
    });
});