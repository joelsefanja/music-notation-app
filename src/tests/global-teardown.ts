/**
 * Global test teardown
 * Runs once after all tests
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up after SOLID Architecture Test Suite...');
  
  // Clean up any global resources
  if (typeof global !== 'undefined') {
    // Clean up any global test artifacts
    const globalAny = global as any;
    if (globalAny.testArtifacts) {
      delete globalAny.testArtifacts;
    }
  }
  
  // Force final garbage collection if available
  if (typeof global !== 'undefined') {
    const globalAny = global as any;
    if (globalAny.gc) {
      globalAny.gc();
    }
  }
  
  console.log('✅ Global test teardown completed');
}