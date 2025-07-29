/**
 * Enhanced Parser Registry implementation with improved Registry pattern
 * Provides dynamic registration, validation, and advanced parser management
 */

import { 
  IParserRegistry, 
  IParser, 
  IFormatValidator 
} from '../../../types/interfaces/core-interfaces';
import { NotationFormat } from '../../../types/format';
import { ChordProParser } from '../format-parsers/formats/chordpro-parser';
import { OnSongParser } from '../format-parsers/formats/onsong-parser';
import { SongbookParser } from '../format-parsers/formats/songbook-parser';
import { NashvilleParser } from '../format-parsers/formats/nashville-parser';
import { PlanningCenterParser } from '../format-parsers/formats/planning-center-parser';
import { GuitarTabsParser } from '../format-parsers/formats/guitar-tabs-parser';

/**
 * Parser registration information
 */
interface ParserRegistration {
  parser: IParser;
  validator?: IFormatValidator;
  priority: number;
  metadata: {
    name: string;
    version: string;
    description: string;
    author?: string;
    capabilities: string[];
    registeredAt: Date;
  };
}

/**
 * Enhanced parser registry with validation and metadata support
 */
export class EnhancedParserRegistry implements IParserRegistry {
  private parsers = new Map<NotationFormat, ParserRegistration>();
  private aliases = new Map<string, NotationFormat>();
  private capabilities = new Map<string, NotationFormat[]>();

  /**
   * Register a parser for a specific format
   */
  registerParser(format: NotationFormat, parser: IParser): void {
    if (!this.validateParser(parser)) {
      throw new Error(`Invalid parser for format ${format}`);
    }

    const registration: ParserRegistration = {
      parser,
      priority: 0,
      metadata: {
        name: parser.constructor.name,
        version: '1.0.0',
        description: `Parser for ${format} format`,
        capabilities: [],
        registeredAt: new Date()
      }
    };

    this.parsers.set(format, registration);
    this.updateCapabilities(format, registration.metadata.capabilities);
  }

  /**
   * Register a parser with full metadata
   */
  registerParserWithMetadata(
    format: NotationFormat,
    parser: IParser,
    metadata: {
      name?: string;
      version?: string;
      description?: string;
      author?: string;
      capabilities?: string[];
      priority?: number;
    },
    validator?: IFormatValidator
  ): void {
    if (!this.validateParser(parser)) {
      throw new Error(`Invalid parser for format ${format}`);
    }

    const registration: ParserRegistration = {
      parser,
      validator,
      priority: metadata.priority || 0,
      metadata: {
        name: metadata.name || parser.constructor.name,
        version: metadata.version || '1.0.0',
        description: metadata.description || `Parser for ${format} format`,
        author: metadata.author,
        capabilities: metadata.capabilities || [],
        registeredAt: new Date()
      }
    };

    this.parsers.set(format, registration);
    this.updateCapabilities(format, registration.metadata.capabilities);
  }

  /**
   * Get parser for a specific format
   */
  getParser(format: NotationFormat): IParser | undefined {
    const registration = this.parsers.get(format);
    return registration?.parser;
  }

  /**
   * Get parser registration information
   */
  getParserRegistration(format: NotationFormat): ParserRegistration | undefined {
    return this.parsers.get(format);
  }

