/**
 * Unit tests for OutputPreview component
 * Tests output preview functionality and SOLID architecture integration
 */

import { render, screen, waitFor, cleanup } from '@testing-library/react';
// Import custom matchers from @testing-library/jest-dom
import '@testing-library/jest-dom';
import { OutputPreview } from '../../../src/components/editor/OutputPreview';
import { ContainerProvider } from '../../../src/hooks/useContainer';
import { createConfiguredContainer } from '../../../src/services/dependency-injection/container-setup';
import { DI_TOKENS } from '../../../src/services/dependency-injection/dependency-container';
import { Chordsheet } from '../../../src/types/chordsheet';
import { Section } from '../../../src/types/section';
import { NotationFormat, TextLine, ChordPlacement } from '../../../src/types'; // Import proper types

// Mock the useResponsive hook
jest.mock('../../../src/hooks/useResponsive', () => ({
  useResponsive: () => ({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
    height: 768,
  }),
}));

// Mock the dependency injection container setup.
// We define a single mockContainerInstance to ensure consistency across all mocks.
// Mock the dependency injection container setup.
// We define a single mockContainerInstance to ensure consistency across all mocks.
const mockContainerInstance = {
  resolve: jest.fn((token: string) => {
    if (token === DI_TOKENS.CONVERSION_ENGINE) {
      return mockConversionEngine;
    }
    if (token === DI_TOKENS.EVENT_MANAGER) {
      return mockEventManager;
    }
    if (token === DI_TOKENS.STORAGE_SERVICE) {
      return mockStorageService;
    }
    return {};
  }),
  // Add the missing properties to satisfy the DependencyContainer interface
  registrations: {},
  register: jest.fn(),
  registerSingleton: jest.fn(),
  isRegistered: jest.fn(),
  unregister: jest.fn(),
  clearInstances: jest.fn(),
  reset: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  clear: jest.fn(),
  getRegisteredTokens: jest.fn(),
  registerValue: jest.fn(),
  registerClass: jest.fn(),
  // ADD THESE TWO MISSING PROPERTIES:
  createChild: jest.fn(() => mockContainerInstance), // createChild typically returns a new container, so we can return the same mock for simplicity in tests
  dispose: jest.fn(),
};

// Mock the specific services that the OutputPreview component will depend on
const mockConversionEngine = {
  convert: jest.fn(),
  detectFormat: jest.fn(),
  getSupportedFormats: jest.fn().mockReturnValue([NotationFormat.CHORDPRO, NotationFormat.ONSONG]),
  validateInput: jest.fn().mockReturnValue(true)
};

const mockEventManager = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  publish: jest.fn(),
  clear: jest.fn(),
  dispose: jest.fn(),
  getHandlerCount: jest.fn().mockReturnValue(0),
  getRegisteredEventTypes: jest.fn().mockReturnValue([]),
  hasHandlers: jest.fn().mockReturnValue(false),
  subscribeToMultiple: jest.fn(),
  unsubscribeFromMultiple: jest.fn(),
  subscribeOnce: jest.fn()
};

const mockStorageService = {
  save: jest.fn(),
  load: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  list: jest.fn(),
  clear: jest.fn(),
  getStorageInfo: jest.fn(),
  exportData: jest.fn(),
  importData: jest.fn()
};

// Mock the container setup to return our consistent mock instance
jest.mock('../../../src/services/dependency-injection/container-setup', () => ({
  createConfiguredContainer: jest.fn(() => mockContainerInstance)
}));

// Test wrapper component to provide the mocked container to the OutputPreview
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ContainerProvider container={mockContainerInstance}>
    {children}
  </ContainerProvider>
);

// Helper function to create properly typed TextLine objects
const createTextLine = (text: string, lineNumber: number, chords: ChordPlacement[] = []): TextLine => ({
  type: 'text',
  text,
  chords,
  lineNumber
});

