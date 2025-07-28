/**
 * Chord Factory implementation using Factory pattern
 * Provides centralized chord creation with validation
 */

import { 
  IChordFactory, 
  IChordParser, 
  IChordValidator, 
  IChord, 
  INashvilleChord,
  ChordComponents,
  ChordQuality,
  NashvilleQuality
} from '../../../types/interfaces/core-interfaces';
import { ChordRoot } from '../../../types/value-objects/chord-root';
import { NashvilleNumber } from '../../../types/value-objects/nashville-number';
import { ChordBuilder } from './chord-builder';
import { NashvilleChordBuilder } from './nashville-chord-builder';

/**
 * Factory for creating chord objects with proper validation
 */
export class ChordFactory implements IChordFactory {
  constructor(
    private parser: IChordParser,
    private validator: IChordValidator
  ) {}

  /**
   * Create a chord from a chord string
   */
  createChord(chordString: string, position = 0): IChord {
    if (!chordString || typeof chordString !== 'string') {
      throw new Error('Chord string must be a non-empty string');
    }

    const components = this.parser.parse(chordString.trim());
    const validationResult = this.validator.validate(components);
    
    if (!validationResult.isValid) {
      throw new Error(`Invalid chord: ${validationResult.errors.join(', ')}`);
    }

    return new ChordBuilder()
      .setRoot(components.root)
      .setQuality(this.parseQuality(components.quality))
      .setExtensions(this.parseExtensions(components.extensions))
      .setBassNote(components.bassNote)
      .setPosition(position)
      .setOriginalNotation(chordString)
      .build();
  }

  /**
   * Create a Nashville chord
   */
  createNashvilleChord(number: number, quality: NashvilleQuality): INashvilleChord {
    const nashvilleNumber = new NashvilleNumber(number);
    
    return new NashvilleChordBuilder()
      .setNumber(nashvilleNumber.getValue())
      .setQuality(quality)
      .build();
  }

  /**
   * Create a chord from parsed components
   */
  createChordFromComponents(components: ChordComponents): IChord {
    const validationResult = this.validator.validate(components);
    
    if (!validationResult.isValid) {
      throw new Error(`Invalid chord components: ${validationResult.errors.join(', ')}`);
    }

    return new ChordBuilder()
      .setRoot(components.root)
      .setQuality(this.parseQuality(components.quality))
      .setExtensions(this.parseExtensions(components.extensions))
      .setBassNote(components.bassNote)
      .setOriginalNotation(this.buildOriginalNotation(components))
      .build();
  }

  /**
   * Check if a chord string is valid
   */
  isValidChord(chordString: string): boolean {
    try {
      const components = this.parser.parse(chordString);
      const validationResult = this.validator.validate(components);
      return validationResult.isValid;
    } catch {
      return false;
    }
  }

  /**
   * Create a chord with fluent interface
   */
  createChordBuilder(): ChordBuilder {
    return new ChordBuilder();
  }

  /**
   * Create a Nashville chord with fluent interface
   */
  createNashvilleChordBuilder(): NashvilleChordBuilder {
    return new NashvilleChordBuilder();
  }

  /**
   * Create a chord from root and quality (convenience method)
   */
  createSimpleChord(root: string, quality: ChordQuality = ChordQuality.MAJOR, position = 0): IChord {
    const chordRoot = new ChordRoot(root);
    
    return new ChordBuilder()
      .setRoot(chordRoot.getValue())
      .setQuality(quality)
      .setPosition(position)
      .setOriginalNotation(this.buildSimpleNotation(root, quality))
      .build();
  }

  /**
   * Create a slash chord (chord with bass note)
   */
  createSlashChord(
    root: string, 
    quality: ChordQuality, 
    bassNote: string, 
    position = 0
  ): IChord {
    const chordRoot = new ChordRoot(root);
    const bassRoot = new ChordRoot(bassNote);
    
    return new ChordBuilder()
      .setRoot(chordRoot.getValue())
      .setQuality(quality)
      .setBassNote(bassRoot.getValue())
      .setPosition(position)
      .setOriginalNotation(`${root}${this.qualityToString(quality)}/${bassNote}`)
      .build();
  }

