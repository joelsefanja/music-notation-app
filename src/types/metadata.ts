/**
 * Metadata information for a chord sheet
 */
export interface Metadata {
  /** Song title */
  title?: string;
  /** Artist or composer name */
  artist?: string;
  /** Original key of the song */
  key?: string;
  /** Tempo/BPM if specified */
  tempo?: number;
  /** Time signature (e.g., "4/4", "3/4") */
  timeSignature?: string;
  /** Capo position if applicable */
  capo?: number;
  /** Additional custom metadata */
  custom?: Record<string, string>;
}