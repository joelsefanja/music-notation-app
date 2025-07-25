import { Chord } from '../types';
import { ChordParser } from '../utils/chord-parser';
import { MAJOR_KEY_SIGNATURES, MINOR_KEY_SIGNATURES, NASHVILLE_MAJOR_MAPPINGS, NASHVILLE_MINOR_MAPPINGS } from '../constants/chord-mappings';

/**
 * Result of key detection analysis
 */
export interface KeyDetectionResult {
  key: string;
  confidence: number;
  isMinor: boolean;
  analysis: {
    chordFrequency: Record<string, number>;
    progressionMatches: string[];
    tonicIndicators: number;
  };
}

/**
 * Common chord progressions for key detection
 */
const KEY_DETECTION_PATTERNS = {
  // Common major key progressions (in Nashville numbers)
  major: [
    ['1', '5', '6m', '4'],    // I-V-vi-IV (very common pop progression)
    ['1', '4', '5', '1'],     // I-IV-V-I (classic cadence)
    ['6m', '4', '1', '5'],    // vi-IV-I-V (pop progression variant)
    ['1', '6m', '4', '5'],    // I-vi-IV-V (50s progression)
    ['1', '4', '1', '5'],     // I-IV-I-V (simple progression)
    ['4', '5', '1'],          // IV-V-I (partial cadence)
    ['1', '5', '6m'],         // I-V-vi (common start)
    ['2m', '5', '1'],         // ii-V-I (jazz progression)
    ['6m', '2m', '5', '1'],   // vi-ii-V-I (circle of fifths)
  ],
  // Common minor key progressions (in Nashville numbers)
  minor: [
    ['1m', '7', '6', '7'],    // i-VII-VI-VII (minor progression)
    ['1m', '4m', '5', '1m'],  // i-iv-V-i (harmonic minor)
    ['1m', '6', '7', '1m'],   // i-VI-VII-i (natural minor)
    ['1m', '3', '7', '1m'],   // i-III-VII-i (modal)
    ['1m', '4m', '1m'],       // i-iv-i (simple minor)
    ['1m', '5', '1m'],        // i-V-i (basic minor cadence)
    ['6', '7', '1m'],         // VI-VII-i (minor cadence)
    ['1m', '2°', '5', '1m'],  // i-ii°-V-i (harmonic minor progression)
  ]
};

/**
 * Auto-key detection engine that analyzes chord progressions
 */
export class AutoKeyDetection {
  /**
   * Detect the key of a chord sheet based on chord analysis
   * @param text - Text containing chords
   * @param format - Format of the chord sheet (affects chord extraction)
   * @returns Key detection result with confidence score
   */
  public detectKey(text: string, format: 'brackets' | 'inline' = 'brackets'): KeyDetectionResult {
    // Extract chords from the text
    const chords = ChordParser.extractChordsFromText(text, format);
    
    if (chords.length === 0) {
      return this.createDefaultResult();
    }

    // Analyze all possible keys
    const majorResults = this.analyzeForMajorKeys(chords);
    const minorResults = this.analyzeForMinorKeys(chords);
    
    // Combine and sort results by confidence
    const allResults = [...majorResults, ...minorResults]
      .sort((a, b) => b.confidence - a.confidence);

    return allResults[0] || this.createDefaultResult();
  }

  /**
   * Analyze chords for major key matches
   * @param chords - Array of parsed chords
   * @returns Array of key detection results for major keys
   */
  private analyzeForMajorKeys(chords: Chord[]): KeyDetectionResult[] {
    const results: KeyDetectionResult[] = [];

    for (const [key, scale] of Object.entries(MAJOR_KEY_SIGNATURES)) {
      const analysis = this.analyzeKeyFit(chords, key, scale, false);
      if (analysis.confidence > 0) {
        results.push({
          key,
          confidence: analysis.confidence,
          isMinor: false,
          analysis
        });
      }
    }

    return results;
  }

  /**
   * Analyze chords for minor key matches
   * @param chords - Array of parsed chords
   * @returns Array of key detection results for minor keys
   */
  private analyzeForMinorKeys(chords: Chord[]): KeyDetectionResult[] {
    const results: KeyDetectionResult[] = [];

    for (const [key, scale] of Object.entries(MINOR_KEY_SIGNATURES)) {
      const analysis = this.analyzeKeyFit(chords, key, scale, true);
      if (analysis.confidence > 0) {
        results.push({
          key,
          confidence: analysis.confidence,
          isMinor: true,
          analysis
        });
      }
    }

    return results;
  }

