/**
 * Event Manager implementation using Observer pattern
 * Provides decoupled communication between components
 */

import { IEventManager, EventHandler, DomainEvent } from '../../types/interfaces/core-interfaces';

/**
 * Event manager that implements the Observer pattern for decoupled communication
 */
export class EventManager implements IEventManager {
  private handlers = new Map<string, Set<EventHandler<any>>>();
  private isDisposed = false;

  /**
   * Publish an event to all registered handlers
   */
  publish<T extends DomainEvent>(eventType: string, event: T): void {
    if (this.isDisposed) {
      throw new Error('EventManager has been disposed');
    }

    const eventHandlers = this.handlers.get(event.type);
    if (!eventHandlers || eventHandlers.size === 0) {
      return;
    }

    // Create a copy of handlers to avoid issues if handlers are modified during iteration
    const handlersCopy = Array.from(eventHandlers);
    
    for (const handler of handlersCopy) {
      try {
        const result = handler(event);
        
        // Handle async handlers
        if (result instanceof Promise) {
          result.catch(error => {
            console.error(`Error in async event handler for ${event.type}:`, error);
          });
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }

  /**
   * Subscribe to an event type
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (this.isDisposed) {
      throw new Error('EventManager has been disposed');
    }

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      
      // Clean up empty handler sets
      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * Clear all event handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get the number of handlers for an event type
   */
  getHandlerCount(eventType: string): number {
    const eventHandlers = this.handlers.get(eventType);
    return eventHandlers ? eventHandlers.size : 0;
  }

  /**
   * Get all registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if there are any handlers for an event type
   */
  hasHandlers(eventType: string): boolean {
    return this.getHandlerCount(eventType) > 0;
  }

  /**
   * Subscribe to multiple event types with the same handler
   */
  subscribeToMultiple<T extends DomainEvent>(eventTypes: string[], handler: EventHandler<T>): void {
    for (const eventType of eventTypes) {
      this.subscribe(eventType, handler);
    }
  }

  /**
   * Unsubscribe from multiple event types
   */
  unsubscribeFromMultiple<T extends DomainEvent>(eventTypes: string[], handler: EventHandler<T>): void {
    for (const eventType of eventTypes) {
      this.unsubscribe(eventType, handler);
    }
  }

  /**
   * Subscribe with automatic unsubscription after first event
   */
  subscribeOnce<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (event) => {
      this.unsubscribe(eventType, onceHandler);
      return handler(event);
    };
    
    this.subscribe(eventType, onceHandler);
  }

  /**
   * Dispose of the event manager
   */
  dispose(): void {
    this.clear();
    this.isDisposed = true;
  }
}

/**
 * Domain events for the conversion engine
 */

/**
 * Base conversion event
 */
export abstract class ConversionEvent extends DomainEvent {
  constructor(public readonly requestId: string) {
    super();
  }
}

/**
 * Conversion started event
 */
export class ConversionStartedEvent extends ConversionEvent {
  readonly type = 'ConversionStarted';
  
  constructor(
    requestId: string,
    public readonly input: string,
    public readonly sourceFormat?: string,
    public readonly targetFormat?: string
  ) {
    super(requestId);
  }
}

/**
 * Conversion completed event
 */
export class ConversionCompletedEvent extends ConversionEvent {
  readonly type = 'ConversionCompleted';
  
  constructor(
    requestId: string,
    public readonly output: string,
    public readonly metadata?: any
  ) {
    super(requestId);
  }
}

/**
 * Conversion error event
 */
export class ConversionErrorEvent extends ConversionEvent {
  readonly type = 'ConversionError';
  
  constructor(
    requestId: string,
    public readonly error: Error,
    public readonly recoveryAttempted: boolean = false
  ) {
    super(requestId);
  }
}

/**
 * Format detection event
 */
export class FormatDetectedEvent extends DomainEvent {
  readonly type = 'FormatDetected';
  
  constructor(
    public readonly input: string,
    public readonly detectedFormat: string,
    public readonly confidence: number
  ) {
    super();
  }
}

/**
 * Key detection event
 */
export class KeyDetectedEvent extends DomainEvent {
  readonly type = 'KeyDetected';
  
  constructor(
    public readonly input: string,
    public readonly detectedKey: string,
    public readonly isMinor: boolean,
    public readonly confidence: number
  ) {
    super();
  }
}

/**
 * Chord parsed event
 */
export class ChordParsedEvent extends DomainEvent {
  readonly type = 'ChordParsed';
  
  constructor(
    public readonly originalChord: string,
    public readonly parsedChord: any,
    public readonly position: number
  ) {
    super();
  }
}

/**
 * Transposition event
 */
export class TranspositionEvent extends DomainEvent {
  readonly type = 'Transposition';
  
  constructor(
    public readonly fromKey: string,
    public readonly toKey: string,
    public readonly semitones: number
  ) {
    super();
  }
}

/**
 * Error recovery event
 */
export class ErrorRecoveryEvent extends DomainEvent {
  readonly type = 'ErrorRecovery';
  
  constructor(
    public readonly originalError: Error,
    public readonly recoveryStrategy: string,
    public readonly success: boolean
  ) {
    super();
  }
}

/**
 * Parser registration event
 */
export class ParserRegisteredEvent extends DomainEvent {
  readonly type = 'ParserRegistered';
  
  constructor(
    public readonly format: string,
    public readonly parserName: string
  ) {
    super();
  }
}

/**
 * Storage operation event
 */
export class StorageOperationEvent extends DomainEvent {
  readonly type = 'StorageOperation';
  
  constructor(
    public readonly operation: 'read' | 'write' | 'delete',
    public readonly path: string,
    public readonly success: boolean
  ) {
    super();
  }
}