  /**
   * Get all supported formats
   */
  getSupportedFormats(): NotationFormat[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * Check if a format is supported for parsing
   */
  isParsingSupported(format: NotationFormat): boolean {
    return this.parsers.has(format);
  }

  /**
   * Validate a parser implementation
   */
  validateParser(parser: IParser): boolean {
    try {
      // Check if parser has required methods
      if (typeof parser.parse !== 'function') {
        return false;
      }

      if (typeof parser.isValid !== 'function') {
        return false;
      }

      if (typeof parser.getSupportedFormat !== 'function') {
        return false;
      }

      // Test with empty input to ensure it doesn't crash
      const isValidResult = parser.isValid('');
      if (typeof isValidResult !== 'boolean') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unregister a parser
   */
  unregisterParser(format: NotationFormat): boolean {
    const registration = this.parsers.get(format);
    if (registration) {
      this.parsers.delete(format);
      this.removeCapabilities(format, registration.metadata.capabilities);
      return true;
    }
    return false;
  }

  /**
   * Register a format alias
   */
  registerAlias(alias: string, format: NotationFormat): void {
    if (!this.isParsingSupported(format)) {
      throw new Error(`Cannot create alias for unsupported format: ${format}`);
    }
    this.aliases.set(alias.toLowerCase(), format);
  }

  /**
   * Resolve format from alias
   */
  resolveFormat(formatOrAlias: string): NotationFormat | undefined {
    // Try direct format match first
    const directFormat = Object.values(NotationFormat).find(
      format => format.toLowerCase() === formatOrAlias.toLowerCase()
    );

    if (directFormat) {
      return directFormat;
    }

    // Try alias resolution
    return this.aliases.get(formatOrAlias.toLowerCase());
  }

  /**
   * Get parsers by capability
   */
  getParsersByCapability(capability: string): Array<{ format: NotationFormat; parser: IParser }> {
    const formats = this.capabilities.get(capability) || [];
    return formats.map(format => ({
      format,
      parser: this.getParser(format)!
    }));
  }

  /**
   * Get parser capabilities
   */
  getParserCapabilities(format: NotationFormat): string[] {
    const registration = this.parsers.get(format);
    return registration?.metadata.capabilities || [];
  }

  /**
   * Get all registered capabilities
   */
  getAllCapabilities(): string[] {
    return Array.from(this.capabilities.keys());
  }

  /**
   * Get parser metadata
   */
  getParserMetadata(format: NotationFormat): ParserRegistration['metadata'] | undefined {
    const registration = this.parsers.get(format);
    return registration?.metadata;
  }

  /**
   * Get parsers sorted by priority
   */
  getParsersByPriority(): Array<{ format: NotationFormat; parser: IParser; priority: number }> {
    const registrations = Array.from(this.parsers.entries());

    return registrations
      .sort(([, a], [, b]) => b.priority - a.priority)
      .map(([format, registration]) => ({
        format,
        parser: registration.parser,
        priority: registration.priority
      }));
  }

  /**
   * Set parser priority
   */
  setParserPriority(format: NotationFormat, priority: number): void {
    const registration = this.parsers.get(format);
    if (registration) {
      registration.priority = priority;
    }
  }

  /**
   * Find best parser for input text
   */
  findBestParser(input: string): { format: NotationFormat; parser: IParser; confidence: number } | undefined {
    const candidates: Array<{ format: NotationFormat; parser: IParser; confidence: number }> = [];

    for (const [format, registration] of this.parsers) {
      try {
        if (registration.parser.isValid(input)) {
          // Calculate confidence based on validation and priority
          let confidence = 0.5; // Base confidence for valid input

          // Add priority bonus
          confidence += (registration.priority / 100);

          // Add format-specific confidence (this would be more sophisticated in practice)
          if (registration.validator) {
            const validationResult = registration.validator.validate(input);
            if (validationResult.isValid) {
              confidence += 0.3;
            }
          }

          candidates.push({ format, parser: registration.parser, confidence });
        }
      } catch {
        // Parser validation failed, skip
      }
    }

    // Return the parser with highest confidence
    return candidates.sort((a, b) => b.confidence - a.confidence)[0];
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalParsers: number;
    totalAliases: number;
    totalCapabilities: number;
    formatDistribution: Record<string, number>;
    averagePriority: number;
  } {
    const totalParsers = this.parsers.size;
    const totalAliases = this.aliases.size;
    const totalCapabilities = this.capabilities.size;

    const formatDistribution: Record<string, number> = {};
    let totalPriority = 0;

    for (const [format, registration] of this.parsers) {
      formatDistribution[format] = 1;
      totalPriority += registration.priority;
    }

    return {
      totalParsers,
      totalAliases,
      totalCapabilities,
      formatDistribution,
      averagePriority: totalParsers > 0 ? totalPriority / totalParsers : 0
    };
  }

  /**
   * Export registry configuration
   */
  exportConfiguration(): {
    parsers: Array<{
      format: NotationFormat;
      metadata: ParserRegistration['metadata'];
      priority: number;
      capabilities: string[];
    }>;
    aliases: Record<string, NotationFormat>;
  } {
    const parsers = Array.from(this.parsers.entries()).map(([format, registration]) => ({
      format,
      metadata: registration.metadata,
      priority: registration.priority,
      capabilities: registration.metadata.capabilities
    }));

    const aliases = Object.fromEntries(this.aliases);

    return { parsers, aliases };
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.parsers.clear();
    this.aliases.clear();
    this.capabilities.clear();
  }

  /**
   * Get all parsers (for testing purposes)
   */
  getAllParsers(): Map<NotationFormat, IParser> {
    const result = new Map<NotationFormat, IParser>();
    for (const [format, registration] of this.parsers) {
      result.set(format, registration.parser);
    }
    return result;
  }

  /**
   * Clone the registry
   */
  clone(): EnhancedParserRegistry {
    const clone = new EnhancedParserRegistry();

    // Copy parsers
    for (const [format, registration] of this.parsers) {
      clone.parsers.set(format, { ...registration });
    }

    // Copy aliases
    for (const [alias, format] of this.aliases) {
      clone.aliases.set(alias, format);
    }

    // Copy capabilities
    for (const [capability, formats] of this.capabilities) {
      clone.capabilities.set(capability, [...formats]);
    }

    return clone;
  }

  private updateCapabilities(format: NotationFormat, capabilities: string[]): void {
    for (const capability of capabilities) {
      if (!this.capabilities.has(capability)) {
        this.capabilities.set(capability, []);
      }
      const formats = this.capabilities.get(capability)!;
      if (!formats.includes(format)) {
        formats.push(format);
      }
    }
  }

  private removeCapabilities(format: NotationFormat, capabilities: string[]): void {
    for (const capability of capabilities) {
      const formats = this.capabilities.get(capability);
      if (formats) {
        const index = formats.indexOf(format);
        if (index > -1) {
          formats.splice(index, 1);
        }
        if (formats.length === 0) {
          this.capabilities.delete(capability);
        }
      }
    }
  }

  // Register built-in parsers
  registerBuiltInParsers(): void {
    this.registerParser(NotationFormat.CHORDPRO, new ChordProParser());
    this.registerParser(NotationFormat.ONSONG, new OnSongParser());
    this.registerParser(NotationFormat.SONGBOOK, new SongbookParser());
    this.registerParser(NotationFormat.NASHVILLE, new NashvilleParser());
    this.registerParser(NotationFormat.PCO, new PlanningCenterParser());
    this.registerParser(NotationFormat.GUITAR_TABS, new GuitarTabsParser());
  }
}