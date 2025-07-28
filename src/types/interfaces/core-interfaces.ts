/**
 * Core interfaces for the conversion engine following SOLID principles
 * These interfaces define the contracts for all major components
 */

import { NotationFormat } from '../line';
import { ConversionResult, ConversionOptions } from '../conversion-result';
import { ConversionError } from '../conversion-error';
import { CanonicalSongModel } from '../canonical-model';
import { Chord } from '../chord';

// ============================================================================
// DEPENDENCY INJECTION INTERFACES
// ============================================================================

/**
 * Dependency injection container interface
 */
export interface IDependencyContainer {
  register<T>(token: string, factory: () => T): void;
  registerSingleton<T>(token: string, factory: () => T): void;
  resolve<T>(token: string): T;
  isRegistered(token: string): boolean;
}

// ============================================================================
// PARSING INTERFACES
// ============================================================================

/**
 * Base parser interface following Single Responsibility Principle
 */
export interface IParser {
  parse(text: string): Promise<ParseResult>;
  isValid(text: string): boolean;
  getSupportedFormat(): NotationFormat;
}

/**
 * Format validator interface (Interface Segregation Principle)
 */
export interface IFormatValidator {
  validate(text: string): ValidationResult;
  getSupportedFormat(): NotationFormat;
}

/**
 * Chord extraction strategy interface (Strategy Pattern)
 */
export interface IChordExtractionStrategy {
  extractChords(line: string): ChordPlacement[];
  isChordLine(line: string): boolean;
  getSupportedFormat(): NotationFormat;
}

/**
 * Parser registry interface (Registry Pattern)
 */
export interface IParserRegistry {
  registerParser(format: NotationFormat, parser: IParser): void;
  getParser(format: NotationFormat): IParser | undefined;
  getSupportedFormats(): NotationFormat[];
  isParsingSupported(format: NotationFormat): boolean;
  validateParser(parser: IParser): boolean;
}

// ============================================================================
// CHORD SERVICE INTERFACES
// ============================================================================

/**
 * Chord factory interface (Factory Pattern)
 */
export interface IChordFactory {
  createChord(chordString: string, position?: number): IChord;
  createNashvilleChord(number: number, quality: NashvilleQuality): INashvilleChord;
  createChordFromComponents(components: ChordComponents): IChord;
  isValidChord(chordString: string): boolean;
}

/**
 * Chord builder interface (Builder Pattern)
 */
export interface IChordBuilder {
  setRoot(root: string): IChordBuilder;
  setQuality(quality: ChordQuality): IChordBuilder;
  setExtensions(extensions: ChordExtension[]): IChordBuilder;
  addExtension(extension: ChordExtension): IChordBuilder;
  addExtensionByValue(type: 'add' | 'sus' | 'maj' | 'min' | 'dim' | 'aug', value: string): IChordBuilder;
  setBassNote(bassNote?: string): IChordBuilder;
  setPosition(position: number): IChordBuilder;
  setOriginalNotation(notation: string): IChordBuilder;
  setNashvilleNumber(number?: string): IChordBuilder;
  setProperties(properties: {
    root?: string;
    quality?: ChordQuality;
    extensions?: ChordExtension[];
    bassNote?: string;
    originalNotation?: string;
    nashvilleNumber?: string;
    position?: number;
  }): IChordBuilder;
  build(): IChord;
  reset(): IChordBuilder;
  clone(): IChordBuilder;
  buildMajor(root: string, originalNotation?: string): IChord;
  buildMinor(root: string, originalNotation?: string): IChord;
  buildDominant7(root: string, originalNotation?: string): IChord;
  buildMajor7(root: string, originalNotation?: string): IChord;
  buildMinor7(root: string, originalNotation?: string): IChord;
  buildSuspended(root: string, suspensionType?: '2' | '4', originalNotation?: string): IChord;
}

/**
 * Chord parser interface
 */
export interface IChordParser {
  parse(chordString: string): ChordComponents;
  isValid(chordString: string): boolean;
}

/**
 * Chord validator interface
 */
export interface IChordValidator {
  validate(components: ChordComponents): ValidationResult;
  validateChord(chord: IChord): ValidationResult;
}

