import { Metadata } from '../types/metadata.types';

  /**
   * Represents the parsed result of a ChordPro file.
   */
  export interface ChordProParseResult {
    /** Metadata extracted from the ChordPro file. */
    metadata: Metadata;
    /** The song content with ChordPro directives removed or processed. */
    cleanedText: string;
  }

/**
 * Parser for handling ChordPro format, including metadata and directives.
 */
export class ChordProParser {
  // Regex for common ChordPro metadata directives
  private static readonly METADATA_REGEX = {
    title: /\{title:([^}]*)\}/i,
    artist: /\{artist:([^}]*)\}/i,
    key: /\{key:([^}]*)\}/i,
    tempo: /\{tempo:\s*(\d+)\}/i,
    time: /\{time:\s*(\d+\/\d+)\}/i,
    comment: /\{comment:([^}]*)\}/i,
  };

  /**
   * Parses a given text string in ChordPro format.
   * Extracts metadata, comments, and cleans the text.
   * @param text The ChordPro formatted text.
   * @returns A ChordProParseResult object containing parsed metadata and cleaned text.
   */
  public static parse(text: string): ChordProParseResult {
    const metadata: Metadata = {};
    let cleanedText = text;

    // Define directives with their regex and corresponding metadata property
    type MetadataProp = 'title' | 'artist' | 'key' | 'tempo' | 'timeSignature';
    const directives: Array<{ key: string; regex: RegExp; prop: MetadataProp | null }> = [
      { key: 'title', regex: this.METADATA_REGEX.title, prop: 'title' },
      { key: 'artist', regex: this.METADATA_REGEX.artist, prop: 'artist' },
      { key: 'key', regex: this.METADATA_REGEX.key, prop: 'key' },
      { key: 'tempo', regex: this.METADATA_REGEX.tempo, prop: 'tempo' },
      { key: 'time', regex: this.METADATA_REGEX.time, prop: 'timeSignature' }, // Map 'time' directive to 'timeSignature' property
      { key: 'comment', regex: this.METADATA_REGEX.comment, prop: null }, // Comment is not stored in metadata
    ];

    // Process each known metadata directive
    for (const directive of directives) {
      const match = cleanedText.match(directive.regex);
      if (match && match[1]) {
        const value = match[1].trim();
        if (directive.prop) {
          // Assign value to metadata, handling type conversions for tempo
          if (directive.prop === 'tempo') {
            const tempoValue = parseInt(value, 10);
            if (!isNaN(tempoValue)) {
                metadata[directive.prop] = tempoValue;
            }
          } else if (directive.prop === 'timeSignature') {
            metadata[directive.prop] = value;
          } else { // Handles title, artist, key
            metadata[directive.prop] = value;
          }
        }
        // Remove the matched directive from the text to clean it
        cleanedText = cleanedText.replace(match[0], '');
      }
    }

    // Clean up extra newlines that might result from directive removal
    cleanedText = cleanedText.replace(/\n\s*\n/g, '\n\n').trim();

    return {
      metadata,
      cleanedText,
    };
  }
}