describe('OutputPreview', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
    // Ensure the DOM is cleaned up after each test to prevent side effects
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders empty state when no content is provided', () => {
      render(
        <TestWrapper>
          <OutputPreview />
        </TestWrapper>
      );

      expect(screen.getByText('No content to preview')).toBeInTheDocument();
      expect(screen.getByText(/Enter or paste your chord sheet content/)).toBeInTheDocument();
    });

    it('displays the provided string value (legacy support)', () => {
      const testValue = 'Converted chord sheet content';
      render(
        <TestWrapper>
          <OutputPreview value={testValue} />
        </TestWrapper>
      );

      expect(screen.getByText(testValue)).toBeInTheDocument();
    });

    it('displays Preview header', () => {
      render(
        <TestWrapper>
          <OutputPreview value="" />
        </TestWrapper>
      );

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <OutputPreview value="test" className="custom-class" />
        </TestWrapper>
      );

      // It's more robust to query for the element that actually receives the class if possible.
      // If the component passes the className to its main container, this should work.
      // If OutputPreview's root element is a div with role='main', this is a good selector.
      const previewContainer = screen.getByRole('main');
      expect(previewContainer).toHaveClass('custom-class');
    });
  });

  describe('Chordsheet Rendering', () => {
    it('renders chordsheet with metadata', () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Amazing Grace',
        artist: 'John Newton',
        originalKey: 'C',
        sections: [
          {
            type: 'verse',
            title: 'Verse 1',
            lines: [createTextLine('Amazing grace how sweet the sound', 1)]
          }
        ]
      };

      render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      expect(screen.getByText('Amazing Grace')).toBeInTheDocument();
      expect(screen.getByText('by John Newton')).toBeInTheDocument();
      expect(screen.getByText('Key: C')).toBeInTheDocument();
      expect(screen.getByText('Verse 1')).toBeInTheDocument();
      expect(screen.getByText('Amazing grace how sweet the sound')).toBeInTheDocument();
    });

    it('renders sections without chordsheet wrapper', () => {
      const sections: Section[] = [
        {
          type: 'chorus',
          lines: [createTextLine('How sweet the sound', 1)]
        }
      ];

      render(
        <TestWrapper>
          <OutputPreview sections={sections} />
        </TestWrapper>
      );

      expect(screen.getByText('Chorus')).toBeInTheDocument();
      expect(screen.getByText('How sweet the sound')).toBeInTheDocument();
    });

    it('prioritizes chordsheet over sections over string value', () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Test Song',
        originalKey: 'C',
        sections: []
      };

      const sections: Section[] = [
        {
          type: 'verse',
          lines: [createTextLine('Section text', 1)]
        }
      ];

      render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} sections={sections} value="String value" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.queryByText('Section text')).not.toBeInTheDocument();
      expect(screen.queryByText('String value')).not.toBeInTheDocument();
    });

    it('handles compact mode', () => {
      const sections: Section[] = [
        {
          type: 'verse',
          lines: [createTextLine('Test', 1)]
        }
      ];

      render(
        <TestWrapper>
          <OutputPreview sections={sections} compactMode={true} />
        </TestWrapper>
      );

      // In compact mode, sections should have less spacing.
      // Assuming the 'main' role element is the container that gets this class.
      const sectionContainer = screen.getByRole('main');
      expect(sectionContainer).toHaveClass('space-y-3');
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading overlay when isLoading is true', () => {
      render(
        <TestWrapper>
          <OutputPreview value="Some content" isLoading={true} />
        </TestWrapper>
      );

      // Check for the visible "Converting..." text and the screen reader text
      expect(screen.getAllByText('Converting...')).toHaveLength(2); // One visible, one for screen readers
      expect(screen.getByText('Some content')).toBeInTheDocument();
    });

    it('shows progress indicator when progress is provided', () => {
      render(
        <TestWrapper>
          <OutputPreview value="" isLoading={true} progress={50} progressText="Processing..." />
        </TestWrapper>
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    });

    it('displays error message when error is provided', () => {
      const errorMessage = 'Test error message';
      render(
        <TestWrapper>
          <OutputPreview value="" error={errorMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('prioritizes error display over loading', () => {
      const errorMessage = 'Test error';
      render(
        <TestWrapper>
          <OutputPreview value="" isLoading={true} error={errorMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Converting...')).not.toBeInTheDocument();
    });
  });

  describe('SOLID Architecture Integration', () => {
    it('should publish preview update events', async () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Test Song',
        originalKey: 'C',
        sections: []
      };

      render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PreviewUpdated',
          data: expect.objectContaining({
            chordsheet: chordsheet
          })
        })
      );
    });

    it('should auto-save preview content when enabled', async () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Test Song',
        originalKey: 'C',
        sections: []
      };

      render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockStorageService.save).toHaveBeenCalledWith(
          expect.any(String), // The key for saving
          expect.objectContaining({
            chordsheet: chordsheet
          })
        );
      });
    });

    it('should handle conversion errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock conversion error
      mockConversionEngine.convert.mockRejectedValue(new Error('Conversion failed'));

      render(
        <TestWrapper>
          <OutputPreview value="test content"/>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/conversion error/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should subscribe to conversion events', () => {
      render(
        <TestWrapper>
          <OutputPreview value="" />
        </TestWrapper>
      );

      expect(mockEventManager.subscribe).toHaveBeenCalledWith(
        'ConversionCompleted',
        expect.any(Function)
      );
    });

    it('should handle real-time updates from conversion engine', async () => {
      render(
        <TestWrapper>
          <OutputPreview value="" />
        </TestWrapper>
      );

      // Simulate conversion event
      const conversionEvent = {
        type: 'ConversionCompleted',
        data: {
          result: {
            success: true,
            result: 'Converted content',
            errors: [],
            warnings: []
          }
        }
      };

      // Get the event handler that was registered
      const eventHandler = mockEventManager.subscribe.mock.calls.find(
        call => call[0] === 'ConversionCompleted'
      )?.[1];

      if (eventHandler) {
        eventHandler(conversionEvent);
      }

      await waitFor(() => {
        expect(screen.getByText('Converted content')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Test Song',
        originalKey: 'C',
        sections: [
          {
            type: 'verse',
            title: 'Verse 1', // Added title for the region aria-label
            lines: [createTextLine('Test line', 1)]
          }
        ]
      };

      render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Chord sheet preview');
      // Assuming the section renders a role="region" with its title as aria-label
      expect(screen.getByRole('region', { name: 'Verse section' })).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      render(
        <TestWrapper>
          <OutputPreview value="" isLoading={true} />
        </TestWrapper>
      );

      // This expects a visually hidden element with aria-live="polite" and the text "Converting content"
      const loadingAnnouncement = screen.getByText(/Converting content/i, { selector: '.sr-only' });
      expect(loadingAnnouncement).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce errors to screen readers', () => {
      const errorMessage = 'Test error';
      render(
        <TestWrapper>
          <OutputPreview value="" error={errorMessage} />
        </TestWrapper>
      );

      // This expects a visually hidden element with aria-live="assertive" and the text "Error occurred"
      const errorAnnouncement = screen.getByText(/Error occurred/i, { selector: '.sr-only' });
      expect(errorAnnouncement).toHaveAttribute('aria-live', 'assertive');
    });

    it('should support keyboard navigation', () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Test Song',
        originalKey: 'C',
        sections: [
          {
            type: 'verse',
            lines: [createTextLine('Test line', 1)]
          }
        ]
      };

      render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      const previewContainer = screen.getByRole('main');
      expect(previewContainer).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Performance', () => {
    it('should memoize rendered content', () => {
      const chordsheet: Chordsheet = {
        id: 'test-1',
        title: 'Test Song',
        originalKey: 'C',
        sections: []
      };

      const { rerender } = render(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      // Clear event manager calls to check if new events are published on rerender
      mockEventManager.publish.mockClear();

      // Rerender with same chordsheet (should not trigger new publish if memoized)
      rerender(
        <TestWrapper>
          <OutputPreview chordsheet={chordsheet} />
        </TestWrapper>
      );

      // Should not publish duplicate events if the component is memoized correctly
      expect(mockEventManager.publish).not.toHaveBeenCalled();
    });

    it('should cleanup event subscriptions on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <OutputPreview value="" />
        </TestWrapper>
      );

      unmount();

      // Expect unsubscribe to have been called at least once
      expect(mockEventManager.unsubscribe).toHaveBeenCalled();
    });

    it('should handle large chordsheets efficiently', () => {
      const largeSections = Array.from({ length: 100 }, (_, i) => ({
        type: 'verse' as const,
        title: `Verse ${i + 1}`,
        lines: [createTextLine(`Line ${i + 1} content`, i + 1)]
      }));

      const largeChordsheet: Chordsheet = {
        id: 'large-test',
        title: 'Large Song',
        originalKey: 'C',
        sections: largeSections
      };

      render(
        <TestWrapper>
          <OutputPreview chordsheet={largeChordsheet} />
        </TestWrapper>
      );

      expect(screen.getByText('Large Song')).toBeInTheDocument();
      expect(screen.getByText('Verse 1')).toBeInTheDocument();
      // Optionally, you could add a performance assertion here, e.g., checking render time
      // or number of DOM nodes, but that's more advanced.
    });
  });

  describe('Error Handling', () => {
    it('should handle missing services gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock container to return null for services
      const brokenContainer = {
        resolve: jest.fn(() => null) // Simulate services not being resolved
      };

      expect(() => {
        render(
          <ContainerProvider container={brokenContainer as any}>
            <OutputPreview value="test" />
          </ContainerProvider>
        );
      }).not.toThrow(); // Ensure the component doesn't crash

      // Depending on how OutputPreview handles missing services,
      // it might render an empty state or a specific error message.
      // For now, just ensuring it doesn't throw.
      // You might want to add an assertion here, e.g., expect(screen.getByText('Error loading services')).toBeInTheDocument();
      // if your component provides such a fallback.
      expect(consoleSpy).toHaveBeenCalled(); // Expect console error if services are null

      consoleSpy.mockRestore();
    });

    it('should handle malformed chordsheet data', () => {
      const malformedChordsheet = {
        // Missing required fields, or fields with incorrect types
        id: 'malformed-test',
        title: 'Malformed Song',
        sections: null // sections should be an array, not null
      } as any; // Cast to any to allow invalid type for testing

      render(
        <TestWrapper>
          <OutputPreview chordsheet={malformedChordsheet} />
        </TestWrapper>
      );

      // Expect the component to display an error message for malformed data
      expect(screen.getByText(/invalid chordsheet data/i)).toBeInTheDocument();
    });
  });
});