// ============================================================================
// KEY TRANSPOSITION INTERFACES
// ============================================================================

/**
 * Transpose command interface (Command Pattern)
 */
export interface ITransposeCommand {
  execute(): Promise<void>;
  undo(): Promise<void>;
  getDescription(): string;
  canUndo(): boolean;
}

/**
 * Command manager interface
 */
export interface ITransposeCommandManager {
  executeCommand(command: ITransposeCommand): Promise<void>;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  canUndo(): boolean;
  canRedo(): boolean;
  getHistory(): string[];
  clearHistory(): void;
}

/**
 * Key transposer interface
 */
export interface IKeyTransposer {
  transposeChord(chord: IChord, semitones: number, targetKey?: string): IChord;
  transposeNote(note: string, semitones: number, targetKey?: string): string;
  getKeyDistance(fromKey: string, toKey: string): number;
  createTransposeCommand(model: CanonicalSongModel, fromKey: string, toKey: string): ITransposeCommand;
}

// ============================================================================
// NASHVILLE CONVERTER INTERFACES
// ============================================================================

/**
 * Nashville builder interface (Builder Pattern)
 */
export interface INashvilleBuilder {
  setKey(key: string): INashvilleBuilder;
  setTimeSignature(timeSignature: string): INashvilleBuilder;
  addChordProgression(progression: number[]): INashvilleBuilder;
  setRhythmicNotation(enabled: boolean): INashvilleBuilder;
  setBarNotation(enabled: boolean): INashvilleBuilder;
  build(): INashvilleNotation;
  reset(): INashvilleBuilder;
}

/**
 * Nashville notation director interface
 */
export interface INashvilleNotationDirector {
  buildBasicProgression(key: string): INashvilleNotation;
  buildComplexProgression(key: string): INashvilleNotation;
  buildCustomProgression(key: string, progression: number[]): INashvilleNotation;
}

// ============================================================================
// ERROR RECOVERY INTERFACES
// ============================================================================

/**
 * Error recovery handler interface (Chain of Responsibility Pattern)
 */
export interface IErrorRecoveryHandler {
  setNext(handler: IErrorRecoveryHandler): IErrorRecoveryHandler;
  handle(error: ConversionError, context: any): Promise<ErrorRecoveryResult>;
  canHandle(error: ConversionError): boolean;
}

/**
 * Error recovery service interface
 */
export interface IErrorRecoveryService {
  recover(error: ConversionError, context: any): Promise<ErrorRecoveryResult>;
  addHandler(handler: IErrorRecoveryHandler): void;
  removeHandler(handler: IErrorRecoveryHandler): void;
}

// ============================================================================
// STORAGE INTERFACES
// ============================================================================

/**
 * Storage adapter interface (Adapter Pattern)
 */
export interface IStorageAdapter {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  delete(path: string): Promise<void>;
  list(directory: string): Promise<string[]>;
}

/**
 * Storage service interface
 */
export interface IStorageService {
  saveConversionResult(result: ConversionResult, filename: string): Promise<void>;
  loadConversionHistory(): Promise<ConversionResult[]>;
  saveCanonicalModel(model: CanonicalSongModel, filename: string): Promise<void>;
  loadCanonicalModel(filename: string): Promise<CanonicalSongModel>;
}

// ============================================================================
// EVENT SYSTEM INTERFACES
// ============================================================================

/**
 * Event manager interface (Observer Pattern)
 */
export interface IEventManager {
  publish<T extends DomainEvent>(eventType: string, event: T): void;
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  clear(): void;
}

/**
 * Event handler type
 */
export type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

// ============================================================================
// CONVERSION ENGINE INTERFACES
// ============================================================================

/**
 * Conversion engine interface (Facade Pattern)
 */
export interface IConversionEngine {
  convert(request: IConversionRequest): Promise<ConversionResult>;
  detectFormat(text: string): FormatDetectionResult;
  detectKey(text: string): KeyDetectionResult;
}

/**
 * Format detector interface
 */
export interface IFormatDetector {
  detectFormat(text: string): FormatDetectionResult;
  detectAllFormats(text: string): FormatDetectionResult[];
}

