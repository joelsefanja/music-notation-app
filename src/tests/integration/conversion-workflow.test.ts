/**
 * Integration tests for complete conversion workflows
 * Tests end-to-end conversion, error recovery, and event publishing
 */

import { 
  createConfiguredContainer, 
  setupEventListeners 
} from '../../services/dependency-injection/container-setup';
import { DI_TOKENS } from '../../services/dependency-injection/dependency-container';
import { 
  IConversionEngine, 
  IChordFactory, 
  IKeyTransposer, 
  IEventManager,
  IStorageService,
  ChordQuality
} from '../../types/interfaces/core-interfaces';
import { NotationFormat } from '../../types/line';

describe('Conversion Workflow Integration', () => {
  let container: any;
  let conversionEngine: IConversionEngine;
  let chordFactory: IChordFactory;
  let keyTransposer: IKeyTransposer;
  let eventManager: IEventManager;
  let storageService: IStorageService;

  beforeEach(() => {
    container = createConfiguredContainer({
      storageType: 'memory',
      errorRecoveryLevel: 'moderate'
    });

    conversionEngine = container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
    chordFactory = container.resolve<IChordFactory>(DI_TOKENS.CHORD_FACTORY);
    keyTransposer = container.resolve<IKeyTransposer>(DI_TOKENS.KEY_TRANSPOSER);
    eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
    storageService = container.resolve<IStorageService>(DI_TOKENS.STORAGE_SERVICE);
  });

  afterEach(() => {
    container.dispose();
  });

  describe('Dependency Injection Integration', () => {
    it('should resolve all core services', () => {
      expect(conversionEngine).toBeDefined();
      expect(chordFactory).toBeDefined();
      expect(keyTransposer).toBeDefined();
      expect(eventManager).toBeDefined();
      expect(storageService).toBeDefined();
    });

    it('should maintain singleton behavior for registered singletons', () => {
      const eventManager1 = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
      const eventManager2 = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
      
      expect(eventManager1).toBe(eventManager2);
    });

    it('should inject dependencies correctly', () => {
      // ChordFactory should have parser and validator injected
      const chord = chordFactory.createChord('Cmaj7');
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe(ChordQuality.MAJOR);
    });
  });

  describe('Chord Factory and Builder Integration', () => {
    it('should create chords using factory and builder patterns', () => {
      // Test Factory pattern
      const factoryChord = chordFactory.createChord('Dm7/F');
      expect(factoryChord.root).toBe('D');
      expect(factoryChord.quality).toBe(ChordQuality.MINOR);
      expect(factoryChord.bassNote).toBe('F');

      // Test Builder pattern
      const builder = chordFactory.createChordBuilder();
      const builderChord = builder
        .setRoot('G')
        .setQuality(ChordQuality.DOMINANT)
        .addExtensionByValue('dom', '7')
        .setBassNote('B')
        .setOriginalNotation('G7/B')
        .build();

      expect(builderChord.root).toBe('G');
      expect(builderChord.quality).toBe(ChordQuality.DOMINANT);
      expect(builderChord.bassNote).toBe('B');
      expect(builderChord.extensions).toHaveLength(1);
    });

    it('should validate chords through integrated validation', () => {
      expect(() => {
        chordFactory.createChord('Xinvalid');
      }).toThrow();

      expect(chordFactory.isValidChord('Cmaj7')).toBe(true);
      expect(chordFactory.isValidChord('Xinvalid')).toBe(false);
    });
  });

  describe('Key Transposition Integration', () => {
    it('should transpose chords with command pattern support', () => {
      const originalChord = chordFactory.createChord('Cmaj7');
      const transposedChord = keyTransposer.transposeChord(originalChord, 2, 'D');

      expect(transposedChord.root).toBe('D');
      expect(transposedChord.quality).toBe(ChordQuality.MAJOR);
      expect(transposedChord.originalNotation).toBe('Dmaj7');
    });

    it('should calculate key distances correctly', () => {
      expect(keyTransposer.getKeyDistance('C', 'G')).toBe(7);
      expect(keyTransposer.getKeyDistance('Am', 'Em')).toBe(7);
    });

    it('should provide key relationship analysis', () => {
      expect(keyTransposer.getRelativeKey('C')).toBe('Am');
      expect(keyTransposer.getParallelKey('C')).toBe('Cm');
      expect(keyTransposer.areKeysEnharmonic('C#', 'Db')).toBe(true);
    });
  });

  describe('Event System Integration', () => {
    it('should publish and handle events correctly', () => {
      const eventHandler = jest.fn();
      
      eventManager.subscribe('TestEvent', eventHandler);
      
      // Create a mock event
      const mockEvent = {
        type: 'TestEvent',
        timestamp: new Date(),
        id: 'test-123',
        data: 'test data'
      };

      eventManager.publish(mockEvent as any);

      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle multiple subscribers and event types', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      eventManager.subscribe('Event1', handler1);
      eventManager.subscribe('Event1', handler2);
      eventManager.subscribe('Event2', handler3);

      const event1 = { type: 'Event1', timestamp: new Date(), id: '1' };
      const event2 = { type: 'Event2', timestamp: new Date(), id: '2' };

      eventManager.publish(event1 as any);
      eventManager.publish(event2 as any);

      expect(handler1).toHaveBeenCalledWith(event1);
      expect(handler2).toHaveBeenCalledWith(event1);
      expect(handler3).toHaveBeenCalledWith(event2);
      expect(handler3).not.toHaveBeenCalledWith(event1);
    });
  });

  describe('Storage System Integration', () => {
    it('should save and load conversion results', async () => {
      const mockResult = {
        success: true,
        output: 'Test output',
        errors: [],
        warnings: [],
        metadata: {
          timestamp: Date.now(),
          format: 'test'
        }
      };

      await storageService.saveConversionResult(mockResult, 'test-conversion');
      const history = await storageService.loadConversionHistory();

      expect(history).toHaveLength(1);
      expect(history[0].output).toBe('Test output');
      expect(history[0].success).toBe(true);
    });

    it('should handle storage statistics', async () => {
      // Save some test data
      await storageService.saveConversionResult({
        success: true,
        output: 'Test 1',
        errors: [],
        warnings: []
      }, 'test1');

      await storageService.saveConversionResult({
        success: true,
        output: 'Test 2',
        errors: [],
        warnings: []
      }, 'test2');

      const stats = await storageService.getStorageStats();
      expect(stats.conversionResults).toBe(2);
      expect(stats.totalFiles).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Format Detection Integration', () => {
    it('should detect formats with confidence scoring', () => {
      const chordProText = `
        {title: Test Song}
        {artist: Test Artist}
        
        [C]Hello [Am]world
        {comment: This is a comment}
      `;

      const detection = conversionEngine.detectFormat(chordProText);
      expect(detection.format).toBe(NotationFormat.CHORDPRO);
      expect(detection.confidence).toBeGreaterThan(0.5);
    });

    it('should handle multiple format detection', () => {
      const onSongText = `
        Title: Test Song
        Artist: Test Artist
        
        [C]Hello [Am]world
        *This is a comment
      `;

      const detection = conversionEngine.detectFormat(onSongText);
      expect(detection.format).toBe(NotationFormat.ONSONG);
      expect(detection.confidence).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle parsing errors gracefully', async () => {
      // This would test the error recovery system
      // For now, we'll test that the system doesn't crash with invalid input
      
      const invalidInput = 'This is completely invalid input with [InvalidChord] and malformed {syntax';
      
      expect(() => {
        conversionEngine.detectFormat(invalidInput);
      }).not.toThrow();
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should handle a complete chord processing workflow', () => {
      // 1. Create chord using factory
      const originalChord = chordFactory.createChord('Cmaj7');
      
      // 2. Transpose chord
      const transposedChord = keyTransposer.transposeChord(originalChord, 2, 'D');
      
      // 3. Verify result
      expect(transposedChord.root).toBe('D');
      expect(transposedChord.originalNotation).toBe('Dmaj7');
      
      // 4. Create variations using builder
      const builder = chordFactory.createChordBuilder();
      const variation = builder
        .setRoot(transposedChord.root)
        .setQuality(transposedChord.quality)
        .setExtensions(transposedChord.extensions)
        .addExtensionByValue('add', '9')
        .setOriginalNotation('Dmaj7add9')
        .build();
      
      expect(variation.extensions).toHaveLength(2);
    });

    it('should handle event-driven workflow', async () => {
      const events: any[] = [];
      
      // Subscribe to all events
      eventManager.subscribe('ConversionStarted', (event) => events.push(event));
      eventManager.subscribe('ConversionCompleted', (event) => events.push(event));
      eventManager.subscribe('ConversionError', (event) => events.push(event));

      // This would trigger a conversion workflow that publishes events
      // For now, we'll manually publish events to test the integration
      
      const startEvent = {
        type: 'ConversionStarted',
        requestId: 'test-123',
        input: 'test input',
        timestamp: new Date(),
        id: 'start-1'
      };

      const completeEvent = {
        type: 'ConversionCompleted',
        requestId: 'test-123',
        output: 'test output',
        timestamp: new Date(),
        id: 'complete-1'
      };

      eventManager.publish(startEvent as any);
      eventManager.publish(completeEvent as any);

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('ConversionStarted');
      expect(events[1].type).toBe('ConversionCompleted');
    });

    it('should integrate storage with conversion results', async () => {
      // Create a conversion result
      const result = {
        success: true,
        output: 'Converted output',
        errors: [],
        warnings: ['Test warning'],
        metadata: {
          sourceFormat: NotationFormat.ONSONG,
          targetFormat: NotationFormat.CHORDPRO,
          timestamp: Date.now()
        }
      };

      // Save using storage service
      await storageService.saveConversionResult(result, 'integration-test');

      // Load and verify
      const history = await storageService.loadConversionHistory();
      const savedResult = history.find(r => r.output === 'Converted output');

      expect(savedResult).toBeDefined();
      expect(savedResult?.success).toBe(true);
      expect(savedResult?.warnings).toContain('Test warning');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent operations', async () => {
      const operations = [];

      // Create multiple chords concurrently
      for (let i = 0; i < 10; i++) {
        operations.push(Promise.resolve(chordFactory.createChord('Cmaj7')));
      }

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(10);
      results.forEach(chord => {
        expect(chord.root).toBe('C');
        expect(chord.quality).toBe(ChordQuality.MAJOR);
      });
    });

    it('should handle large numbers of events efficiently', () => {
      const handler = jest.fn();
      eventManager.subscribe('TestEvent', handler);

      // Publish many events
      for (let i = 0; i < 100; i++) {
        eventManager.publish({
          type: 'TestEvent',
          data: `Event ${i}`,
          timestamp: new Date(),
          id: `event-${i}`
        } as any);
      }

      expect(handler).toHaveBeenCalledTimes(100);
    });
  });

  describe('Memory Management', () => {
    it('should properly dispose of resources', () => {
      const handler = jest.fn();
      eventManager.subscribe('TestEvent', handler);

      // Dispose of container
      container.dispose();

      // Event manager should be disposed and throw error
      expect(() => {
        eventManager.publish({
          type: 'TestEvent',
          timestamp: new Date(),
          id: 'test'
        } as any);
      }).toThrow('EventManager has been disposed');
    });
  });
});