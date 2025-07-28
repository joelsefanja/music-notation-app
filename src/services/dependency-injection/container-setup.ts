/**
 * Dependency Injection Container Setup
 * Configures all services with proper dependency injection
 */

import { DependencyContainer, DI_TOKENS } from './dependency-container';

// Core interfaces
import {
  IConversionEngine,
  IParserRegistry,
  IFormatDetector,
  IEventManager,
  IErrorRecoveryService,
  IChordFactory,
  IChordParser,
  IChordValidator,
  IKeyTransposer,
  ITransposeCommandManager,
  INashvilleBuilder,
  INashvilleNotationDirector,
  IStorageAdapter,
  IStorageService,
  DomainEvent // Assuming DomainEvent is imported or defined elsewhere
} from '../../types/interfaces/core-interfaces';

// Implementations
import { EnhancedConversionEngine } from '../conversion-engine/enhanced-conversion-engine';
import { EnhancedParserRegistry } from '../conversion-engine/registry/enhanced-parser-registry';
import { EnhancedFormatDetector } from '../conversion-engine/enhanced-format-detector';
import { EventManager } from '../events/event-manager';
import { ErrorRecoveryService } from '../conversion-engine/error-recovery/error-recovery-service';
import { ChordFactory } from '../conversion-engine/chord/chord-factory';
import { ChordParser } from '../conversion-engine/chord/chord-parser';
import { ChordValidator } from '../conversion-engine/chord/chord-validator';
import { KeyTransposer } from '../conversion-engine/transposition/key-transposer';
import { TransposeCommandManager } from '../conversion-engine/transposition/transpose-command-manager';
import { NashvilleBuilder } from '../conversion-engine/nashville/nashville-builder';
import { NashvilleNotationDirector } from '../conversion-engine/nashville/nashville-notation-director';
import { FileSystemStorageAdapter, InMemoryStorageAdapter } from '../storage/storage-adapter';
import { StorageService } from '../storage/storage-service';

// Define a specific interface for ConversionError events
// Removed 'id: string;' as it's inherited from DomainEvent and causes type conflict
interface IConversionErrorEvent extends DomainEvent {
  error: Error; // The error object associated with the conversion error
}

/**
 * Configure the dependency injection container with all services
 */
export function setupDependencyContainer(
  container: DependencyContainer,
  options: {
    storageType?: 'filesystem' | 'memory';
    storagePath?: string;
    errorRecoveryLevel?: 'strict' | 'moderate' | 'permissive';
  } = {}
): void {
  const {
    storageType = 'filesystem',
    storagePath = './storage',
    errorRecoveryLevel = 'moderate'
  } = options;

  // Register storage adapter
  container.registerSingleton(DI_TOKENS.STORAGE_ADAPTER, () => {
    switch (storageType) {
      case 'memory':
        return new InMemoryStorageAdapter();
      case 'filesystem':
      default:
        return new FileSystemStorageAdapter(storagePath);
    }
  });

  // Register storage service
  container.registerSingleton(DI_TOKENS.STORAGE_SERVICE, () => {
    const adapter = container.resolve<IStorageAdapter>(DI_TOKENS.STORAGE_ADAPTER);
    return new StorageService(adapter);
  });

  // Register event manager
  container.registerSingleton(DI_TOKENS.EVENT_MANAGER, () => {
    return new EventManager();
  });

  // Register chord services
  container.registerSingleton(DI_TOKENS.CHORD_PARSER, () => {
    return new ChordParser();
  });

  container.registerSingleton(DI_TOKENS.CHORD_VALIDATOR, () => {
    return new ChordValidator();
  });

  container.registerSingleton(DI_TOKENS.CHORD_FACTORY, () => {
    const parser = container.resolve<IChordParser>(DI_TOKENS.CHORD_PARSER);
    const validator = container.resolve<IChordValidator>(DI_TOKENS.CHORD_VALIDATOR);
    return new ChordFactory(parser, validator);
  });

  // Register key transposition services
  container.registerSingleton(DI_TOKENS.KEY_TRANSPOSER, () => {
    return new KeyTransposer();
  });

  container.registerSingleton(DI_TOKENS.TRANSPOSE_COMMAND_MANAGER, () => {
    return new TransposeCommandManager();
  });

  // Register Nashville services
  container.registerSingleton(DI_TOKENS.NASHVILLE_BUILDER, () => {
    return new NashvilleBuilder();
  });

  container.registerSingleton(DI_TOKENS.NASHVILLE_DIRECTOR, () => {
    const builder = container.resolve<INashvilleBuilder>(DI_TOKENS.NASHVILLE_BUILDER);
    return new NashvilleNotationDirector(builder);
  });

  // Register error recovery service
  container.registerSingleton(DI_TOKENS.ERROR_RECOVERY_SERVICE, () => {
    return new ErrorRecoveryService(errorRecoveryLevel);
  });

  // Register format detector
  container.registerSingleton(DI_TOKENS.FORMAT_DETECTOR, () => {
    return new EnhancedFormatDetector();
  });

  // Register parser registry
  container.registerSingleton(DI_TOKENS.PARSER_REGISTRY, () => {
    const registry = new EnhancedParserRegistry();

    // Register default parsers here
    // This would be done by importing and registering actual parser implementations
    // For now, we'll leave it empty as the parsers need to be refactored too

    return registry;
  });

  // Register conversion engine (main facade)
  container.registerSingleton(DI_TOKENS.CONVERSION_ENGINE, () => {
    const parserRegistry = container.resolve<IParserRegistry>(DI_TOKENS.PARSER_REGISTRY);
    const formatDetector = container.resolve<IFormatDetector>(DI_TOKENS.FORMAT_DETECTOR);
    const eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
    const errorRecovery = container.resolve<IErrorRecoveryService>(DI_TOKENS.ERROR_RECOVERY_SERVICE);
    const keyTransposer = container.resolve<IKeyTransposer>(DI_TOKENS.KEY_TRANSPOSER);
    const storageService = container.resolve<IStorageService>(DI_TOKENS.STORAGE_SERVICE);

    return new EnhancedConversionEngine(
      parserRegistry,
      formatDetector,
      eventManager,
      errorRecovery,
      keyTransposer,
      storageService
    );
  });
}

