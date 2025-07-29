import { NotationFormat } from '../../types';

export interface NashvilleConversionOptions {
  includeMetadata?: boolean;
  preserveFormatting?: boolean;
}

export interface NashvilleConversionResult {
  output: string;
  success: boolean;
  errors?: Array<{ message: string; line?: number }>;
}

export interface NashvilleConverterInterface {
  convert(input: string, options?: NashvilleConversionOptions): NashvilleConversionResult;
  convertChordToNashville(chord: string, key?: string): string;
  convertNashvilleToChord(nashville: string, key?: string): string;
}

export class NashvilleConverterImpl implements NashvilleConverterInterface {
  private keyMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
    'A#': 10, 'Bb': 10, 'B': 11
  };

  private numberToChordMap: Record<number, string> = {
    0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
    6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
  };

  convert(input: string, options: NashvilleConversionOptions = {}): NashvilleConversionResult {
    try {
      const lines = input.split('\n');
      const processedLines: string[] = [];

      for (const line of lines) {
        if (this.isChordLine(line)) {
          const convertedLine = this.convertChordLine(line);
          processedLines.push(convertedLine);
        } else {
          processedLines.push(line);
        }
      }

      return {
        output: processedLines.join('\n'),
        success: true
      };
    } catch (error) {
      return {
        output: input,
        success: false,
        errors: [{ message: error instanceof Error ? error.message : 'Conversion failed' }]
      };
    }
  }

  convertChordToNashville(chord: string, key: string = 'C'): string {
    const chordRoot = chord.match(/^[A-G][#b]?/)?.[0] || '';
    const chordSuffix = chord.replace(chordRoot, '');

    const rootNumber = this.keyMap[chordRoot];
    const keyNumber = this.keyMap[key];

    if (rootNumber === undefined || keyNumber === undefined) {
      return chord;
    }

    let nashvilleNumber = ((rootNumber - keyNumber + 12) % 12) + 1;
    if (nashvilleNumber === 0) nashvilleNumber = 12;

    return `${nashvilleNumber}${chordSuffix}`;
  }

  convertNashvilleToChord(nashville: string, key: string = 'C'): string {
    const numberMatch = nashville.match(/^(\d+)/);
    if (!numberMatch) return nashville;

    const number = parseInt(numberMatch[1]);
    const suffix = nashville.replace(numberMatch[0], '');

    const keyNumber = this.keyMap[key];
    if (keyNumber === undefined) return nashville;

    const chordNumber = (keyNumber + number - 1) % 12;
    const chordRoot = this.numberToChordMap[chordNumber];

    return `${chordRoot}${suffix}`;
  }

  private isChordLine(line: string): boolean {
    return /^[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*/.test(line.trim());
  }

  private convertChordLine(line: string): string {
    return line.replace(/[A-G][#b]?(?:maj|min|m|dim|aug|\+|°|sus[24]?|add\d+|\d+)*/g, (chord) => {
      return this.convertChordToNashville(chord);
    });
  }
}