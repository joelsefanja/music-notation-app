/**
 * Dependency Injection Container implementation
 * Follows Dependency Inversion Principle and provides constructor injection
 */

import { IDependencyContainer } from '../../types/interfaces/core-interfaces';

/**
 * Factory function type for creating instances
 */
type Factory<T = any> = () => T;

/**
 * Registration entry for the container
 */
interface Registration<T = any> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

/**
 * Dependency injection container that manages object creation and lifecycle
 */
export class DependencyContainer implements IDependencyContainer {
  private registrations = new Map<string, Registration>();

  /**
   * Register a transient dependency (new instance each time)
   */
  register<T>(token: string, factory: Factory<T>): void {
    if (this.registrations.has(token)) {
      throw new Error(`Token '${token}' is already registered`);
    }

    this.registrations.set(token, {
      factory,
      singleton: false
    });
  }

  /**
   * Register a singleton dependency (same instance each time)
   */
  registerSingleton<T>(token: string, factory: Factory<T>): void {
    if (this.registrations.has(token)) {
      throw new Error(`Token '${token}' is already registered`);
    }

    this.registrations.set(token, {
      factory,
      singleton: true
    });
  }

  /**
   * Resolve a dependency by token
   */
  resolve<T>(token: string): T {
    const registration = this.registrations.get(token);
    
    if (!registration) {
      throw new Error(`No registration found for token '${token}'`);
    }

    if (registration.singleton) {
      if (!registration.instance) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    return registration.factory() as T;
  }

  /**
   * Check if a token is registered
   */
  isRegistered(token: string): boolean {
    return this.registrations.has(token);
  }

  /**
   * Unregister a dependency
   */
  unregister(token: string): boolean {
    return this.registrations.delete(token);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.registrations.clear();
  }

  /**
   * Get all registered tokens
   */
  getRegisteredTokens(): string[] {
    return Array.from(this.registrations.keys());
  }

  /**
   * Register a value directly (convenience method)
   */
  registerValue<T>(token: string, value: T): void {
    this.registerSingleton(token, () => value);
  }

  /**
   * Register a class constructor with automatic dependency resolution
   */
  registerClass<T>(
    token: string, 
    constructor: new (...args: any[]) => T, 
    dependencies: string[] = [],
    singleton = false
  ): void {
    const factory = () => {
      const resolvedDependencies = dependencies.map(dep => this.resolve(dep));
      return new constructor(...resolvedDependencies);
    };

    if (singleton) {
      this.registerSingleton(token, factory);
    } else {
      this.register(token, factory);
    }
  }

  /**
   * Create a child container that inherits from this one
   */
  createChild(): DependencyContainer {
    const child = new DependencyContainer();
    
    // Copy all registrations to child
    for (const [token, registration] of this.registrations) {
      child.registrations.set(token, { ...registration });
    }
    
    return child;
  }

  /**
   * Dispose of all singleton instances (if they have a dispose method)
   */
  dispose(): void {
    for (const registration of this.registrations.values()) {
      if (registration.singleton) {
        // Get the instance (create it if needed to dispose it)
        let instance = registration.instance;
        if (!instance) {
          try {
            instance = registration.factory();
            registration.instance = instance;
          } catch (error) {
            // Skip if factory fails
            continue;
          }
        }
        
        const instanceAny = instance as any;
        if (typeof instanceAny.dispose === 'function') {
          instanceAny.dispose();
        }
      }
    }
    this.clear();
  }
}

/**
 * Global container instance for convenience
 */
export const globalContainer = new DependencyContainer();

/**
 * Dependency injection tokens for core services
 */
export const DI_TOKENS = {
  // Core services
  CONVERSION_ENGINE: 'IConversionEngine',
  PARSER_REGISTRY: 'IParserRegistry',
  FORMAT_DETECTOR: 'IFormatDetector',
  EVENT_MANAGER: 'IEventManager',
  
  // Chord services
  CHORD_FACTORY: 'IChordFactory',
  CHORD_PARSER: 'IChordParser',
  CHORD_VALIDATOR: 'IChordValidator',
  
  // Key transposition
  KEY_TRANSPOSER: 'IKeyTransposer',
  TRANSPOSE_COMMAND_MANAGER: 'ITransposeCommandManager',
  
  // Nashville converter
  NASHVILLE_BUILDER: 'INashvilleBuilder',
  NASHVILLE_DIRECTOR: 'INashvilleNotationDirector',
  
  // Error recovery
  ERROR_RECOVERY_SERVICE: 'IErrorRecoveryService',
  
  // Storage
  STORAGE_ADAPTER: 'IStorageAdapter',
  STORAGE_SERVICE: 'IStorageService',
  
  // Validation and extraction
  FORMAT_VALIDATOR_FACTORY: 'IFormatValidatorFactory',
  CHORD_EXTRACTION_FACTORY: 'IChordExtractionFactory'
} as const;

/**
 * Decorator for automatic dependency injection (if using decorators)
 */
export function Injectable(token?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const registrationToken = token || constructor.name;
    
    // This would be used with a metadata system in a full implementation
    Reflect.defineMetadata('injectable', true, constructor);
    Reflect.defineMetadata('token', registrationToken, constructor);
    
    return constructor;
  };
}

/**
 * Decorator for injecting dependencies
 */
export function Inject(token: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = Reflect.getMetadata('inject:tokens', target) || [];
    existingTokens[parameterIndex] = token;
    Reflect.defineMetadata('inject:tokens', existingTokens, target);
  };
}