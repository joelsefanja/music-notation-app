# Migration Guide: SOLID Architecture Refactoring

## Overview

This guide helps you migrate from the legacy conversion engine to the new SOLID-principles-based architecture. The refactoring introduces significant improvements in maintainability, testability, and extensibility while maintaining backward compatibility where possible.

## 🚨 Breaking Changes

### 1. Dependency Injection Required

**Before:**
```typescript
import { ConversionEngine } from './conversion-engine';

const engine = new ConversionEngine();
const result = await engine.convert(input, fromFormat, toFormat);
```

**After:**
```typescript
import { createConfiguredContainer } from './services/dependency-injection/container-setup';
import { DI_TOKENS } from './services/dependency-injection/dependency-container';
import { IConversionEngine } from './types/interfaces/core-interfaces';

const container = createConfiguredContainer();
const engine = container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
const result = await engine.convert({
  input,
  targetFormat,
  sourceFormat: fromFormat
});
```

### 2. Interface-Based Programming

**Before:**
```typescript
import { ChordService } from './chord-service';

const chordService = new ChordService();
const chord = chordService.parseChord('Cmaj7');
```

**After:**
```typescript
import { IChordFactory } from './types/interfaces/core-interfaces';

const chordFactory = container.resolve<IChordFactory>(DI_TOKENS.CHORD_FACTORY);
const chord = chordFactory.createChord('Cmaj7');
```

### 3. Enhanced Error Handling

**Before:**
```typescript
try {
  const result = await engine.convert(input);
} catch (error) {
  console.error('Conversion failed:', error);
}
```

**After:**
```typescript
const result = await engine.convert(request);
if (!result.success) {
  // Errors are now part of the result object
  console.error('Conversion errors:', result.errors);
  // Warnings are also available
  console.warn('Conversion warnings:', result.warnings);
}
```

### 4. Event-Driven Architecture

**Before:**
```typescript
// No events were available
```

**After:**
```typescript
const eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);

eventManager.subscribe('ConversionStarted', (event) => {
  console.log('Conversion started:', event.requestId);
});

eventManager.subscribe('ConversionCompleted', (event) => {
  console.log('Conversion completed:', event.output);
});
```

## 📦 New Features

### 1. Builder Pattern for Complex Objects

```typescript
// Create complex chords using Builder pattern
const chord = chordFactory.createChordBuilder()
  .setRoot('F')
  .setQuality(ChordQuality.MINOR)
  .addExtensionByValue('dom', '7')
  .setBassNote('A')
  .setOriginalNotation('Fm7/A')
  .build();
```

### 2. Command Pattern for Undo/Redo

```typescript
const keyTransposer = container.resolve<IKeyTransposer>(DI_TOKENS.KEY_TRANSPOSER);
const commandManager = container.resolve<ITransposeCommandManager>(DI_TOKENS.TRANSPOSE_COMMAND_MANAGER);

// Create and execute transpose command
const command = keyTransposer.createTransposeCommand(songModel, 'C', 'G');
await commandManager.executeCommand(command);

// Undo the transposition
await commandManager.undo();
```

### 3. Enhanced Storage System

```typescript
const storageService = container.resolve<IStorageService>(DI_TOKENS.STORAGE_SERVICE);

// Save conversion results
await storageService.saveConversionResult(result, 'my-conversion');

// Load conversion history
const history = await storageService.loadConversionHistory();
```

### 4. Nashville Number System Builder

```typescript
const nashvilleDirector = container.resolve<INashvilleNotationDirector>(DI_TOKENS.NASHVILLE_DIRECTOR);

// Build common progressions
const progression = nashvilleDirector.buildBasicProgression('C'); // I-V-vi-IV
const jazzProgression = nashvilleDirector.buildJazzProgression('F'); // ii-V-I
```

## 🔄 Step-by-Step Migration

### Step 1: Update Dependencies

```bash
npm install reflect-metadata  # Required for dependency injection decorators
```

### Step 2: Initialize Container

Create a container initialization file:

```typescript
// src/container.ts
import { createConfiguredContainer } from './services/dependency-injection/container-setup';

export const container = createConfiguredContainer({
  storageType: 'filesystem', // or 'memory' for testing
  errorRecoveryLevel: 'moderate' // 'strict', 'moderate', or 'permissive'
});
```

### Step 3: Update Service Usage

Replace direct instantiation with container resolution:

```typescript
// Before
import { ChordService } from './chord-service';
const chordService = new ChordService();

// After
import { container } from './container';
import { DI_TOKENS } from './services/dependency-injection/dependency-container';
import { IChordFactory } from './types/interfaces/core-interfaces';

const chordFactory = container.resolve<IChordFactory>(DI_TOKENS.CHORD_FACTORY);
```

### Step 4: Update Error Handling

```typescript
// Before
try {
  const result = await conversionEngine.convert(input, 'onsong', 'chordpro');
  console.log(result);
} catch (error) {
  console.error(error);
}

// After
const result = await conversionEngine.convert({
  input,
  sourceFormat: NotationFormat.ONSONG,
  targetFormat: NotationFormat.CHORDPRO
});

if (result.success) {
  console.log('Conversion successful:', result.output);
} else {
  console.error('Conversion failed:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

### Step 5: Add Event Handling (Optional)

```typescript
import { setupEventListeners } from './services/dependency-injection/container-setup';