// ============================================================================
// SUPPORTING TYPES AND INTERFACES
// ============================================================================

/**
 * Enhanced conversion request interface
 */
export interface IConversionRequest {
  readonly input: string;
  readonly sourceFormat?: NotationFormat;
  readonly targetFormat: NotationFormat;
  readonly transposeOptions?: ITransposeOptions;
  readonly conversionOptions?: ConversionOptions;
}

/**
 * Transpose options interface
 */
export interface ITransposeOptions {
  readonly fromKey: string;
  readonly toKey: string;
  readonly preserveOriginalKey?: boolean;
}

/**
 * Parse result interface
 */
export interface ParseResult {
  success: boolean;
  canonicalModel?: CanonicalSongModel;
  errors?: ConversionError[];
  warnings?: string[];
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Error recovery result interface
 */
export interface ErrorRecoveryResult {
  success: boolean;
  partialResult?: any;
  errors: ConversionError[];
  warnings: string[];
}

/**
 * Format detection result interface
 */
export interface FormatDetectionResult {
  format: NotationFormat;
  confidence: number;
}

/**
 * Key detection result interface
 */
export interface KeyDetectionResult {
  key: string;
  isMinor: boolean;
  confidence: number;
}

/**
 * Chord placement interface
 */
export interface ChordPlacement {
  chord: IChord;
  startIndex: number;
  endIndex: number;
  placement: 'above' | 'inline' | 'between';
}

/**
 * Enhanced chord interface
 */
export interface IChord {
  readonly root: string;
  readonly quality: ChordQuality;
  readonly extensions: ChordExtension[];
  readonly bassNote?: string;
  readonly originalNotation: string;
  readonly nashvilleNumber?: string;
  readonly position: number;
}

/**
 * Nashville chord interface
 */
export interface INashvilleChord {
  readonly number: number;
  readonly quality: NashvilleQuality;
  readonly accidental?: '#' | 'b';
  readonly extensions: string[];
  readonly bassNumber?: number;
  readonly bassAccidental?: '#' | 'b';
  readonly rhythmicSymbols: RhythmicSymbol[];
}

/**
 * Nashville notation interface
 */
export interface INashvilleNotation {
  readonly key: string;
  readonly timeSignature?: string;
  readonly chords: INashvilleChord[];
  readonly rhythmicSymbols: RhythmicSymbol[];
  readonly barLines: BarLine[];
  readonly includeRhythm: boolean;
  readonly includeBarLines: boolean;
}

/**
 * Chord components interface
 */
export interface ChordComponents {
  root: string;
  quality: string;
  extensions: string[];
  bassNote?: string;
}

/**
 * Domain event base class
 */
export abstract class DomainEvent {
  readonly timestamp = new Date();
  readonly id = crypto.randomUUID();
  abstract readonly type: string;
}

// ============================================================================
// ENUMS AND VALUE OBJECTS
// ============================================================================

/**
 * Chord quality enum
 */
export enum ChordQuality {
  MAJOR = 'maj',
  MINOR = 'min',
  DIMINISHED = 'dim',
  AUGMENTED = 'aug',
  SUSPENDED = 'sus',
  DOMINANT = 'dom'
}

/**
 * Chord extension interface
 */
export interface ChordExtension {
  type: 'add' | 'sus' | 'maj' | 'min' | 'dim' | 'aug';
  value: string;
  position: number;
}

/**
 * Nashville quality enum
 */
export enum NashvilleQuality {
  MAJOR = '',
  MINOR = 'm',
  DIMINISHED = '°',
  AUGMENTED = '+',
  SUSPENDED = 'sus'
}

/**
 * Rhythmic symbol interface
 */
export interface RhythmicSymbol {
  symbol: '◆' | '^' | '.' | '<' | '>';
  position: 'before' | 'after';
  meaning: string;
}

/**
 * Bar line interface
 */
export interface BarLine {
  position: number;
  type: 'single' | 'double' | 'repeat_start' | 'repeat_end';
}

/**
 * Error recovery level enum
 */
export enum ErrorRecoveryLevel {
  STRICT = 'strict',
  MODERATE = 'moderate',
  PERMISSIVE = 'permissive'
}