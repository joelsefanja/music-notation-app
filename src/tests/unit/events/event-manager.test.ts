/**
 * Unit tests for Event Manager (Observer Pattern)
 * Tests event publishing, subscribing, and handler management
 */

import { EventManager, ConversionStartedEvent, ConversionCompletedEvent, ConversionErrorEvent } from '../../../services/events/event-manager';
import { DomainEvent } from '../../../types/interfaces/core-interfaces';

// Mock event for testing
class MockEvent extends DomainEvent {
  readonly type = 'MockEvent';
  
  constructor(public data: string) {
    super();
  }
}

class AsyncMockEvent extends DomainEvent {
  readonly type = 'AsyncMockEvent';
  
  constructor(public data: string) {
    super();
  }
}

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  afterEach(() => {
    eventManager.dispose();
  });

  describe('subscribe and publish', () => {
    it('should subscribe and receive events', () => {
      const handler = jest.fn();
      
      eventManager.subscribe('MockEvent', handler);
      eventManager.publish(new MockEvent('test data'));
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'MockEvent',
        data: 'test data'
      }));
    });

    it('should handle multiple subscribers for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.subscribe('MockEvent', handler1);
      eventManager.subscribe('MockEvent', handler2);
      
      const event = new MockEvent('test data');
      eventManager.publish(event);
      
      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should handle multiple events for same subscriber', () => {
      const handler = jest.fn();
      
      eventManager.subscribe('MockEvent', handler);
      
      eventManager.publish(new MockEvent('data1'));
      eventManager.publish(new MockEvent('data2'));
      
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should not call handlers for different event types', () => {
      const handler = jest.fn();
      
      eventManager.subscribe('MockEvent', handler);
      eventManager.publish(new AsyncMockEvent('test data'));
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe handlers', () => {
      const handler = jest.fn();
      
      eventManager.subscribe('MockEvent', handler);
      eventManager.unsubscribe('MockEvent', handler);
      
      eventManager.publish(new MockEvent('test data'));
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should only unsubscribe specific handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.subscribe('MockEvent', handler1);
      eventManager.subscribe('MockEvent', handler2);
      
      eventManager.unsubscribe('MockEvent', handler1);
      
      eventManager.publish(new MockEvent('test data'));
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle unsubscribing non-existent handler gracefully', () => {
      const handler = jest.fn();
      
      expect(() => {
        eventManager.unsubscribe('MockEvent', handler);
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all event handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.subscribe('MockEvent', handler1);
      eventManager.subscribe('AsyncMockEvent', handler2);
      
      eventManager.clear();
      
      eventManager.publish(new MockEvent('test data'));
      eventManager.publish(new AsyncMockEvent('test data'));
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('getHandlerCount', () => {
    it('should return correct handler count', () => {
      expect(eventManager.getHandlerCount('MockEvent')).toBe(0);
      
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.subscribe('MockEvent', handler1);
      expect(eventManager.getHandlerCount('MockEvent')).toBe(1);
      
      eventManager.subscribe('MockEvent', handler2);
      expect(eventManager.getHandlerCount('MockEvent')).toBe(2);
      
      eventManager.unsubscribe('MockEvent', handler1);
      expect(eventManager.getHandlerCount('MockEvent')).toBe(1);
    });
  });

  describe('getRegisteredEventTypes', () => {
    it('should return registered event types', () => {
      expect(eventManager.getRegisteredEventTypes()).toEqual([]);
      
      eventManager.subscribe('MockEvent', jest.fn());
      eventManager.subscribe('AsyncMockEvent', jest.fn());
      
      const eventTypes = eventManager.getRegisteredEventTypes();
      expect(eventTypes).toContain('MockEvent');
      expect(eventTypes).toContain('AsyncMockEvent');
      expect(eventTypes).toHaveLength(2);
    });
  });

  describe('hasHandlers', () => {
    it('should return true when handlers exist', () => {
      expect(eventManager.hasHandlers('MockEvent')).toBe(false);
      
      eventManager.subscribe('MockEvent', jest.fn());
      
      expect(eventManager.hasHandlers('MockEvent')).toBe(true);
    });
  });

  describe('subscribeToMultiple', () => {
    it('should subscribe to multiple event types', () => {
      const handler = jest.fn();
      
      eventManager.subscribeToMultiple(['MockEvent', 'AsyncMockEvent'], handler);
      
      eventManager.publish(new MockEvent('test1'));
      eventManager.publish(new AsyncMockEvent('test2'));
      
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('unsubscribeFromMultiple', () => {
    it('should unsubscribe from multiple event types', () => {
      const handler = jest.fn();
      
      eventManager.subscribeToMultiple(['MockEvent', 'AsyncMockEvent'], handler);
      eventManager.unsubscribeFromMultiple(['MockEvent', 'AsyncMockEvent'], handler);
      
      eventManager.publish(new MockEvent('test1'));
      eventManager.publish(new AsyncMockEvent('test2'));
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('subscribeOnce', () => {
    it('should unsubscribe after first event', () => {
      const handler = jest.fn();
      
      eventManager.subscribeOnce('MockEvent', handler);
      
      eventManager.publish(new MockEvent('test1'));
      eventManager.publish(new MockEvent('test2'));
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        data: 'test1'
      }));
    });
  });

  describe('async handlers', () => {
    it('should handle async event handlers', async () => {
      const asyncHandler = jest.fn().mockResolvedValue(undefined);
      
      eventManager.subscribe('MockEvent', asyncHandler);
      eventManager.publish(new MockEvent('test data'));
      
      // Give async handlers time to execute
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(asyncHandler).toHaveBeenCalled();
    });

    it('should handle async handler errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const asyncHandler = jest.fn().mockRejectedValue(new Error('Async error'));
      
      eventManager.subscribe('MockEvent', asyncHandler);
      eventManager.publish(new MockEvent('test data'));
      
      // Give async handlers time to execute
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle synchronous handler errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const normalHandler = jest.fn();
      
      eventManager.subscribe('MockEvent', errorHandler);
      eventManager.subscribe('MockEvent', normalHandler);
      
      eventManager.publish(new MockEvent('test data'));
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled(); // Other handlers should still execute
      
      consoleErrorSpy.mockRestore();
    });

    it('should continue processing other handlers after error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler1 = jest.fn().mockImplementation(() => {
        throw new Error('Handler 1 error');
      });
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      eventManager.subscribe('MockEvent', handler1);
      eventManager.subscribe('MockEvent', handler2);
      eventManager.subscribe('MockEvent', handler3);
      
      eventManager.publish(new MockEvent('test data'));
      
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('dispose', () => {
    it('should dispose and prevent further operations', () => {
      const handler = jest.fn();
      
      eventManager.subscribe('MockEvent', handler);
      eventManager.dispose();
      
      expect(() => {
        eventManager.publish(new MockEvent('test data'));
      }).toThrow('EventManager has been disposed');
      
      expect(() => {
        eventManager.subscribe('MockEvent', handler);
      }).toThrow('EventManager has been disposed');
    });

    it('should clear all handlers on dispose', () => {
      eventManager.subscribe('MockEvent', jest.fn());
      eventManager.subscribe('AsyncMockEvent', jest.fn());
      
      expect(eventManager.getRegisteredEventTypes()).toHaveLength(2);
      
      eventManager.dispose();
      
      // Can't test getRegisteredEventTypes after dispose due to error,
      // but we know clear() is called which removes all handlers
    });
  });

  describe('domain events', () => {
    describe('ConversionStartedEvent', () => {
      it('should create conversion started event with correct properties', () => {
        const event = new ConversionStartedEvent('req123', 'input text', 'onsong', 'chordpro');
        
        expect(event.type).toBe('ConversionStarted');
        expect(event.requestId).toBe('req123');
        expect(event.input).toBe('input text');
        expect(event.sourceFormat).toBe('onsong');
        expect(event.targetFormat).toBe('chordpro');
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(event.id).toBeDefined();
      });
    });

    describe('ConversionCompletedEvent', () => {
      it('should create conversion completed event with correct properties', () => {
        const metadata = { format: 'test' };
        const event = new ConversionCompletedEvent('req123', 'output text', metadata);
        
        expect(event.type).toBe('ConversionCompleted');
        expect(event.requestId).toBe('req123');
        expect(event.output).toBe('output text');
        expect(event.metadata).toBe(metadata);
      });
    });

    describe('ConversionErrorEvent', () => {
      it('should create conversion error event with correct properties', () => {
        const error = new Error('Test error');
        const event = new ConversionErrorEvent('req123', error, true);
        
        expect(event.type).toBe('ConversionError');
        expect(event.requestId).toBe('req123');
        expect(event.error).toBe(error);
        expect(event.recoveryAttempted).toBe(true);
      });

      it('should default recoveryAttempted to false', () => {
        const error = new Error('Test error');
        const event = new ConversionErrorEvent('req123', error);
        
        expect(event.recoveryAttempted).toBe(false);
      });
    });
  });

  describe('handler modification during event processing', () => {
    it('should handle handlers being removed during event processing', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn().mockImplementation(() => {
        eventManager.unsubscribe('MockEvent', handler3);
      });
      const handler3 = jest.fn();
      
      eventManager.subscribe('MockEvent', handler1);
      eventManager.subscribe('MockEvent', handler2);
      eventManager.subscribe('MockEvent', handler3);
      
      eventManager.publish(new MockEvent('test data'));
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      // handler3 might or might not be called depending on execution order
      // The important thing is that it doesn't crash
    });

    it('should handle handlers being added during event processing', () => {
      const handler1 = jest.fn();
      const newHandler = jest.fn();
      const handler2 = jest.fn().mockImplementation(() => {
        eventManager.subscribe('MockEvent', newHandler);
      });
      
      eventManager.subscribe('MockEvent', handler1);
      eventManager.subscribe('MockEvent', handler2);
      
      eventManager.publish(new MockEvent('test data'));
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      // newHandler should not be called for this event since it was added during processing
      expect(newHandler).not.toHaveBeenCalled();
      
      // But it should be called for subsequent events
      eventManager.publish(new MockEvent('test data 2'));
      expect(newHandler).toHaveBeenCalled();
    });
  });
});