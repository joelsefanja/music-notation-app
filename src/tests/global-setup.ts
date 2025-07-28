/**
 * Global test setup
 * Runs once before all tests
 */

export default async function globalSetup() {
  console.log('🧪 Setting up SOLID Architecture Test Suite...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
  
  // Enable garbage collection for memory tests if available
  if (typeof global !== 'undefined') {
    try {
      // Try to expose gc for memory testing
      if (process.argv.includes('--expose-gc')) {
        console.log('✅ Garbage collection exposed for memory testing');
      }
    } catch (error) {
      console.log('⚠️  Garbage collection not available for memory testing');
    }
  }
  
  // Set up performance monitoring
  if (typeof performance === 'undefined') {
    // Polyfill performance for older Node versions
    const { performance } = require('perf_hooks');
    global.performance = performance;
  }
  
  console.log('✅ Global test setup completed');
}