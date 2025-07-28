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
  SOLO = 'solo', // Toegevoegd van eerdere versie
  BREAK = 'break', // Toegevoegd van eerdere versie
  OTHER = 'other' // Toegevoegd van eerdere versie
}

/**
 * Enumeration of annotation formats
 */
export enum AnnotationFormat {
  ONSONG = 'onsong',        // *Comment
  SONGBOOK = 'songbook',    // (Comment)
  PCO = 'pco',              // <b>Comment</b>
  CHORDPRO = 'chordpro',    // {comment: ...} or {c: ...}
  GUITAR_TABS = 'guitar_tabs' // *Comment
}

/**
 * Interface for a musical section, potentially containing chords or other content.
 */
export interface Section {
    id: string; // Unieke identificatie voor de sectie
    type: SectionType; // Type sectie (bijv. 'verse', 'chorus')
    name?: string; // Optionele naam voor de sectie (bijv. "Verse 1")
    content: string; // De tekstuele inhoud van de sectie (bijv. songteksten)
    chords?: any[]; // Optioneel: een array van akkoorden die aan deze sectie zijn gekoppeld
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
  }
