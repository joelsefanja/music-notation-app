/**
 * Enhanced chord placement interface with precise position tracking
 */
export interface ChordPlacement {
    value: string; // The canonical chord representation (e.g., 'Cmaj7', 'G#m', 'Eb7sus4', '1-')
    originalText: string; // The exact string as parsed ([Cm7], G#, 1-)
    startIndex: number; // Start position in the text for inline chords
    endIndex: number; // End position in the text for inline chords
    placement?: 'above' | 'inline' | 'between'; // How the chord should be positioned relative to text
}

/**
 * Enhanced chord interface for canonical representation
 */
export interface Chord {
    root: string; // Root note (C, D, E, F, G, A, B)
    quality: ChordQuality; // Major, minor, diminished, etc.
    extensions: ChordExtension[]; // Additional chord extensions
    bassNote?: string; // Bass note for slash chords
    originalNotation: string; // Original notation as it appeared
    nashvilleNumber?: string; // Nashville number representation if applicable
    position?: number; // Position of the chord in the text
}

/**
 * Chord quality enumeration
 */
export enum ChordQuality {
    MAJOR = 'maj',
    MINOR = 'min',
    DIMINISHED = 'dim',
    AUGMENTED = 'aug',
    SUSPENDED = 'sus',
    DOMINANT = 'dom'
}

/**
 * Chord extension interface
 */
export interface ChordExtension {
    type: 'add' | 'sus' | 'maj' | 'min' | 'dim' | 'aug';
    value: string; // The extension value (e.g., '7', '9', '4')
    position: number; // Position in the chord notation
}

/**
 * Validates that a ChordPlacement object has the correct structure
 */
export function validateChordPlacement(placement: any): placement is ChordPlacement {
    if (!placement || typeof placement !== 'object') {
        return false;
    }

    return typeof placement.value === 'string' &&
        typeof placement.originalText === 'string' &&
        typeof placement.startIndex === 'number' &&
        typeof placement.endIndex === 'number' &&
        placement.startIndex >= 0 &&
        placement.endIndex >= placement.startIndex &&
        (placement.placement === undefined ||
            ['above', 'inline', 'between'].includes(placement.placement));
}

/**
 * Validates that a Chord object has the correct structure
 */
export function validateChord(chord: any): chord is Chord {
    if (!chord || typeof chord !== 'object') {
        return false;
    }

    return typeof chord.root === 'string' &&
        Object.values(ChordQuality).includes(chord.quality) &&
        Array.isArray(chord.extensions) &&
        chord.extensions.every(validateChordExtension) &&
        (chord.bassNote === undefined || typeof chord.bassNote === 'string') &&
        typeof chord.originalNotation === 'string' &&
        (chord.nashvilleNumber === undefined || typeof chord.nashvilleNumber === 'string');
}

/**
 * Validates that a ChordExtension object has the correct structure
 */
export function validateChordExtension(extension: any): extension is ChordExtension {
    if (!extension || typeof extension !== 'object') {
        return false;
    }

    return ['add', 'sus', 'maj', 'min', 'dim', 'aug'].includes(extension.type) &&
        typeof extension.value === 'string' &&
        typeof extension.position === 'number';
}

export enum ChordType {
    MAJOR = 'major',
    MINOR = 'minor',
    DIMINISHED = 'diminished',
    AUGMENTED = 'augmented',
    DOMINANT = 'dominant',
    SUSPENDED = 'suspended',
    EXTENDED = 'extended'
}