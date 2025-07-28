/**
 * Chord Validator implementation
 * Validates chord components and chord objects following Single Responsibility Principle
 */

import { 
  IChordValidator, 
  ChordComponents, 
  ValidationResult, 
  IChord 
} from '../../../types/interfaces/core-interfaces';
import { ChordRoot } from '../../../types/value-objects/chord-root';

/**
 * Validator for chord components and chord objects
 */
export class ChordValidator implements IChordValidator {
  /**
   * Valid chord qualities
   */
  private static readonly VALID_QUALITIES = new Set([
    'maj', 'min', 'dim', 'aug', 'sus', 'dom'
  ]);

  /**
   * Valid extension patterns
   */
  private static readonly VALID_EXTENSIONS = new Set([
    // Basic extensions
    '7', '9', '11', '13',
    // Major extensions
    'maj7', 'maj9', 'maj11', 'maj13',
    // Minor extensions
    'm7', 'm9', 'm11', 'm13', 'min7', 'min9', 'min11', 'min13',
    // Diminished extensions
    'dim7', 'dim9',
    // Augmented extensions
    'aug7', 'aug9',
    // Suspended
    'sus2', 'sus4',
    // Added tones
    'add2', 'add4', 'add6', 'add9', 'add11', 'add13',
    // Altered extensions
    '#5', 'b5', '#9', 'b9', '#11', 'b13',
    // Omitted notes
    'no3', 'no5',
    // Power chord
    '5'
  ]);

  /**
   * Incompatible extension combinations
   */
  private static readonly INCOMPATIBLE_COMBINATIONS = [
    ['sus2', 'sus4'],
    ['#5', 'b5'],
    ['#9', 'b9'],
    ['no3', 'sus2'],
    ['no3', 'sus4'],
    ['maj7', 'm7'],
    ['maj7', 'dim7']
  ];

  /**
   * Validate chord components
   */
  validate(components: ChordComponents): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate root note
    const rootValidation = this.validateRoot(components.root);
    errors.push(...rootValidation.errors);
    warnings.push(...rootValidation.warnings);

    // Validate quality
    const qualityValidation = this.validateQuality(components.quality);
    errors.push(...qualityValidation.errors);
    warnings.push(...qualityValidation.warnings);

    // Validate extensions
    const extensionsValidation = this.validateExtensions(components.extensions);
    errors.push(...extensionsValidation.errors);
    warnings.push(...extensionsValidation.warnings);

    // Validate bass note if present
    if (components.bassNote) {
      const bassValidation = this.validateBassNote(components.bassNote, components.root);
      errors.push(...bassValidation.errors);
      warnings.push(...bassValidation.warnings);
    }

    // Validate compatibility between quality and extensions
    const compatibilityValidation = this.validateQualityExtensionCompatibility(
      components.quality, 
      components.extensions
    );
    errors.push(...compatibilityValidation.errors);
    warnings.push(...compatibilityValidation.warnings);

