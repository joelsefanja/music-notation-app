
// src/types/line.ts

/**
 * Enumeration of supported music notation formats
 */
export enum NotationFormat {
  NASHVILLE = 'nashville',
  ONSONG = 'onsong',
  SONGBOOK = 'songbook',
  CHORDPRO = 'chordpro',
  GUITAR_TABS = 'guitar_tabs',
  PCO = "PCO"
}

/**
 * Enumeration of section types in chord sheets
 */
export enum SectionType {
  VERSE = 'verse',
  CHORUS = 'chorus',
  BRIDGE = 'bridge',
  INTRO = 'intro',
  OUTRO = 'outro',
  INSTRUMENTAL = 'instrumental',
  PRE_CHORUS = 'pre_chorus',
  POST_CHORUS = 'post_chorus',
  TAG = 'tag',
  VAMP = 'vamp',
  INTERLUDE = 'interlude',
  SOLO = 'solo',
  BREAK = 'break',
  OTHER = 'other'
}

/**
 * Enumeration of annotation formats
 */
export enum AnnotationFormat {
  ONSONG = 'onsong',        // *Comment
  SONGBOOK = 'songbook',    // (Comment)
  PCO = 'pco',              // <b>Comment</b>
  CHORDPRO = 'chordpro',    // {comment: ...} or {c: ...}
  GUITAR_TABS = 'guitar_tabs' // *Comment or [Section]
}

/**
 * Interface for a chord with its position information
 */
export interface Chord {
  value: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
  placement?: 'above' | 'inline' | 'between';
}

/**
 * Represents a parsed chord with its position in a line.
 */
export interface ChordPlacement {
  value: string;         // De genormaliseerde akkoordwaarde (bijv. "Cmaj7")
  originalText: string;  // De originele tekst van het akkoord (bijv. "[Cmaj7]" of "{Cmaj7}")
  startIndex: number;    // Startindex van het akkoord in de originele lijn
  endIndex: number;      // Eindindex van het akkoord in de originele lijn
  placement?: 'above' | 'inline' | 'between'; // Hoe het akkoord t.o.v. de tekst is geplaatst
}

/**
 * Base interface for all line types
 */
export interface BaseLine {
  type: string;
  content: string;
  lineNumber?: number;
  metadata?: Record<string, any>;
}

/**
 * Basisinterface voor alle soorten lijnen in een geanalyseerd document.
 */
export interface Line {
  type: 'text' | 'empty' | 'annotation' | 'chord' | 'lyric';
  lineNumber: number; // Het originele regelnummer in de invoertekst
}

/**
 * Chord line type
 */
export interface ChordLine extends BaseLine {
  type: 'chord';
  chords: Chord[];
}

/**
 * Lyric line type
 */
export interface LyricLine extends BaseLine {
  type: 'lyric';
  lyrics: string;
}

/**
 * Representeert een tekstregel met optionele akkoorden.
 */
export interface TextLine extends Line {
  type: 'text';
  text: string;
  chords: ChordPlacement[];
}

/**
 * Representeert een lege regel.
 */
export interface EmptyLine extends Line {
  type: 'empty';
  count: number; // Aantal opeenvolgende lege regels
}

/**
 * Representeert een annotatieregel (bijv. commentaren, sectietitels).
 */
export interface AnnotationLine extends BaseLine {
  type: 'annotation';
  annotation: string;
  value?: string; // De inhoud van de annotatie (bijv. "Verse 1", "Chorus")
  annotationType?: 'comment' | 'section' | 'instruction' | 'tempo' | 'dynamics'; // Classificatie van de annotatie
}

/**
 * Nashville Number System akkoordrepresentatie
 */
export interface NashvilleChord {
  number: number;           // 1-7
  quality: NashvilleQuality;
  accidental?: '#' | 'b';
  extensions: string[];
  bassNumber?: number;
  bassAccidental?: '#' | 'b';
  rhythmicSymbols: RhythmicSymbol[];
}

/**
 * Nashville akkoordkwaliteiten
 */
export enum NashvilleQuality {
  MAJOR = '',
  MINOR = 'm',
  DIMINISHED = '°',
  AUGMENTED = '+',
  SUSPENDED = 'sus'
}

/**
 * Ritmische symbolen gebruikt in Nashville Number System
 */
export interface RhythmicSymbol {
  symbol: '◆' | '^' | '.' | '<' | '>';
  position: 'before' | 'after';
  meaning: string;
}

// Type guards for runtime checking
export const isChordLine = (line: Line): line is TextLine => {
  return line.type === 'text' && 'chords' in line;
};

export const isLyricLine = (line: Line): line is TextLine => {
  return line.type === 'text';
};

export const isTextLine = (line: Line): line is TextLine => {
  return line.type === 'text';
};

export const isEmptyLine = (line: Line): boolean => {
  return line.type === 'empty';
};

export const isAnnotationLine = (line: Line): line is AnnotationLine => {
  return line.type === 'annotation';
};

export const validateLine = (line: Line): boolean => {
  return line !== undefined;
};