// Set up default event listeners
setupEventListeners(container);

// Or add custom event listeners
const eventManager = container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);

eventManager.subscribe('ConversionCompleted', (event) => {
  // Custom handling
  analytics.track('conversion_completed', {
    requestId: event.requestId,
    outputLength: event.output.length
  });
});
```

## 🧪 Testing Migration

### Update Test Setup

```typescript
// Before
import { ConversionEngine } from '../conversion-engine';

describe('Conversion Tests', () => {
  let engine: ConversionEngine;
  
  beforeEach(() => {
    engine = new ConversionEngine();
  });
});

// After
import { createTestContainer } from '../services/dependency-injection/container-setup';
import { DI_TOKENS } from '../services/dependency-injection/dependency-container';
import { IConversionEngine } from '../types/interfaces/core-interfaces';

describe('Conversion Tests', () => {
  let container: any;
  let engine: IConversionEngine;
  
  beforeEach(() => {
    container = createTestContainer();
    engine = container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
  });
  
  afterEach(() => {
    container.dispose();
  });
});
```

### Mock Dependencies

```typescript
// Create mock implementations for testing
const mockChordFactory = {
  createChord: jest.fn(),
  isValidChord: jest.fn(),
  createChordBuilder: jest.fn()
};

container.registerValue(DI_TOKENS.CHORD_FACTORY, mockChordFactory);
```

## 🔧 Configuration Options

### Container Configuration

```typescript
const container = createConfiguredContainer({
  // Storage backend
  storageType: 'filesystem', // 'filesystem' | 'memory' | 'database'
  storagePath: './data', // Only for filesystem storage
  
  // Error recovery level
  errorRecoveryLevel: 'moderate', // 'strict' | 'moderate' | 'permissive'
  
  // Additional options can be added here
});
```

### Custom Service Registration

```typescript
// Register custom implementations
container.registerSingleton('CustomService', () => new MyCustomService());

// Register with dependencies
container.registerClass('MyService', MyService, ['CustomService'], true);
```

## 📊 Performance Considerations

### Memory Management

```typescript
// Always dispose of containers when done
const container = createConfiguredContainer();

// Use the container...

// Clean up
container.dispose();
```

### Singleton vs Transient Services

Most services are registered as singletons for performance. If you need transient behavior:

```typescript
container.register('TransientService', () => new MyService());
```

## 🐛 Common Issues and Solutions

### Issue 1: "No registration found for token"

**Problem:** Service not registered in container.

**Solution:** Ensure the service is registered in `container-setup.ts` or register it manually:

```typescript
container.registerSingleton('MyService', () => new MyService());
```

### Issue 2: Circular Dependencies

**Problem:** Services depend on each other circularly.

**Solution:** Use factory functions or lazy initialization:

```typescript
container.register('ServiceA', () => {
  const serviceB = container.resolve('ServiceB');
  return new ServiceA(serviceB);
});
```

### Issue 3: Interface Compatibility

**Problem:** Existing code expects concrete classes.

**Solution:** Create adapter classes or update code to use interfaces:

```typescript
// Adapter approach
class LegacyChordServiceAdapter {
  constructor(private chordFactory: IChordFactory) {}
  
  parseChord(chordString: string) {
    return this.chordFactory.createChord(chordString);
  }
}
```

## 🔮 Future Compatibility

### Planned Features

- **Renderer System**: Similar to parser registry for output formatting
- **Plugin Architecture**: Dynamic loading of format parsers
- **Advanced Caching**: Intelligent caching of conversion results
- **Streaming API**: Support for large file processing

### Deprecation Timeline

- **v2.0**: Legacy API marked as deprecated but still functional
- **v2.1**: Compatibility layer with warnings
- **v3.0**: Legacy API removed

## 📚 Additional Resources

- [SOLID Principles Documentation](./SOLID_REFACTORING_SUMMARY.md)
- [API Reference](./docs/api-reference.md)
- [Architecture Decision Records](./docs/adr/)
- [Performance Benchmarks](./src/tests/performance/)

## 🆘 Getting Help

If you encounter issues during migration:

1. Check the [Common Issues](#-common-issues-and-solutions) section
2. Review the [test examples](./src/tests/) for usage patterns
3. Run the [example code](./src/examples/solid-architecture-example.ts)
4. Create an issue with your specific migration problem

## ✅ Migration Checklist

- [ ] Update dependencies and imports
- [ ] Initialize dependency injection container
- [ ] Replace direct instantiation with container resolution
- [ ] Update error handling to use result objects
- [ ] Add event handling if needed
- [ ] Update tests to use new architecture
- [ ] Run performance benchmarks to verify improvements
- [ ] Update documentation and team training materials

---

**Note:** This migration guide covers the major changes. For specific use cases or advanced scenarios, refer to the detailed documentation and examples provided in the codebase.