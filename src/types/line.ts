// src/types/index.ts

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
 * Interface for a musical section, potentially containing chords or other content.
 */
export interface Section {
  id: string; // Unieke identificatie voor de sectie
  type: SectionType; // Type sectie (bijv. 'verse', 'chorus')
  name?: string; // Optionele naam voor de sectie (bijv. "Verse 1")
  content: string; // De tekstuele inhoud van de sectie (bijv. songteksten)
  chords?: ChordPlacement[]; // Optioneel: een array van akkoorden die aan deze sectie zijn gekoppeld
  title?: string; // Optioneel: een titel voor de sectie
  // Voeg hier andere eigenschappen toe die relevant zijn voor je app
}

/**
 * Interface for an annotation.
 */
export interface Annotation {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  format: AnnotationFormat;
  position: 'above' | 'inline' | 'beside'; // Waar de annotatie geplaatst wordt t.o.v. de tekst
  annotationType: 'comment' | 'section' | 'instruction' | 'tempo' | 'dynamics'; // Classificatie van de annotatie
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
 * Basisinterface voor alle soorten lijnen in een geanalyseerd document.
 */
export interface Line {
  type: 'text' | 'empty' | 'annotation';
  lineNumber: number; // Het originele regelnummer in de invoertekst
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
export interface AnnotationLine extends Line {
  type: 'annotation';
  value: string; // De inhoud van de annotatie (bijv. "Verse 1", "Chorus")
  annotationType: 'comment' | 'section' | 'instruction' | 'tempo' | 'dynamics'; // Classificatie van de annotatie
}

/**
 * Resultaat van het parsen van een annotatie, inclusief de originele tekst en positie.
 */
export interface IAnnotationParseResult {
  annotation: Annotation;
  originalText: string;
  startIndex: number;
  endIndex: number;
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
  return line.type === 'text' && line.chords !== undefined;
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

// Export the actual line types that are missing
export interface BaseLine {
  type: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface ChordLine extends BaseLine {
  type: 'chord';
  chords: Chord[];
}

export interface LyricLine extends BaseLine {
  type: 'lyric';
  lyrics: string;
}

export interface AnnotationLine extends BaseLine {
  type: 'annotation';
  annotation: string;
}