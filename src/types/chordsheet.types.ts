import { NotationFormat } from './format.types';
import { Section } from './section.types';
import { Metadata } from './metadata.types';

/**
 * Represents a complete chord sheet document
 */
export interface ChordSheet {
  /** Unique identifier for the chord sheet */
  id: string;
  /** Song title (convenience property, also in metadata) */
  title?: string;
  /** Artist name (convenience property, also in metadata) */
  artist?: string;
  /** Key of the song (convenience property, also in metadata) */
  key?: string;
  /** Format of the chord sheet */
  format: NotationFormat;
  /** Raw content of the chord sheet */
  content: string;
  /** Parsed sections of the chord sheet */
  sections: Section[];
  /** Metadata associated with the chord sheet */
  metadata: Metadata;
}