  /**
   * Analyze how well chords fit a specific key
   * @param chords - Array of chords to analyze
   * @param key - Key to test against
   * @param scale - Scale notes for the key
   * @param isMinor - Whether this is a minor key
   * @returns Analysis result with confidence score
   */
  private analyzeKeyFit(chords: Chord[], key: string, scale: string[], isMinor: boolean): {
    confidence: number;
    chordFrequency: Record<string, number>;
    progressionMatches: string[];
    tonicIndicators: number;
  } {
    const chordFrequency: Record<string, number> = {};
    const nashvilleChords: string[] = [];
    let tonicIndicators = 0;
    let scaleMatches = 0;

    // Convert chords to Nashville numbers for this key
    for (const chord of chords) {
      const nashvilleNumber = this.chordToNashville(chord, key, isMinor);
      if (nashvilleNumber) {
        nashvilleChords.push(nashvilleNumber);
        chordFrequency[nashvilleNumber] = (chordFrequency[nashvilleNumber] || 0) + 1;
        
        // Check if chord root is in the scale
        if (scale.includes(chord.root) || this.isEnharmonicEquivalent(chord.root, scale)) {
          scaleMatches++;
        }
        
        // Count tonic indicators (1 or 1m chords)
        if (nashvilleNumber === '1' || nashvilleNumber === '1m') {
          tonicIndicators++;
        }
      }
    }

    // Find progression matches
    const progressionMatches = this.findProgressionMatches(nashvilleChords, isMinor);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(
      chords.length,
      scaleMatches,
      progressionMatches.length,
      tonicIndicators,
      chordFrequency,
      isMinor
    );

    return {
      confidence,
      chordFrequency,
      progressionMatches,
      tonicIndicators
    };
  }

  /**
   * Convert a chord to Nashville number notation for a given key
   * @param chord - Chord to convert
   * @param key - Key to convert relative to
   * @param isMinor - Whether the key is minor
   * @returns Nashville number string or null if not in key
   */
  private chordToNashville(chord: Chord, key: string, isMinor: boolean): string | null {
    if (isMinor) {
      return this.chordToNashvilleMinor(chord, key);
    } else {
      return this.chordToNashvilleMajor(chord, key);
    }
  }

  /**
   * Convert chord to Nashville number for major key
   */
  private chordToNashvilleMajor(chord: Chord, key: string): string | null {
    const mappings = NASHVILLE_MAJOR_MAPPINGS[key];
    if (!mappings) return null;

    let nashvilleNumber = mappings[chord.root];
    
    // Try enharmonic equivalent if not found
    if (!nashvilleNumber) {
      const enharmonic = this.getEnharmonicEquivalent(chord.root);
      if (enharmonic) {
        nashvilleNumber = mappings[enharmonic];
      }
    }

    if (!nashvilleNumber) return null;

    // Adjust for chord quality in major key
    if (chord.quality === 'min') {
      // Minor chords in major key: 2m, 3m, 6m
      if (['2', '3', '6'].includes(nashvilleNumber)) {
        nashvilleNumber += 'm';
      }
    } else if (chord.quality === 'dim') {
      // Diminished chord (typically 7°)
      nashvilleNumber += '°';
    }

    return nashvilleNumber;
  }

  /**
   * Convert chord to Nashville number for minor key
   */
  private chordToNashvilleMinor(chord: Chord, key: string): string | null {
    const scale = MINOR_KEY_SIGNATURES[key];
    if (!scale) return null;

    // Create mapping for minor key
    const minorMappings: Record<string, string> = {
      [scale[0]]: '1m',  // i
      [scale[1]]: '2°',  // ii°
      [scale[2]]: '3',   // III
      [scale[3]]: '4m',  // iv
      [scale[4]]: '5',   // v (can be major or minor)
      [scale[5]]: '6',   // VI
      [scale[6]]: '7'    // VII
    };

    let nashvilleNumber = minorMappings[chord.root];
    
    // Try enharmonic equivalent if not found
    if (!nashvilleNumber) {
      const enharmonic = this.getEnharmonicEquivalent(chord.root);
      if (enharmonic) {
        nashvilleNumber = minorMappings[enharmonic];
      }
    }

    if (!nashvilleNumber) return null;

    // Adjust for chord quality in minor key
    if (chord.quality === 'min') {
      // Ensure minor chords are marked correctly
      if (nashvilleNumber === '1') nashvilleNumber = '1m';
      if (nashvilleNumber === '4') nashvilleNumber = '4m';
      if (nashvilleNumber === '5') nashvilleNumber = '5m';
    } else if (chord.quality === 'maj') {
      // Major chords in minor key
      if (nashvilleNumber === '1m') nashvilleNumber = '1';
      if (nashvilleNumber === '4m') nashvilleNumber = '4';
      if (nashvilleNumber === '5m') nashvilleNumber = '5';
    } else if (chord.quality === 'dim') {
      nashvilleNumber = nashvilleNumber.replace('m', '') + '°';
    }

    return nashvilleNumber;
  }

