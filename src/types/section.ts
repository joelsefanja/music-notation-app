import { SectionType } from './format';
import { Chord } from './chord';
import { Annotation } from './chord';

/**
 * Represents a section within a chord sheet (verse, chorus, etc.)
 */
export interface Section {
  /** Type of section (verse, chorus, bridge, etc.) */
  type: SectionType;
  /** Display name of the section (e.g., "Verse 1", "Chorus") */
  name: string;
  /** Raw text content of the section */
  content: string;
  /** Array of chords found in this section */
  chords: Chord[];
  /** Array of annotations associated with this section */
  annotations: Annotation[];
}