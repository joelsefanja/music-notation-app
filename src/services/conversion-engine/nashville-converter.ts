import { TextLine, AnnotationLine, Line } from '../../types/line';
import { Chord } from '../../types/chord';

export class NashvilleConverter {
  /**
   * Convert chord notation to Nashville number system
   */
  public convertChordToNashville(chord: Chord, key: string = 'C'): string {
    const noteToNumber: { [key: string]: number } = {
      'C': 1, 'C#': 1, 'Db': 2, 'D': 2, 'D#': 2, 'Eb': 3, 'E': 3,
      'F': 4, 'F#': 4, 'Gb': 5, 'G': 5, 'G#': 5, 'Ab': 6, 'A': 6,
      'A#': 6, 'Bb': 7, 'B': 7
    };

    const keyNote = key.charAt(0).toUpperCase();
    const keyOffset = noteToNumber[keyNote] || 1;

    const chordRoot = chord.root.charAt(0).toUpperCase();
    const chordNumber = noteToNumber[chordRoot] || 1;

    // Calculate relative number
    let nashvilleNumber = ((chordNumber - keyOffset + 7) % 7) + 1;

    // Handle chord quality
    let quality = '';
    if (chord.quality === 'minor') {
      quality = 'm';
    } else if (chord.quality === 'diminished') {
      quality = '°';
    } else if (chord.quality === 'augmented') {
      quality = '+';
    }

    // Add extensions if present
    let extensions = '';
    if (chord.extensions && chord.extensions.length > 0) {
      extensions = chord.extensions.join('');
    }

    return `${nashvilleNumber}${quality}${extensions}`;
  }

  /**
   * Convert Nashville number back to chord notation
   */
  public convertNashvilleToChord(nashville: string, key: string = 'C'): Chord {
    const numberToNote: { [key: string]: string[] } = {
      'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
      'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
      'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
      'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
      'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']
    };

    const keyNote = key.charAt(0).toUpperCase();
    const scale = numberToNote[keyNote] || numberToNote['C'];

    // Parse Nashville notation
    const match = nashville.match(/^(\d+)([m°+]?)(.*)$/);
    if (!match) {
      throw new Error(`Invalid Nashville notation: ${nashville}`);
    }

    const [, numberStr, qualitySymbol, extensions] = match;
    const number = parseInt(numberStr, 10);

    if (number < 1 || number > 7) {
      throw new Error(`Invalid Nashville number: ${number}`);
    }

    const root = scale[number - 1];

    let quality: 'major' | 'minor' | 'diminished' | 'augmented' = 'major';
    if (qualitySymbol === 'm') {
      quality = 'minor';
    } else if (qualitySymbol === '°') {
      quality = 'diminished';
    } else if (qualitySymbol === '+') {
      quality = 'augmented';
    }

    return {
      root,
      quality,
      extensions: extensions ? [extensions] : [],
      bass: undefined
    };
  }

  /**
   * Convert a line with Nashville notation to standard chord notation
   */
  public convertLineFromNashville(line: Line, key: string = 'C'): Line {
    if (line.type !== 'text') {
      return line;
    }

    const textLine = line as TextLine;
    const convertedChords = textLine.chords.map(chord => {
      try {
        const nashvilleMatch = chord.chord.match(/^(\d+[m°+]?.*?)$/);
        if (nashvilleMatch) {
          const convertedChord = this.convertNashvilleToChord(chord.chord, key);
          return {
            ...chord,
            chord: `${convertedChord.root}${convertedChord.quality === 'minor' ? 'm' : convertedChord.quality === 'diminished' ? '°' : convertedChord.quality === 'augmented' ? '+' : ''}${convertedChord.extensions?.join('') || ''}`
          };
        }
        return chord;
      } catch (error) {
        // If conversion fails, return original chord
        return chord;
      }
    });

    return {
      ...textLine,
      chords: convertedChords
    };
  }

  /**
   * Convert a line with standard chords to Nashville notation
   */
  public convertLineToNashville(line: Line, key: string = 'C'): Line {
    if (line.type !== 'text') {
      return line;
    }

    const textLine = line as TextLine;
    const convertedChords = textLine.chords.map(chord => {
      try {
        // Parse the chord string into a Chord object
        const chordObj = this.parseChordString(chord.chord);
        const nashvilleNotation = this.convertChordToNashville(chordObj, key);

        return {
          ...chord,
          chord: nashvilleNotation
        };
      } catch (error) {
        // If conversion fails, return original chord
        return chord;
      }
    });

    return {
      ...textLine,
      chords: convertedChords
    };
  }

  /**
   * Parse a chord string into a Chord object
   */
  private parseChordString(chordStr: string): Chord {
    const match = chordStr.match(/^([A-G][#b]?)([m°+]?)(.*)$/);
    if (!match) {
      throw new Error(`Invalid chord string: ${chordStr}`);
    }

    const [, root, qualitySymbol, extensions] = match;

    let quality: 'major' | 'minor' | 'diminished' | 'augmented' = 'major';
    if (qualitySymbol === 'm') {
      quality = 'minor';
    } else if (qualitySymbol === '°') {
      quality = 'diminished';
    } else if (qualitySymbol === '+') {
      quality = 'augmented';
    }

    return {
      root,
      quality,
      extensions: extensions ? [extensions] : [],
      bass: undefined
    };
  }

  /**
   * Convert chord to Nashville notation (static method for backwards compatibility)
   */
  static convertToNashville(chord: Chord, key: string): string {
    const instance = new NashvilleConverter();
    return instance.convertChordToNashville(chord, key);
  }

  /**
   * Convert Nashville notation back to chord (static method for backwards compatibility)
   */
  static convertFromNashville(nashvilleChord: string, key: string): string {
    const instance = new NashvilleConverter();
    try {
      const chord = instance.convertNashvilleToChord(nashvilleChord, key);
      return `${chord.root}${chord.quality === 'minor' ? 'm' : chord.quality === 'diminished' ? '°' : chord.quality === 'augmented' ? '+' : ''}${chord.extensions?.join('') || ''}`;
    } catch (error) {
      return nashvilleChord; // Return original if conversion fails
    }
  }
}