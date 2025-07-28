/**
 * Jest test setup file
 * Global test configuration and utilities
 */

// Extend Jest matchers
import 'jest-extended';

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidChord(): R;
      toBeValidNashvilleNumber(): R;
      toHaveValidChordRoot(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidChord(received: any) {
    const pass = received && 
                 typeof received.root === 'string' &&
                 typeof received.quality === 'string' &&
                 Array.isArray(received.extensions) &&
                 typeof received.originalNotation === 'string' &&
                 typeof received.position === 'number';

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid chord`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid chord`,
        pass: false,
      };
    }
  },

  toBeValidNashvilleNumber(received: number) {
    const pass = Number.isInteger(received) && received >= 1 && received <= 7;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Nashville number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Nashville number (1-7)`,
        pass: false,
      };
    }
  },

  toHaveValidChordRoot(received: any) {
    const validRoots = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    const pass = received && typeof received.root === 'string' && validRoots.includes(received.root);

    if (pass) {
      return {
        message: () => `expected chord with root ${received.root} not to have a valid chord root`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected chord to have a valid chord root, got ${received?.root}`,
        pass: false,
      };
    }
  }
});

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error and console.warn in tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test helpers
export const TestHelpers = {
  /**
   * Create a mock chord for testing
   */
  createMockChord: (overrides: any = {}) => ({
    root: 'C',
    quality: 'maj',
    extensions: [],
    bassNote: undefined,
    position: 0,
    originalNotation: 'C',
    nashvilleNumber: undefined,
    ...overrides
  }),

  /**
   * Create a mock conversion result for testing
   */
  createMockConversionResult: (overrides: any = {}) => ({
    success: true,
    output: 'Mock output',
    errors: [],
    warnings: [],
    metadata: {
      timestamp: Date.now(),
      format: 'test'
    },
    ...overrides
  }),

  /**
   * Create a mock event for testing
   */
  createMockEvent: (type: string, data: any = {}) => ({
    type,
    timestamp: new Date(),
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data
  }),

  /**
   * Wait for async operations to complete
   */
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate test data for performance tests
   */
  generateTestChords: (count: number) => {
    const chords = [];
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const qualities = ['', 'm', '7', 'maj7', 'dim', 'aug'];
    
    for (let i = 0; i < count; i++) {
      const root = roots[i % roots.length];
      const quality = qualities[i % qualities.length];
      chords.push(`${root}${quality}`);
    }
    
    return chords;
  },

  /**
   * Measure execution time of a function
   */
  measureTime: async (fn: () => Promise<any> | any) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  },

  /**
   * Create a spy that tracks call order
   */
  createOrderedSpy: () => {
    const calls: Array<{ name: string; args: any[]; timestamp: number }> = [];
    
    return {
      spy: (name: string) => jest.fn((...args) => {
        calls.push({ name, args, timestamp: Date.now() });
      }),
      getCalls: () => calls,
      getCallOrder: () => calls.map(call => call.name),
      reset: () => calls.length = 0
    };
  }
};

// Performance testing utilities
export const PerformanceHelpers = {
  /**
   * Run a performance test with statistics
   */
  runPerformanceTest: async (
    name: string,
    testFn: () => Promise<any> | any,
    iterations = 1000
  ) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await testFn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const total = times.reduce((sum, time) => sum + time, 0);
    const average = total / iterations;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
    
    const stats = {
      name,
      iterations,
      total: total.toFixed(2),
      average: average.toFixed(4),
      min: min.toFixed(4),
      max: max.toFixed(4),
      median: median.toFixed(4)
    };
    
    console.log(`Performance Test: ${name}`);
    console.log(`  Iterations: ${stats.iterations}`);
    console.log(`  Total: ${stats.total}ms`);
    console.log(`  Average: ${stats.average}ms`);
    console.log(`  Min: ${stats.min}ms`);
    console.log(`  Max: ${stats.max}ms`);
    console.log(`  Median: ${stats.median}ms`);
    
    return stats;
  },

  /**
   * Assert performance meets requirements
   */
  assertPerformance: (stats: any, requirements: {
    maxAverage?: number;
    maxTotal?: number;
    maxMedian?: number;
  }) => {
    if (requirements.maxAverage && parseFloat(stats.average) > requirements.maxAverage) {
      throw new Error(`Performance requirement failed: average ${stats.average}ms > ${requirements.maxAverage}ms`);
    }
    
    if (requirements.maxTotal && parseFloat(stats.total) > requirements.maxTotal) {
      throw new Error(`Performance requirement failed: total ${stats.total}ms > ${requirements.maxTotal}ms`);
    }
    
    if (requirements.maxMedian && parseFloat(stats.median) > requirements.maxMedian) {
      throw new Error(`Performance requirement failed: median ${stats.median}ms > ${requirements.maxMedian}ms`);
    }
  }
};

// Memory testing utilities
export const MemoryHelpers = {
  /**
   * Get current memory usage
   */
  getMemoryUsage: () => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  },

  /**
   * Force garbage collection if available
   */
  forceGC: () => {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  },

  /**
   * Measure memory usage of a function
   */
  measureMemory: async (fn: () => Promise<any> | any) => {
    const initialMemory = MemoryHelpers.getMemoryUsage();
    
    const result = await fn();
    
    MemoryHelpers.forceGC();
    const finalMemory = MemoryHelpers.getMemoryUsage();
    
    if (initialMemory && finalMemory) {
      return {
        result,
        memoryDelta: {
          heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
          heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
          external: finalMemory.external - initialMemory.external
        }
      };
    }
    
    return { result, memoryDelta: null };
  }
};