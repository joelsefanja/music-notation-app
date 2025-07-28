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
  /** Album name */
  album?: string;
  /** Year of release */
  year?: string;
  /** Tempo/BPM if specified */
  tempo?: string | number;
  /** Time signature (e.g., "4/4", "3/4") */
  timeSignature?: string;
  /** Capo position if applicable */
  capo?: string | number;
  /** CCLI license number */
  ccli?: string;
  /** Guitar tuning */
  tuning?: string;
  /** Additional custom metadata */
  custom?: Record<string, string>;
}