  /**
   * Find matching chord progressions in the Nashville chord sequence
   * @param nashvilleChords - Array of Nashville numbers
   * @param isMinor - Whether to check minor progressions
   * @returns Array of matched progression names
   */
  private findProgressionMatches(nashvilleChords: string[], isMinor: boolean): string[] {
    const patterns = isMinor ? KEY_DETECTION_PATTERNS.minor : KEY_DETECTION_PATTERNS.major;
    const matches: string[] = [];

    for (const pattern of patterns) {
      if (this.containsProgression(nashvilleChords, pattern)) {
        matches.push(pattern.join('-'));
      }
    }

    return matches;
  }

  /**
   * Check if a chord sequence contains a specific progression
   * @param chords - Array of Nashville chord numbers
   * @param pattern - Pattern to search for
   * @returns True if pattern is found
   */
  private containsProgression(chords: string[], pattern: string[]): boolean {
    if (pattern.length > chords.length) return false;

    for (let i = 0; i <= chords.length - pattern.length; i++) {
      let matches = true;
      for (let j = 0; j < pattern.length; j++) {
        if (chords[i + j] !== pattern[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }

    return false;
  }

  /**
   * Calculate confidence score based on various factors
   * @param totalChords - Total number of chords
   * @param scaleMatches - Number of chords that fit the scale
   * @param progressionMatches - Number of matching progressions
   * @param tonicIndicators - Number of tonic chord occurrences
   * @param chordFrequency - Frequency of each chord
   * @param isMinor - Whether this is a minor key analysis
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(
    totalChords: number,
    scaleMatches: number,
    progressionMatches: number,
    tonicIndicators: number,
    chordFrequency: Record<string, number>,
    isMinor: boolean
  ): number {
    if (totalChords === 0) return 0;

    let confidence = 0;

    // Base score from scale fit (how many chords are in the key)
    const scaleFitRatio = scaleMatches / totalChords;
    confidence += scaleFitRatio * 0.3;

    // Strong bonus for progression matches (this is very indicative)
    confidence += Math.min(progressionMatches * 0.2, 0.4);

    // Strong bonus for tonic presence (crucial for key identification)
    const tonicKey = isMinor ? '1m' : '1';
    const tonicFrequency = chordFrequency[tonicKey] || 0;
    if (tonicFrequency > 0) {
      const tonicRatio = tonicFrequency / totalChords;
      confidence += tonicRatio * 0.3; // Increased weight for tonic
    }

    // Additional bonus for characteristic chord patterns
    if (isMinor) {
      // Minor key indicators
      const minorIndicators = (chordFrequency['1m'] || 0) + (chordFrequency['4m'] || 0) + (chordFrequency['5m'] || 0);
      const majorIndicators = (chordFrequency['3'] || 0) + (chordFrequency['6'] || 0) + (chordFrequency['7'] || 0);
      
      if (minorIndicators > 0) {
        confidence += (minorIndicators / totalChords) * 0.2;
      }
      
      // Bonus if we have the characteristic minor progression chords
      if (chordFrequency['6'] && chordFrequency['7']) {
        confidence += 0.1; // VI-VII is very characteristic of minor keys
      }
    } else {
      // Major key indicators
      const majorIndicators = (chordFrequency['1'] || 0) + (chordFrequency['4'] || 0) + (chordFrequency['5'] || 0);
      const minorIndicators = (chordFrequency['2m'] || 0) + (chordFrequency['3m'] || 0) + (chordFrequency['6m'] || 0);
      
      if (majorIndicators > 0) {
        confidence += (majorIndicators / totalChords) * 0.2;
      }
      
      // Bonus for I-V-vi-IV or similar major progressions
      if (chordFrequency['1'] && chordFrequency['5'] && chordFrequency['6m']) {
        confidence += 0.1;
      }
    }

    // Penalty for too many out-of-key chords
    const outOfKeyRatio = (totalChords - scaleMatches) / totalChords;
    if (outOfKeyRatio > 0.4) {
      confidence -= (outOfKeyRatio - 0.4) * 0.3;
    }

    // Penalty for conflicting mode indicators
    if (isMinor) {
      // If analyzing as minor but we see strong major indicators, reduce confidence
      const conflictingMajor = (chordFrequency['1'] || 0) + (chordFrequency['4'] || 0) + (chordFrequency['5'] || 0);
      if (conflictingMajor > tonicFrequency) {
        confidence -= 0.2;
      }
    } else {
      // If analyzing as major but we see strong minor indicators, reduce confidence
      const conflictingMinor = (chordFrequency['1m'] || 0) + (chordFrequency['4m'] || 0) + (chordFrequency['5m'] || 0);
      if (conflictingMinor > tonicFrequency) {
        confidence -= 0.2;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Check if a note is enharmonically equivalent to any note in the scale
   * @param note - Note to check
   * @param scale - Scale to check against
   * @returns True if enharmonic equivalent exists in scale
   */
  private isEnharmonicEquivalent(note: string, scale: string[]): boolean {
    const enharmonic = this.getEnharmonicEquivalent(note);
    return enharmonic ? scale.includes(enharmonic) : false;
  }

  /**
   * Get enharmonic equivalent of a note
   * @param note - Note to get equivalent for
   * @returns Enharmonic equivalent or null
   */
  private getEnharmonicEquivalent(note: string): string | null {
    const enharmonicMap: Record<string, string> = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#',
      'E#': 'F', 'Fb': 'E',
      'B#': 'C', 'Cb': 'B'
    };
    
    return enharmonicMap[note] || null;
  }

  /**
   * Create a default result when no key can be determined
   * @returns Default key detection result
   */
  private createDefaultResult(): KeyDetectionResult {
    return {
      key: 'C',
      confidence: 0,
      isMinor: false,
      analysis: {
        chordFrequency: {},
        progressionMatches: [],
        tonicIndicators: 0
      }
    };
  }

  /**
   * Get all possible keys with their confidence scores
   * @param text - Text containing chords
   * @param format - Format of the chord sheet
   * @returns Array of all key detection results sorted by confidence
   */
  public detectAllKeys(text: string, format: 'brackets' | 'inline' = 'brackets'): KeyDetectionResult[] {
    const chords = ChordParser.extractChordsFromText(text, format);
    
    if (chords.length === 0) {
      return [this.createDefaultResult()];
    }

    const majorResults = this.analyzeForMajorKeys(chords);
    const minorResults = this.analyzeForMinorKeys(chords);
    
    return [...majorResults, ...minorResults]
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect key from Nashville number notation
   * @param nashvilleText - Text containing Nashville numbers
   * @returns Key detection result
   */
  public detectKeyFromNashville(nashvilleText: string): KeyDetectionResult {
    // Extract Nashville numbers from text
    const nashvillePattern = /\b([#b]?[1-7][m°+]?(?:sus[24]?|add\d+|\d+)*)\b/g;
    const matches = nashvilleText.match(nashvillePattern) || [];
    
    if (matches.length === 0) {
      return this.createDefaultResult();
    }

    // Analyze patterns to determine if major or minor
    const hasMinorTonic = matches.some(chord => chord.includes('1m'));
    const hasMajorTonic = matches.some(chord => chord === '1' || chord.startsWith('1') && !chord.includes('m'));
    
    // Simple heuristic: if we see 1m, likely minor key; if we see 1, likely major
    const isMinor = hasMinorTonic && !hasMajorTonic;
    
    // For Nashville, we can't determine the specific key without additional context
    // Return a generic result indicating the mode
    return {
      key: isMinor ? 'Am' : 'C',
      confidence: 0.7,
      isMinor,
      analysis: {
        chordFrequency: this.countNashvilleChords(matches),
        progressionMatches: this.findProgressionMatches(matches, isMinor),
        tonicIndicators: matches.filter(chord => chord === '1' || chord === '1m').length
      }
    };
  }

  /**
   * Count frequency of Nashville chords
   * @param nashvilleChords - Array of Nashville chord strings
   * @returns Frequency map
   */
  private countNashvilleChords(nashvilleChords: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    for (const chord of nashvilleChords) {
      frequency[chord] = (frequency[chord] || 0) + 1;
    }
    return frequency;
  }
}