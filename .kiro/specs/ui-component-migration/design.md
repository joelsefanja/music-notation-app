# UI Component Migration & Optimization Design

## Overview

This design document outlines the architecture for migrating UI component tests, integrating components with the SOLID architecture, implementing dark mode, and achieving comprehensive test coverage.

## Architecture

### Test Structure Migration

```
tests/
├── components/           # Migrated from src/components/__tests__/
│   ├── animations/
│   │   ├── AnimationCoordinator.test.tsx
│   │   ├── ChordTransition.test.tsx
│   │   └── FormatTransition.test.tsx
│   ├── controls/
│   │   ├── FormatSelector.test.tsx
│   │   ├── KeySelector.test.tsx
│   │   └── FileOperations.test.tsx
│   ├── editor/
│   │   ├── InputEditor.test.tsx
│   │   ├── OutputPreview.test.tsx
│   │   ├── LineRenderer.test.tsx
│   │   └── SectionRenderer.test.tsx
│   ├── feedback/
│   │   └── ProgressIndicator.test.tsx
│   └── integration/
│       └── MusicConverter.integration.test.tsx
├── e2e/                 # Playwright tests
│   ├── workflows/
│   ├── accessibility/
│   ├── performance/
│   └── visual-regression/
└── unit/                # Existing unit tests
```

### Component Architecture Integration

```typescript
// Component with SOLID architecture integration
interface ComponentProps {
  conversionEngine: IConversionEngine;
  chordFactory: IChordFactory;
  keyTransposer: IKeyTransposer;
  eventManager: IEventManager;
  storageService: IStorageService;
}

// Using dependency injection
const MusicConverter: React.FC = () => {
  const container = useContainer();
  const conversionEngine = container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
  // ... other services
};
```

## Components and Interfaces

### Theme System

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface DarkModeStyles {
  background: '#000000';
  text: '#FFFFFF';
  input: {
    background: '#1a1a1a';
    border: '#333333';
    text: '#FFFFFF';
  };
  button: {
    background: '#333333';
    hover: '#555555';
    text: '#FFFFFF';
  };
}
```

### Service Integration Hooks

```typescript
// Custom hooks for service integration
const useConversionEngine = () => {
  const container = useContainer();
  return container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
};

const useChordFactory = () => {
  const container = useContainer();
  return container.resolve<IChordFactory>(DI_TOKENS.CHORD_FACTORY);
};

const useKeyTransposer = () => {
  const container = useContainer();
  return container.resolve<IKeyTransposer>(DI_TOKENS.KEY_TRANSPOSER);
};
```

### Component Structure

```typescript
// Modern component structure
const InputEditor: React.FC<InputEditorProps> = ({ 
  onContentChange, 
  initialContent 
}) => {
  const conversionEngine = useConversionEngine();
  const eventManager = useEventManager();
  const { theme } = useTheme();
  
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Component logic with proper error handling and loading states
};
```

## Data Models

### Theme Configuration

```typescript
interface ThemeConfig {
  light: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    input: InputTheme;
    button: ButtonTheme;
  };
  dark: {
    background: '#000000';
    text: '#FFFFFF';
    primary: '#333333';
    secondary: '#555555';
    accent: '#777777';
    border: '#333333';
    input: InputTheme;
    button: ButtonTheme;
  };
}
```

### Test Configuration

```typescript
interface PlaywrightTestConfig {
  coverage: {
    threshold: 100;
    include: ['src/components/**/*'];
    exclude: ['**/*.test.*', '**/*.spec.*'];
  };
  browsers: ['chromium', 'firefox', 'webkit'];
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 768, height: 1024 },
    { width: 375, height: 667 }
  ];
}
```

## Error Handling

### Component Error Boundaries

```typescript
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Service Error Handling

```typescript
const useServiceWithErrorHandling = <T>(
  serviceFactory: () => T,
  errorHandler?: (error: Error) => void
) => {
  const [service, setService] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const serviceInstance = serviceFactory();
      setService(serviceInstance);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      errorHandler?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [serviceFactory, errorHandler]);

  return { service, error, isLoading };
};
```

## Testing Strategy

### Unit Test Migration

1. **File Movement**: Move all test files from `src/components/__tests__/` to `tests/components/`
2. **Import Updates**: Update all imports to use the new SOLID architecture services
3. **Mock Updates**: Update mocks to use the dependency injection container
4. **Test Enhancement**: Add tests for new functionality and error scenarios

### Playwright Test Structure

```typescript
// E2E test structure
test.describe('Music Converter Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should convert chord notation between formats', async ({ page }) => {
    // Test implementation
  });

  test('should work in dark mode', async ({ page }) => {
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });
});
```

### Visual Regression Testing

```typescript
test('should match visual snapshots', async ({ page }) => {
  await page.goto('/');
  
  // Light mode
  await expect(page).toHaveScreenshot('app-light-mode.png');
  
  // Dark mode
  await page.click('[data-testid="theme-toggle"]');
  await expect(page).toHaveScreenshot('app-dark-mode.png');
});
```

## Performance Considerations

### Component Optimization

1. **React.memo**: Wrap components to prevent unnecessary re-renders
2. **useMemo/useCallback**: Optimize expensive calculations and function references
3. **Code Splitting**: Implement lazy loading for large components
4. **Virtual Scrolling**: For large lists of chords or songs

### Service Integration Optimization

1. **Singleton Services**: Use dependency injection to ensure single instances
2. **Service Caching**: Cache conversion results and chord data
3. **Async Operations**: Use proper async/await patterns for service calls
4. **Error Recovery**: Implement retry logic for failed operations

## Security Considerations

### Input Validation

1. **Sanitization**: Sanitize all user input before processing
2. **Validation**: Validate chord notation and file formats
3. **Error Messages**: Avoid exposing sensitive information in error messages

### Storage Security

1. **Local Storage**: Encrypt sensitive data in local storage
2. **File Operations**: Validate file types and sizes
3. **XSS Prevention**: Properly escape user-generated content

## Deployment Strategy

### Build Optimization

1. **Bundle Splitting**: Split code by routes and features
2. **Tree Shaking**: Remove unused code from bundles
3. **Asset Optimization**: Optimize images and fonts
4. **Service Worker**: Implement caching for offline functionality

### Testing Pipeline

1. **Unit Tests**: Run Jest tests for all components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Run Playwright tests across browsers
4. **Visual Tests**: Compare screenshots for regressions
5. **Performance Tests**: Measure load times and interactions