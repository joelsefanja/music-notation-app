import { Line, TextLine, EmptyLine, AnnotationLine, validateLine } from './line';
import { ChordPlacement, Chord, validateChordPlacement, validateChord } from './chord';
import { Section } from './section';
import { Chordsheet } from './chordsheet';
import { Metadata } from './metadata';

/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
    field: string;
    message: string;
    value?: any;
}

/**
 * Validates a complete chordsheet object
 */
export function validateChordsheet(chordsheet: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!chordsheet || typeof chordsheet !== 'object') {
        errors.push({
            field: 'chordsheet',
            message: 'Chordsheet must be an object',
            value: chordsheet
        });
        return { valid: false, errors, warnings };
    }

    // Validate required fields
    if (typeof chordsheet.id !== 'string') {
        errors.push({
            field: 'id',
            message: 'ID must be a string',
            value: chordsheet.id
        });
    }

    if (typeof chordsheet.title !== 'string') {
        errors.push({
            field: 'title',
            message: 'Title must be a string',
            value: chordsheet.title
        });
    }

    if (typeof chordsheet.originalKey !== 'string') {
        errors.push({
            field: 'originalKey',
            message: 'Original key must be a string',
            value: chordsheet.originalKey
        });
    }

    // Validate optional fields
    if (chordsheet.artist !== undefined && typeof chordsheet.artist !== 'string') {
        errors.push({
            field: 'artist',
            message: 'Artist must be a string if provided',
            value: chordsheet.artist
        });
    }

    // Validate sections
    if (!Array.isArray(chordsheet.sections)) {
        errors.push({
            field: 'sections',
            message: 'Sections must be an array',
            value: chordsheet.sections
        });
    } else {
        chordsheet.sections.forEach((section: any, index: number) => {
            const sectionResult = validateSection(section);
            sectionResult.errors.forEach(error => {
                errors.push({
                    field: `sections[${index}].${error.field}`,
                    message: error.message,
                    value: error.value
                });
            });
            sectionResult.warnings.forEach(warning => {
                warnings.push({
                    field: `sections[${index}].${warning.field}`,
                    message: warning.message,
                    value: warning.value
                });
            });
        });
    }

    // Validate metadata if present
    if (chordsheet.metadata !== undefined) {
        const metadataResult = validateMetadata(chordsheet.metadata);
        metadataResult.errors.forEach(error => {
            errors.push({
                field: `metadata.${error.field}`,
                message: error.message,
                value: error.value
            });
        });
        metadataResult.warnings.forEach(warning => {
            warnings.push({
                field: `metadata.${warning.field}`,
                message: warning.message,
                value: warning.value
            });
        });
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates a section object
 */
export function validateSection(section: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!section || typeof section !== 'object') {
        errors.push({
            field: 'section',
            message: 'Section must be an object',
            value: section
        });
        return { valid: false, errors, warnings };
    }

    // Validate section type
    const validSectionTypes = [
        'verse', 'chorus', 'bridge', 'pre-chorus', 'intro', 'outro',
        'instrumental', 'solo', 'coda', 'tag', 'note', 'unknown'
    ];
    
    if (!validSectionTypes.includes(section.type)) {
        errors.push({
            field: 'type',
            message: `Section type must be one of: ${validSectionTypes.join(', ')}`,
            value: section.type
        });
    }

    // Validate optional title
    if (section.title !== undefined && typeof section.title !== 'string') {
        errors.push({
            field: 'title',
            message: 'Section title must be a string if provided',
            value: section.title
        });
    }

    // Validate lines
    if (!Array.isArray(section.lines)) {
        errors.push({
            field: 'lines',
            message: 'Section lines must be an array',
            value: section.lines
        });
    } else {
        section.lines.forEach((line: any, index: number) => {
            if (!validateLine(line)) {
                errors.push({
                    field: `lines[${index}]`,
                    message: 'Invalid line structure',
                    value: line
                });
            } else {
                // Additional validation for TextLine chords
                if (line.type === 'text') {
                    line.chords.forEach((chord: any, chordIndex: number) => {
                        if (!validateChordPlacement(chord)) {
                            errors.push({
                                field: `lines[${index}].chords[${chordIndex}]`,
                                message: 'Invalid chord placement structure',
                                value: chord
                            });
                        }
                    });
                }
            }
        });
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates metadata object
 */
export function validateMetadata(metadata: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!metadata || typeof metadata !== 'object') {
        errors.push({
            field: 'metadata',
            message: 'Metadata must be an object',
            value: metadata
        });
        return { valid: false, errors, warnings };
    }

    // Validate optional string fields
    const stringFields = ['title', 'artist', 'key', 'timeSignature'];
    stringFields.forEach(field => {
        if (metadata[field] !== undefined && typeof metadata[field] !== 'string') {
            errors.push({
                field,
                message: `${field} must be a string if provided`,
                value: metadata[field]
            });
        }
    });

    // Validate optional number fields
    const numberFields = ['tempo', 'capo'];
    numberFields.forEach(field => {
        if (metadata[field] !== undefined && typeof metadata[field] !== 'number') {
            errors.push({
                field,
                message: `${field} must be a number if provided`,
                value: metadata[field]
            });
        }
    });

    // Validate custom metadata
    if (metadata.custom !== undefined) {
        if (typeof metadata.custom !== 'object' || Array.isArray(metadata.custom)) {
            errors.push({
                field: 'custom',
                message: 'Custom metadata must be an object',
                value: metadata.custom
            });
        } else {
            Object.entries(metadata.custom).forEach(([key, value]) => {
                if (typeof value !== 'string') {
                    errors.push({
                        field: `custom.${key}`,
                        message: 'Custom metadata values must be strings',
                        value
                    });
                }
            });
        }
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates an array of lines
 */
export function validateLines(lines: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!Array.isArray(lines)) {
        errors.push({
            field: 'lines',
            message: 'Lines must be an array',
            value: lines
        });
        return { valid: false, errors, warnings };
    }

    lines.forEach((line, index) => {
        if (!validateLine(line)) {
            errors.push({
                field: `lines[${index}]`,
                message: 'Invalid line structure',
                value: line
            });
        }
    });

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Creates a valid TextLine with validation
 */
export function createTextLine(text: string, chords: ChordPlacement[] = [], lineNumber?: number): TextLine {
    // Validate chords
    chords.forEach((chord, index) => {
        if (!validateChordPlacement(chord)) {
            throw new Error(`Invalid chord placement at index ${index}`);
        }
    });

    return {
        type: 'text',
        text,
        chords,
        lineNumber
    };
}

/**
 * Creates a valid EmptyLine with validation
 */
export function createEmptyLine(count = 1, lineNumber?: number): EmptyLine {
    if (count < 1) {
        throw new Error('Empty line count must be at least 1');
    }

    return {
        type: 'empty',
        count,
        lineNumber
    };
}

/**
 * Creates a valid AnnotationLine with validation
 */
export function createAnnotationLine(
    value: string, 
    annotationType: 'comment' | 'instruction' | 'tempo' | 'dynamics' = 'comment',
    lineNumber?: number
): AnnotationLine {
    if (!value.trim()) {
        throw new Error('Annotation value cannot be empty');
    }

    return {
        type: 'annotation',
        value,
        annotationType,
        lineNumber
    };
}

/**
 * Creates a valid ChordPlacement with validation
 */
export function createChordPlacement(
    value: string,
    originalText: string,
    startIndex: number,
    endIndex: number,
    placement?: 'above' | 'inline' | 'between'
): ChordPlacement {
    if (startIndex < 0 || endIndex < startIndex) {
        throw new Error('Invalid chord placement indices');
    }

    if (!value.trim() || !originalText.trim()) {
        throw new Error('Chord value and original text cannot be empty');
    }

    return {
        value,
        originalText,
        startIndex,
        endIndex,
        placement
    };
}