    // Validate extension combinations
    const combinationValidation = this.validateExtensionCombinations(components.extensions);
    errors.push(...combinationValidation.errors);
    warnings.push(...combinationValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a complete chord object
   */
  validateChord(chord: IChord): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic properties
    if (!chord.root) {
      errors.push('Chord must have a root note');
    } else if (!ChordRoot.isValid(chord.root)) {
      errors.push(`Invalid root note: ${chord.root}`);
    }

    if (!chord.quality) {
      errors.push('Chord must have a quality');
    } else if (!ChordValidator.VALID_QUALITIES.has(chord.quality)) {
      errors.push(`Invalid chord quality: ${chord.quality}`);
    }

    if (!Array.isArray(chord.extensions)) {
      errors.push('Chord extensions must be an array');
    } else {
      // Validate each extension
      for (const extension of chord.extensions) {
        if (!extension.type || !extension.value) {
          errors.push('All extensions must have type and value');
        }
        if (typeof extension.position !== 'number') {
          errors.push('All extensions must have a numeric position');
        }
      }
    }

    if (chord.bassNote && !ChordRoot.isValid(chord.bassNote)) {
      errors.push(`Invalid bass note: ${chord.bassNote}`);
    }

    if (!chord.originalNotation) {
      warnings.push('Chord should have original notation for reference');
    }

    if (typeof chord.position !== 'number' || chord.position < 0) {
      errors.push('Chord position must be a non-negative number');
    }

    // Validate bass note is different from root (unless it's an inversion)
    if (chord.bassNote && chord.bassNote === chord.root) {
      warnings.push('Bass note is the same as root note - this may be redundant');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate root note
   */
  private validateRoot(root: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!root) {
      errors.push('Root note is required');
      return { isValid: false, errors, warnings };
    }

    if (!ChordRoot.isValid(root)) {
      errors.push(`Invalid root note: ${root}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate chord quality
   */
  private validateQuality(quality: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!quality) {
      errors.push('Chord quality is required');
      return { isValid: false, errors, warnings };
    }

    if (!ChordValidator.VALID_QUALITIES.has(quality)) {
      errors.push(`Invalid chord quality: ${quality}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate extensions
   */
  private validateExtensions(extensions: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(extensions)) {
      errors.push('Extensions must be an array');
      return { isValid: false, errors, warnings };
    }

    for (const extension of extensions) {
      if (typeof extension !== 'string') {
        errors.push('All extensions must be strings');
        continue;
      }

      if (!ChordValidator.VALID_EXTENSIONS.has(extension)) {
        warnings.push(`Unknown extension: ${extension}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate bass note
   */
  private validateBassNote(bassNote: string, root: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!ChordRoot.isValid(bassNote)) {
      errors.push(`Invalid bass note: ${bassNote}`);
    }

    if (bassNote === root) {
      warnings.push('Bass note is the same as root note');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate compatibility between quality and extensions
   */
  private validateQualityExtensionCompatibility(quality: string, extensions: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for incompatible combinations
    if (quality === 'sus') {
      const hasThird = extensions.some(ext => ext.includes('3') && !ext.includes('no3'));
      if (hasThird) {
        warnings.push('Suspended chords typically do not include the third');
      }
    }

    if (quality === 'dim') {
      const hasNaturalFifth = extensions.some(ext => ext === '5');
      if (hasNaturalFifth) {
        warnings.push('Diminished chords have a flattened fifth by default');
      }
    }

    if (quality === 'aug') {
      const hasFlatFifth = extensions.some(ext => ext === 'b5');
      if (hasFlatFifth) {
        errors.push('Augmented chords cannot have a flattened fifth');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate extension combinations
   */
  private validateExtensionCombinations(extensions: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for incompatible combinations
    for (const [ext1, ext2] of ChordValidator.INCOMPATIBLE_COMBINATIONS) {
      if (extensions.includes(ext1) && extensions.includes(ext2)) {
        errors.push(`Incompatible extensions: ${ext1} and ${ext2}`);
      }
    }

    // Check for duplicate extensions
    const extensionCounts = new Map<string, number>();
    for (const extension of extensions) {
      extensionCounts.set(extension, (extensionCounts.get(extension) || 0) + 1);
    }

    for (const [extension, count] of extensionCounts) {
      if (count > 1) {
        warnings.push(`Duplicate extension: ${extension}`);
      }
    }

    // Check for logical inconsistencies
    if (extensions.includes('no3') && extensions.some(ext => ext.includes('3'))) {
      errors.push('Cannot omit and include the third simultaneously');
    }

    if (extensions.includes('no5') && extensions.some(ext => ext.includes('5'))) {
      errors.push('Cannot omit and include the fifth simultaneously');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get validation suggestions for a chord
   */
  getValidationSuggestions(components: ChordComponents): string[] {
    const suggestions: string[] = [];
    const validation = this.validate(components);

    if (!validation.isValid) {
      suggestions.push('Consider simplifying the chord structure');
      
      if (validation.errors.some(error => error.includes('root'))) {
        suggestions.push('Check the root note spelling (use A-G with optional # or b)');
      }

      if (validation.errors.some(error => error.includes('quality'))) {
        suggestions.push('Use standard chord qualities: major, minor, diminished, augmented, suspended, or dominant');
      }

      if (validation.errors.some(error => error.includes('extension'))) {
        suggestions.push('Remove unknown or incompatible extensions');
      }

      if (validation.errors.some(error => error.includes('bass'))) {
        suggestions.push('Check the bass note spelling');
      }
    }

    return suggestions;
  }

  /**
   * Check if a chord is enharmonically equivalent to another
   */
  areEnharmonicallyEquivalent(chord1: ChordComponents, chord2: ChordComponents): boolean {
    try {
      const root1 = new ChordRoot(chord1.root);
      const root2 = new ChordRoot(chord2.root);
      
      // Check if roots are enharmonically equivalent
      if (root1.getChromaticIndex() !== root2.getChromaticIndex()) {
        return false;
      }

      // Check if qualities are the same
      if (chord1.quality !== chord2.quality) {
        return false;
      }

      // Check if extensions are equivalent (order doesn't matter)
      const ext1 = new Set(chord1.extensions);
      const ext2 = new Set(chord2.extensions);
      
      if (ext1.size !== ext2.size) {
        return false;
      }

      for (const ext of ext1) {
        if (!ext2.has(ext)) {
          return false;
        }
      }

      // Check bass notes if present
      if (chord1.bassNote && chord2.bassNote) {
        const bass1 = new ChordRoot(chord1.bassNote);
        const bass2 = new ChordRoot(chord2.bassNote);
        return bass1.getChromaticIndex() === bass2.getChromaticIndex();
      }

      return chord1.bassNote === chord2.bassNote;
    } catch {
      return false;
    }
  }
}