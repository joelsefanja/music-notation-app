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
  INTERLUDE = 'interlude'
}

/**
 * Enumeration of annotation formats
 */
export enum AnnotationFormat {
  ONSONG = 'onsong',        // *Comment
  SONGBOOK = 'songbook',    // (Comment)
  PCO = 'pco',              // <b>Comment</b>
  CHORDPRO = 'chordpro',     // {comment: ...} or {c: ...}
  GUITAR_TABS = 'guitar_tabs' // *Comment
}
