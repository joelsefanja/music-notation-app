/**
 * Performance benchmarks for the SOLID refactored architecture
 * Tests parsing performance, memory usage, and scalability
 */

import { 
  createConfiguredContainer 
} from '../../services/dependency-injection/container-setup';
import { DI_TOKENS } from '../../services/dependency-injection/dependency-container';
import { 
  IChordFactory, 
  IKeyTransposer, 
  IEventManager,
  ChordQuality
} from '../../types/interfaces/core-interfaces';

describe('Performance Benchmarks', () => {
  let container: any;
  let chordFactory: IChordFactory;
  let keyTransposer: IKeyTransposer;
  let eventManager: IEventManager;

  beforeAll(() => {
    container = createConfiguredContainer({
      storageType: 'memory',
      errorRecoveryLevel: 'moderate'
    });

    chordFactory = container.resolve<IChordFactory>(DI_TOKENS.CHORD_FACTORY);
    keyTransposer = container.resolve<IKeyTransposer>(DI_TOKENS.KEY_TRANSPOSER);
    eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
  });

  afterAll(() => {
    container.dispose();
  });

  describe('Chord Factory Performance', () => {
    it('should create chords efficiently', () => {
      const startTime = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        chordFactory.createChord('Cmaj7');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      console.log(`Chord creation: ${iterations} chords in ${duration.toFixed(2)}ms`);
      console.log(`Average time per chord: ${averageTime.toFixed(4)}ms`);

      // Should create chords in reasonable time (less than 1ms per chord on average)
      expect(averageTime).toBeLessThan(1);
    });

    it('should handle complex chord creation efficiently', () => {
      const complexChords = [
        'Cmaj7#11/E',
        'F#m7b5/A',
        'Bb13sus4',
        'Gdim7/Db',
        'Aadd9/C#'
      ];

      const startTime = performance.now();
      const iterations = 200;

      for (let i = 0; i < iterations; i++) {
        for (const chordString of complexChords) {
          chordFactory.createChord(chordString);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const totalChords = iterations * complexChords.length;
      const averageTime = duration / totalChords;

      console.log(`Complex chord creation: ${totalChords} chords in ${duration.toFixed(2)}ms`);
      console.log(`Average time per complex chord: ${averageTime.toFixed(4)}ms`);

      // Complex chords should still be created efficiently
      expect(averageTime).toBeLessThan(2);
    });

    it('should validate chords efficiently', () => {
      const testChords = [
        'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim',
        'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'
      ];

      const startTime = performance.now();
      const iterations = 500;

      for (let i = 0; i < iterations; i++) {
        for (const chord of testChords) {
          chordFactory.isValidChord(chord);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const totalValidations = iterations * testChords.length;
      const averageTime = duration / totalValidations;

      console.log(`Chord validation: ${totalValidations} validations in ${duration.toFixed(2)}ms`);
      console.log(`Average time per validation: ${averageTime.toFixed(4)}ms`);

      expect(averageTime).toBeLessThan(0.5);
    });
  });

  describe('Key Transposition Performance', () => {
    it('should transpose chords efficiently', () => {
      const chord = chordFactory.createChord('Cmaj7');
      const startTime = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        keyTransposer.transposeChord(chord, i % 12, 'G');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      console.log(`Chord transposition: ${iterations} transpositions in ${duration.toFixed(2)}ms`);
      console.log(`Average time per transposition: ${averageTime.toFixed(4)}ms`);

      expect(averageTime).toBeLessThan(0.5);
    });

    it('should calculate key distances efficiently', () => {
      const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
      const startTime = performance.now();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        for (const fromKey of keys) {
          for (const toKey of keys) {
            keyTransposer.getKeyDistance(fromKey, toKey);
          }
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const totalCalculations = iterations * keys.length * keys.length;
      const averageTime = duration / totalCalculations;

      console.log(`Key distance calculations: ${totalCalculations} calculations in ${duration.toFixed(2)}ms`);
      console.log(`Average time per calculation: ${averageTime.toFixed(6)}ms`);

      expect(averageTime).toBeLessThan(0.1);
    });

    it('should handle batch transposition efficiently', () => {
      const chords = [];
      for (let i = 0; i < 100; i++) {
        chords.push(chordFactory.createChord('Cmaj7'));
      }

      const startTime = performance.now();
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        keyTransposer.transposeChords(chords, 2, 'D');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const totalChords = iterations * chords.length;
      const averageTime = duration / totalChords;

      console.log(`Batch transposition: ${totalChords} chords in ${duration.toFixed(2)}ms`);
      console.log(`Average time per chord in batch: ${averageTime.toFixed(4)}ms`);

      expect(averageTime).toBeLessThan(0.1);
    });
  });

  describe('Event System Performance', () => {
    it('should handle high-frequency event publishing', () => {
      const handler = jest.fn();
      eventManager.subscribe('PerformanceTest', handler);

      const startTime = performance.now();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        eventManager.publish({
          type: 'PerformanceTest',
          data: `Event ${i}`,
          timestamp: new Date(),
          id: `perf-${i}`
        } as any);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      console.log(`Event publishing: ${iterations} events in ${duration.toFixed(2)}ms`);
      console.log(`Average time per event: ${averageTime.toFixed(4)}ms`);

      expect(handler).toHaveBeenCalledTimes(iterations);
      expect(averageTime).toBeLessThan(0.1);
    });

    it('should handle multiple subscribers efficiently', () => {
      const handlers = [];
      const subscriberCount = 100;

      // Create multiple subscribers
      for (let i = 0; i < subscriberCount; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventManager.subscribe('MultiSubscriberTest', handler);
      }

      const startTime = performance.now();
      const eventCount = 100;

      for (let i = 0; i < eventCount; i++) {
        eventManager.publish({
          type: 'MultiSubscriberTest',
          data: `Event ${i}`,
          timestamp: new Date(),
          id: `multi-${i}`
        } as any);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const totalHandlerCalls = eventCount * subscriberCount;
      const averageTime = duration / totalHandlerCalls;

      console.log(`Multi-subscriber events: ${totalHandlerCalls} handler calls in ${duration.toFixed(2)}ms`);
      console.log(`Average time per handler call: ${averageTime.toFixed(6)}ms`);

      // Verify all handlers were called
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledTimes(eventCount);
      });

      expect(averageTime).toBeLessThan(0.01);
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should not leak memory during chord creation', () => {
      const initialMemory = process.memoryUsage();
      const iterations = 10000;

      // Create many chords
      for (let i = 0; i < iterations; i++) {
        chordFactory.createChord('Cmaj7');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryPerChord = memoryIncrease / iterations;

      console.log(`Memory usage: ${iterations} chords used ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Average memory per chord: ${memoryPerChord.toFixed(2)} bytes`);

      // Memory usage should be reasonable (less than 1KB per chord)
      expect(memoryPerChord).toBeLessThan(1024);
    });

    it('should handle event subscription/unsubscription without leaks', () => {
      const initialMemory = process.memoryUsage();
      const iterations = 1000;

      // Subscribe and unsubscribe many handlers
      for (let i = 0; i < iterations; i++) {
        const handler = jest.fn();
        eventManager.subscribe('MemoryTest', handler);
        eventManager.unsubscribe('MemoryTest', handler);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`Event memory test: ${iterations} subscribe/unsubscribe cycles used ${(memoryIncrease / 1024).toFixed(2)}KB`);

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });

  describe('Scalability Benchmarks', () => {
    it('should scale linearly with chord complexity', () => {
      const simpleChords = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const complexChords = ['Cmaj7#11/E', 'Dm7b5/F', 'Em7add9/G', 'Fmaj7sus4/A', 'G13/B', 'Am7b5/C', 'Bm7b5/D'];

      // Test simple chords
      const simpleStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        for (const chord of simpleChords) {
          chordFactory.createChord(chord);
        }
      }
      const simpleEnd = performance.now();
      const simpleTime = simpleEnd - simpleStart;

      // Test complex chords
      const complexStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        for (const chord of complexChords) {
          chordFactory.createChord(chord);
        }
      }
      const complexEnd = performance.now();
      const complexTime = complexEnd - complexStart;

      const complexityRatio = complexTime / simpleTime;

      console.log(`Simple chords: ${simpleTime.toFixed(2)}ms`);
      console.log(`Complex chords: ${complexTime.toFixed(2)}ms`);
      console.log(`Complexity ratio: ${complexityRatio.toFixed(2)}x`);

      // Complex chords should not be more than 5x slower than simple chords
      expect(complexityRatio).toBeLessThan(5);
    });

    it('should handle increasing numbers of event subscribers efficiently', () => {
      const subscriberCounts = [10, 50, 100, 500];
      const results = [];

      for (const count of subscriberCounts) {
        // Clean up previous subscribers
        eventManager.clear();

        // Create subscribers
        for (let i = 0; i < count; i++) {
          eventManager.subscribe('ScalabilityTest', jest.fn());
        }

        // Measure event publishing time
        const startTime = performance.now();
        const eventCount = 100;

        for (let i = 0; i < eventCount; i++) {
          eventManager.publish({
            type: 'ScalabilityTest',
            data: `Event ${i}`,
            timestamp: new Date(),
            id: `scale-${i}`
          } as any);
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        const averageTime = duration / eventCount;

        results.push({ subscribers: count, averageTime });

        console.log(`${count} subscribers: ${averageTime.toFixed(4)}ms per event`);
      }

      // Performance should scale reasonably (not exponentially)
      const firstResult = results[0];
      const lastResult = results[results.length - 1];
      const scalingFactor = lastResult.averageTime / firstResult.averageTime;
      const subscriberRatio = lastResult.subscribers / firstResult.subscribers;

      console.log(`Scaling factor: ${scalingFactor.toFixed(2)}x for ${subscriberRatio}x subscribers`);

      // Scaling should be roughly linear (not more than 2x the subscriber ratio)
      expect(scalingFactor).toBeLessThan(subscriberRatio * 2);
    });
  });

  describe('Comparison with Legacy Implementation', () => {
    it('should demonstrate performance improvements', () => {
      // This would compare with the old implementation
      // For now, we'll just ensure the new implementation meets performance targets

      const startTime = performance.now();
      const iterations = 1000;

      // Simulate a typical workflow
      for (let i = 0; i < iterations; i++) {
        const chord = chordFactory.createChord('Cmaj7');
        const transposed = keyTransposer.transposeChord(chord, 2, 'D');
        chordFactory.isValidChord(transposed.originalNotation);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      console.log(`Complete workflow: ${iterations} iterations in ${duration.toFixed(2)}ms`);
      console.log(`Average time per workflow: ${averageTime.toFixed(4)}ms`);

      // Complete workflow should be efficient
      expect(averageTime).toBeLessThan(2);
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme loads without crashing', () => {
      const extremeIterations = 50000;
      let successCount = 0;

      const startTime = performance.now();

      try {
        for (let i = 0; i < extremeIterations; i++) {
          chordFactory.createChord('Cmaj7');
          successCount++;
        }
      } catch (error) {
        console.error('Stress test failed:', error);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Stress test: ${successCount}/${extremeIterations} successful operations in ${duration.toFixed(2)}ms`);

      expect(successCount).toBe(extremeIterations);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});