/**
 * Create and configure a new dependency container
 */
export const createContainer = (): DependencyContainer => {
  const container = new DependencyContainer();
  setupDependencyContainer(container, options);
  return container;
}

// Alias for backward compatibility
export const setupContainer = createContainer;

/**
 * Register additional parsers with the container
 */
export function registerParsers(container: DependencyContainer): void {
  const registry = container.resolve<IParserRegistry>(DI_TOKENS.PARSER_REGISTRY);

  // This would register actual parser implementations
  // For now, we'll leave this as a placeholder since the existing parsers
  // need to be refactored to implement the new interfaces

  console.log('Parser registration placeholder - parsers need to be refactored to new interfaces');
}

/**
 * Setup event listeners for the container
 */
export function setupEventListeners(container: DependencyContainer): void {
  const eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);

  // Register event listeners for logging, monitoring, etc.
  // Cast event to DomainEvent to ensure 'id' property is available,
  // assuming all events have an 'id'.
  eventManager.subscribe('ConversionStarted', (event: DomainEvent) => {
    console.log(`Conversion started: ${event.id}`);
  });

  eventManager.subscribe('ConversionCompleted', (event: DomainEvent) => {
    console.log(`Conversion completed: ${event.id}`);
  });

  // Use the specific IConversionErrorEvent interface for the error event.
  // This assumes your IEventManager's subscribe method is generic and
  // correctly maps 'ConversionError' to IConversionErrorEvent.
  eventManager.subscribe('ConversionError', (event: IConversionErrorEvent) => {
    console.error(`Conversion error: ${event.id}`, event.error.message);
  });
}

/**
 * Validate container configuration
 */
export function validateContainer(container: DependencyContainer): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that all required services are registered
  const requiredTokens = [
    DI_TOKENS.CONVERSION_ENGINE,
    DI_TOKENS.PARSER_REGISTRY,
    DI_TOKENS.FORMAT_DETECTOR,
    DI_TOKENS.EVENT_MANAGER,
    DI_TOKENS.ERROR_RECOVERY_SERVICE,
    DI_TOKENS.CHORD_FACTORY,
    DI_TOKENS.KEY_TRANSPOSER,
    DI_TOKENS.STORAGE_SERVICE
  ];

  for (const token of requiredTokens) {
    if (!container.isRegistered(token)) {
      errors.push(`Required service not registered: ${token}`);
    }
  }

  // Try to resolve core services to check for circular dependencies
  try {
    container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
  } catch (error) {
    errors.push(`Failed to resolve conversion engine: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check for potential issues
  const registeredTokens = container.getRegisteredTokens();
  if (registeredTokens.length === 0) {
    warnings.push('No services registered in container');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create a test container with mock services
 */
export function createTestContainer(): DependencyContainer {
  const container = new DependencyContainer();

  // Register mock implementations for testing
  container.registerSingleton(DI_TOKENS.STORAGE_ADAPTER, () => new InMemoryStorageAdapter());
  container.registerSingleton(DI_TOKENS.EVENT_MANAGER, () => new EventManager());
  container.registerSingleton(DI_TOKENS.CHORD_PARSER, () => new ChordParser());
  container.registerSingleton(DI_TOKENS.CHORD_VALIDATOR, () => new ChordValidator());
  container.registerSingleton(DI_TOKENS.ERROR_RECOVERY_SERVICE, () => new ErrorRecoveryService('permissive'));

  // Add other mock services as needed

  return container;
}

/**
 * Dispose of container resources
 */
export function disposeContainer(container: DependencyContainer): void {
  // Dispose of event manager
  try {
    const eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
    if ('dispose' in eventManager && typeof eventManager.dispose === 'function') {
      eventManager.dispose();
    }
  } catch {
    // Service not registered or already disposed
  }

  // Dispose of container
  container.dispose();
}