  /**
   * Clone an existing chord with modifications
   */
  cloneChord(chord: IChord, modifications?: Partial<IChord>): IChord {
    const builder = new ChordBuilder()
      .setRoot(chord.root)
      .setQuality(chord.quality)
      .setExtensions([...chord.extensions])
      .setBassNote(chord.bassNote)
      .setPosition(chord.position)
      .setOriginalNotation(chord.originalNotation)
      .setNashvilleNumber(chord.nashvilleNumber);

    if (modifications) {
      if (modifications.root !== undefined) builder.setRoot(modifications.root);
      if (modifications.quality !== undefined) builder.setQuality(modifications.quality);
      if (modifications.extensions !== undefined) builder.setExtensions([...modifications.extensions]);
      if (modifications.bassNote !== undefined) builder.setBassNote(modifications.bassNote);
      if (modifications.position !== undefined) builder.setPosition(modifications.position);
      if (modifications.originalNotation !== undefined) builder.setOriginalNotation(modifications.originalNotation);
      if (modifications.nashvilleNumber !== undefined) builder.setNashvilleNumber(modifications.nashvilleNumber);
    }

    return builder.build();
  }

  private parseQuality(qualityString: string): ChordQuality {
    const normalized = qualityString.toLowerCase().trim();
    
    switch (normalized) {
      case '':
      case 'maj':
      case 'major':
        return ChordQuality.MAJOR;
      case 'm':
      case 'min':
      case 'minor':
        return ChordQuality.MINOR;
      case 'dim':
      case 'diminished':
      case '°':
        return ChordQuality.DIMINISHED;
      case 'aug':
      case 'augmented':
      case '+':
        return ChordQuality.AUGMENTED;
      case 'sus':
      case 'sus4':
      case 'sus2':
      case 'suspended':
        return ChordQuality.SUSPENDED;
      case 'dom':
      case '7':
      case 'dominant':
        return ChordQuality.DOMINANT;
      default:
        return ChordQuality.MAJOR;
    }
  }

  private parseExtensions(extensionStrings: string[]): any[] {
    return extensionStrings.map((ext, index) => ({
      type: this.getExtensionType(ext),
      value: ext,
      position: index
    }));
  }

  private getExtensionType(extension: string): 'add' | 'sus' | 'maj' | 'min' | 'dim' | 'aug' {
    const ext = extension.toLowerCase();
    if (ext.includes('add')) return 'add';
    if (ext.includes('sus')) return 'sus';
    if (ext.includes('maj')) return 'maj';
    if (ext.includes('min')) return 'min';
    if (ext.includes('dim')) return 'dim';
    if (ext.includes('aug')) return 'aug';
    return 'add';
  }

  private buildOriginalNotation(components: ChordComponents): string {
    let notation = components.root;
    if (components.quality && components.quality !== 'maj') {
      notation += components.quality;
    }
    notation += components.extensions.join('');
    if (components.bassNote) {
      notation += `/${components.bassNote}`;
    }
    return notation;
  }

  private buildSimpleNotation(root: string, quality: ChordQuality): string {
    let notation = root;
    if (quality !== ChordQuality.MAJOR) {
      notation += this.qualityToString(quality);
    }
    return notation;
  }

  private qualityToString(quality: ChordQuality): string {
    switch (quality) {
      case ChordQuality.MAJOR:
        return '';
      case ChordQuality.MINOR:
        return 'm';
      case ChordQuality.DIMINISHED:
        return 'dim';
      case ChordQuality.AUGMENTED:
        return 'aug';
      case ChordQuality.SUSPENDED:
        return 'sus';
      case ChordQuality.DOMINANT:
        return '7';
      default:
        return '';
    }
  }
}