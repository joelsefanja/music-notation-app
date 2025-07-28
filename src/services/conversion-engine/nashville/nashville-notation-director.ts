/**
 * Nashville Notation Director implementation
 * Provides high-level construction methods for common Nashville notation patterns
 */

import { 
  INashvilleNotationDirector, 
  INashvilleNotation, 
  INashvilleBuilder 
} from '../../../types/interfaces/core-interfaces';
import { NashvilleBuilder } from './nashville-builder';

/**
 * Director that provides common Nashville notation construction patterns
 */
export class NashvilleNotationDirector implements INashvilleNotationDirector {
  constructor(private builder: INashvilleBuilder = new NashvilleBuilder()) {}

  /**
   * Build a basic chord progression (I-V-vi-IV)
   */
  buildBasicProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression([1, 5, 6, 4])
      .setBarNotation(true)
      .build();
  }

  /**
   * Build a complex progression with rhythmic notation
   */
  buildComplexProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression([1, 5, 6, 4])
      .setRhythmicNotation(true)
      .setBarNotation(true)
      .addRhythmicSymbol('◆', 'before', 'Sustained chord')
      .addRhythmicSymbol('^', 'after', 'Accent on beat')
      .addMeasureBarLines(4)
      .build();
  }

  /**
   * Build a custom progression with specified numbers
   */
  buildCustomProgression(key: string, progression: number[]): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(progression)
      .setBarNotation(true)
      .build();
  }

  /**
   * Build a jazz progression (ii-V-I)
   */
  buildJazzProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .setupForStyle('jazz')
      .addCommonProgression('ii-V-I')
      .addMeasureBarLines(3)
      .build();
  }

  /**
   * Build a country progression
   */
  buildCountryProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .setupForStyle('country')
      .addCommonProgression('I-V-vi-IV')
      .addMeasureBarLines(4)
      .addRhythmicSymbol('◆', 'before', 'Whole note')
      .addRhythmicSymbol('.', 'after', 'Staccato')
      .build();
  }

  /**
   * Build a blues progression (12-bar blues)
   */
  buildBluesProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .setupForStyle('blues')
      .addCommonProgression('blues')
      .addMeasureBarLines(12)
      .addRhythmicSymbol('^', 'before', 'Strong accent')
      .build();
  }

  /**
   * Build a pop progression
   */
  buildPopProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .setupForStyle('pop')
      .addCommonProgression('vi-IV-I-V')
      .addMeasureBarLines(4)
      .build();
  }

  /**
   * Build a rock progression
   */
  buildRockProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .setupForStyle('rock')
      .addCommonProgression('I-IV-V-I')
      .addMeasureBarLines(4)
      .build();
  }

  /**
   * Build a ballad progression
   */
  buildBalladProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression([1, 3, 6, 4, 1, 4, 2, 5])
      .setRhythmicNotation(true)
      .setBarNotation(true)
      .addMeasureBarLines(8)
      .addRhythmicSymbol('◆', 'before', 'Sustained')
      .build();
  }

  /**
   * Build a gospel progression
   */
  buildGospelProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression([1, 6, 2, 5, 1])
      .setRhythmicNotation(true)
      .setBarNotation(true)
      .addMeasureBarLines(5)
      .addRhythmicSymbol('^', 'after', 'Gospel accent')
      .build();
  }

  /**
   * Build a folk progression
   */
  buildFolkProgression(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('3/4')
      .addChordProgression([1, 4, 1, 5, 1])
      .setBarNotation(true)
      .addMeasureBarLines(5, 3) // 3 beats per measure
      .build();
  }

  /**
   * Build a progression with repeats
   */
  buildProgressionWithRepeats(
    key: string, 
    progression: number[], 
    repeatStart = 0, 
    repeatEnd?: number
  ): INashvilleNotation {
    const endPosition = repeatEnd || progression.length;
    
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(progression)
      .setBarNotation(true)
      .addMeasureBarLines(progression.length)
      .addRepeatSection(repeatStart, endPosition)
      .build();
  }

  /**
   * Build a progression for a specific time signature
   */
  buildProgressionInTimeSignature(
    key: string, 
    progression: number[], 
    timeSignature: string
  ): INashvilleNotation {
    const [numerator] = timeSignature.split('/').map(Number);
    
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature(timeSignature)
      .addChordProgression(progression)
      .setBarNotation(true)
      .addMeasureBarLines(progression.length, numerator)
      .build();
  }

  /**
   * Build a progression with specific rhythmic patterns
   */
  buildRhythmicProgression(
    key: string, 
    progression: number[], 
    rhythmicPattern: Array<{ symbol: '◆' | '^' | '.' | '<' | '>'; position: 'before' | 'after'; meaning?: string }>
  ): INashvilleNotation {
    let builder = this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(progression)
      .setRhythmicNotation(true)
      .setBarNotation(true)
      .addMeasureBarLines(progression.length);

    for (const pattern of rhythmicPattern) {
      builder = builder.addRhythmicSymbol(pattern.symbol, pattern.position, pattern.meaning);
    }

    return builder.build();
  }

  /**
   * Build a modal progression
   */
  buildModalProgression(key: string, mode: 'dorian' | 'mixolydian' | 'lydian' | 'phrygian'): INashvilleNotation {
    const modalProgressions: Record<string, number[]> = {
      'dorian': [1, 4, 7, 1],      // Natural minor with raised 6th
      'mixolydian': [1, 7, 4, 1],  // Major with lowered 7th
      'lydian': [1, 2, 1, 4],      // Major with raised 4th
      'phrygian': [1, 2, 1, 7]     // Minor with lowered 2nd
    };

    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(modalProgressions[mode])
      .setBarNotation(true)
      .addMeasureBarLines(4)
      .build();
  }

  /**
   * Build a turnaround progression
   */
  buildTurnaround(key: string): INashvilleNotation {
    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression([1, 6, 2, 5])
      .setBarNotation(true)
      .addMeasureBarLines(4)
      .build();
  }

  /**
   * Build a cadential progression
   */
  buildCadence(key: string, cadenceType: 'authentic' | 'plagal' | 'deceptive' | 'half'): INashvilleNotation {
    const cadences: Record<string, number[]> = {
      'authentic': [5, 1],    // V-I
      'plagal': [4, 1],       // IV-I (Amen cadence)
      'deceptive': [5, 6],    // V-vi
      'half': [1, 5]          // I-V
    };

    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(cadences[cadenceType])
      .setBarNotation(true)
      .addMeasureBarLines(2)
      .build();
  }

  /**
   * Build a circle of fifths progression
   */
  buildCircleOfFifths(key: string, length = 8): INashvilleNotation {
    // Start from vi and move in fifths: vi-ii-V-I-IV-vii-iii-vi
    const circleProgression = [6, 2, 5, 1, 4, 7, 3, 6];
    const progression = circleProgression.slice(0, length);

    return this.builder
      .reset()
      .setKey(key)
      .setTimeSignature('4/4')
      .addChordProgression(progression)
      .setBarNotation(true)
      .addMeasureBarLines(progression.length)
      .build();
  }

  /**
   * Set a custom builder
   */
  setBuilder(builder: INashvilleBuilder): void {
    this.builder = builder;
  }

  /**
   * Get the current builder
   */
  getBuilder(): INashvilleBuilder {
    return this.builder;
  }
}