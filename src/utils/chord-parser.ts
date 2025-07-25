import { Chord } from '../types';
import { CHORD_QUALITIES, CHORD_EXTENSIONS, ENHARMONIC_EQUIVALENTS } from '../constants/chord-mappings';

/**
 * Utility class for parsing chord strings into structured Chord objects
 */
export class ChordParser {
  /**
   * Regular expression to match chord components
   * Groups: root, accidental, quality, extensions, slash, bass
   */
  private static readonly CHORD_REGEX = /^([A-G])([#b]?)([^/\s]*(?:add\d+|sus\d+|dim|maj|min|m|aug|\+|°|M|m7|maj7|min7|mM7|m7b5|dim7)?)(?:\/([A-G][#b]?))?$/;

  /**
   * Parse a chord string into a Chord object
   * @param chordString - The chord string to parse (e.g., "Cmaj7/E", "F#m", "Gsus4")
   * @param position - Position of the chord in the text
   * @returns Parsed Chord object
   */
  static parseChord(chordString: string, position: number = 0): Chord {
    const trimmed = chordString.trim();
    const match = trimmed.match(this.CHORD_REGEX);

    if (!match) {
      throw new Error(`Invalid chord format: ${chordString}`);
    }

    const [, rootNote, accidental, qualityAndExtensions, bassNote] = match;
    const root = rootNote + (accidental || '');
    
    // Parse quality and extensions
    const { quality, extensions } = this.parseQualityAndExtensions(qualityAndExtensions || '');

    return {
      root: this.normalizeNote(root),
      quality,
      extensions,
      bassNote: bassNote ? this.normalizeNote(bassNote) : undefined,
      position
    };
  }

  /**
   * Parse quality and extensions from the chord string
   * @param qualityAndExtensions - The quality and extensions part of the chord
   * @returns Object with quality and extensions array
   */
  private static parseQualityAndExtensions(qualityAndExtensions: string): { quality: string; extensions: string[] } {
    let remaining = qualityAndExtensions;
    let quality = 'maj'; // Default to major
    const extensions: string[] = [];

    // First, check for compound extensions that include quality (like maj7, maj9, etc.)
    // These should be treated as extensions, not quality + extension
    const compoundExtensions = ['maj7', 'maj9', 'maj11', 'maj13', 'maj6', 'maj7sus4', 'maj7sus2'];
    for (const ext of compoundExtensions) {
      if (remaining.startsWith(ext)) {
        extensions.push(ext);
        remaining = remaining.substring(ext.length);
        // Continue parsing for additional extensions
        remaining = this.parseExtensions(remaining, extensions);
        return { quality, extensions };
      }
    }

    // Sort qualities by length (longest first) to avoid partial matches
    const sortedQualities = Object.entries(CHORD_QUALITIES)
      .filter(([pattern]) => pattern !== '') // Skip empty pattern
      .sort(([a], [b]) => b.length - a.length);

    // Check for basic qualities
    for (const [pattern, normalizedQuality] of sortedQualities) {
      if (remaining.startsWith(pattern)) {
        quality = normalizedQuality;
        remaining = remaining.substring(pattern.length);
        // Break after the first match to avoid multiple quality assignments
        break;
      }
    }

    // Parse remaining extensions
    remaining = this.parseExtensions(remaining, extensions);

    return { quality, extensions };
  }

  /**
   * Parse chord extensions from the remaining string
   * @param remaining - Remaining string after quality parsing
   * @param extensions - Array to populate with found extensions
   * @returns Remaining string after parsing extensions
   */
  private static parseExtensions(remaining: string, extensions: string[]): string {
    let current = remaining;

    // Sort extensions by length (longest first) to avoid partial matches
    const sortedExtensions = [...CHORD_EXTENSIONS].sort((a, b) => b.length - a.length);

    let foundExtension = true;
    while (foundExtension && current.length > 0) {
      foundExtension = false;
      
      for (const ext of sortedExtensions) {
        if (current.startsWith(ext)) {
          extensions.push(ext);
          current = current.substring(ext.length);
          foundExtension = true;
          break;
        }
      }
      
      // If no extension found, break to avoid infinite loop
      if (!foundExtension) {
        break;
      }
    }

    return current;
  }

  /**
   * Normalize note names using enharmonic equivalents
   * @param note - Note to normalize
   * @returns Normalized note name
   */
  private static normalizeNote(note: string): string {
    // For now, return the note as-is to preserve original notation
    // Enharmonic conversion can be applied later if needed
    return note;
  }

  /**
   * Check if a string represents a valid chord
   * @param chordString - String to validate
   * @returns True if valid chord format
   */
  static isValidChord(chordString: string): boolean {
    try {
      this.parseChord(chordString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert Nashville-style slash chords (like 5/7) to proper chord notation (like G/B)
   * @param nashvilleChord - Nashville chord string (e.g., "5/7", "1/3")
   * @param key - Key signature for conversion
   * @returns Proper chord notation (e.g., "G/B", "C/E")
   */
  static convertNashvilleSlashChord(nashvilleChord: string, key: string): string {
    const slashMatch = nashvilleChord.match(/^([#b]?\d+[m°+]?)\/([#b]?\d+)$/);
    if (!slashMatch) {
      return nashvilleChord; // Not a Nashville slash chord
    }

    try {
      // Use NashvilleConverter to convert both parts
      const { NashvilleConverter } = require('./nashville-converter');
      
      const [, rootPart, bassPart] = slashMatch;
      const rootChord = NashvilleConverter.nashvilleToChord(rootPart, key);
      const bassChord = NashvilleConverter.nashvilleToChord(bassPart, key);
      
      const qualityStr = rootChord.quality === 'maj' ? '' : (rootChord.quality === 'min' ? 'm' : rootChord.quality);
      return `${rootChord.root}${qualityStr}${rootChord.extensions.join('')}/${bassChord.root}`;
    } catch (error) {
      // If conversion fails, return original
      return nashvilleChord;
    }
  }

  /**
   * Enhanced chord parsing that handles Nashville-style slash chords
   * @param chordString - Chord string that might be Nashville format
   * @param position - Position in text
   * @param key - Optional key for Nashville conversion
   * @returns Parsed chord object
   */
  static parseChordWithNashvilleSupport(chordString: string, position: number = 0, key?: string): Chord {
    // Check if it's a Nashville-style slash chord
    if (key && /^[#b]?\d+[m°+]?\/[#b]?\d+$/.test(chordString.trim())) {
      const convertedChord = this.convertNashvilleSlashChord(chordString.trim(), key);
      return this.parseChord(convertedChord, position);
    }
    
    // Regular chord parsing
    return this.parseChord(chordString, position);
  }

  /**
   * Extract all chords from a text string with their positions
   * @param text - Text containing chords in brackets [C] [Am] etc.
   * @param format - Format of chord notation (affects parsing rules)
   * @returns Array of parsed Chord objects with positions
   */
  static extractChordsFromText(text: string, format: 'brackets' | 'inline' = 'brackets'): Chord[] {
    const chords: Chord[] = [];
    
    if (format === 'brackets') {
      // Match chords in brackets like [C] [Am7] [F/G]
      const bracketRegex = /\[([^\]]+)\]/g;
      let match;
      
      while ((match = bracketRegex.exec(text)) !== null) {
        try {
          const chord = this.parseChord(match[1], match.index);
          chords.push(chord);
        } catch (error) {
          // Skip invalid chords but continue parsing
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.warn(`Skipping invalid chord: "${match[1]}". Error: ${errorMessage}`);
        }
      }
    } else {
      // For inline format, look for chord-like patterns at word boundaries
      const inlineRegex = /\b([A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+|[#b]\d+)*(?:\/[A-G][#b]?)?)\b/g;
      let match;
      
      while ((match = inlineRegex.exec(text)) !== null) {
        try {
          if (this.isValidChord(match[1])) {
            const chord = this.parseChord(match[1], match.index);
            chords.push(chord);
          }
        } catch (error) {
          // Skip invalid chords but continue parsing
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.warn(`Skipping invalid chord: ${match[1]}. Error: ${errorMessage}`);
        }
      }
    }

    return chords;
  }

  /**
   * Convert a Chord object back to string representation
   * @param chord - Chord object to convert
   * @param includeBrackets - Whether to include brackets around the chord
   * @returns String representation of the chord
   */
  static chordToString(chord: Chord, includeBrackets: boolean = false): string {
    let chordString = chord.root;
    
    // Add quality (skip if major)
    if (chord.quality !== 'maj') {
      if (chord.quality === 'min') {
        chordString += 'm';
      } else {
        chordString += chord.quality;
      }
    }
    
    // Add extensions
    chordString += chord.extensions.join('');
    
    // Add bass note if present
    if (chord.bassNote) {
      chordString += `/${chord.bassNote}`;
    }
    
    return includeBrackets ? `[${chordString}]` : chordString;
  }
}