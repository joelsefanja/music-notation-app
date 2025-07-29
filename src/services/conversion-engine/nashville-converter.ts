
import { Chord, ChordType } from '../../types/chord';
import { Section } from '../../types/section';
import { Line, LineType } from '../../types/line';
import { ChordSheet } from '../../types/chordsheet';
import { ConversionResult } from '../../types/conversion-result';
import { ConversionError } from '../../types/conversion-error';

interface NashvilleChordMapping {
  [key: string]: string;
}

export class NashvilleConverter {
  private readonly chordMappings: NashvilleChordMapping = {
    'C': '1',
    'Dm': '2m',
    'Em': '3m', 
    'F': '4',
    'G': '5',
    'Am': '6m',
    'Bdim': '7°',
    'C#': '1#',
    'D#m': '2#m',
    'F#': '4#',
    'G#': '5#',
    'A#m': '6#m',
    'Db': '1b',
    'Eb': '3b',
    'Gb': '4b',
    'Ab': '6b',
    'Bb': '7b'
  };

  /**
   * Convert chord to Nashville notation
   */
  convertChord(chord: Chord): string {
    const baseChord = `${chord.root}${chord.type === ChordType.MINOR ? 'm' : ''}`;
    return this.chordMappings[baseChord] || chord.root;
  }

  /**
   * Convert chord sheet to Nashville notation
   */
  convertToNashville(chordSheet: ChordSheet): ConversionResult {
    try {
      const convertedSections: Section[] = chordSheet.sections.map(section => ({
        ...section,
        lines: section.lines.map(line => this.convertLine(line))
      }));

      const convertedChordSheet: ChordSheet = {
        ...chordSheet,
        sections: convertedSections
      };

      return {
        success: true,
        output: this.formatOutput(convertedChordSheet),
        metadata: chordSheet.metadata,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        metadata: chordSheet.metadata,
        errors: [{
          type: 'conversion',
          message: error instanceof Error ? error.message : 'Nashville conversion failed',
          line: 0,
          severity: 'error'
        } as ConversionError]
      };
    }
  }

  private convertLine(line: Line): Line {
    if (line.type === LineType.CHORD_LYRIC && line.chords) {
      return {
        ...line,
        chords: line.chords.map(chord => ({
          ...chord,
          chord: this.convertChord(chord.chord)
        }))
      };
    }
    return line;
  }

  private formatOutput(chordSheet: ChordSheet): string {
    let output = '';
    
    if (chordSheet.metadata.title) {
      output += `Title: ${chordSheet.metadata.title}\n`;
    }
    if (chordSheet.metadata.artist) {
      output += `Artist: ${chordSheet.metadata.artist}\n`;
    }
    if (chordSheet.metadata.key) {
      output += `Key: ${chordSheet.metadata.key}\n`;
    }
    
    output += '\n';

    chordSheet.sections.forEach(section => {
      if (section.type !== 'default') {
        output += `[${section.type}]\n`;
      }
      
      section.lines.forEach(line => {
        if (line.type === LineType.CHORD_LYRIC && line.chords && line.chords.length > 0) {
          // Create chord line
          let chordLine = '';
          let lyricLine = line.lyrics || '';
          
          line.chords.forEach(chordInfo => {
            const position = chordInfo.position || 0;
            while (chordLine.length < position) {
              chordLine += ' ';
            }
            chordLine += chordInfo.chord;
          });
          
          if (chordLine.trim()) {
            output += chordLine + '\n';
          }
          if (lyricLine.trim()) {
            output += lyricLine + '\n';
          }
        } else if (line.lyrics) {
          output += line.lyrics + '\n';
        }
      });
      
      output += '\n';
    });

    return output.trim();
  }
}
