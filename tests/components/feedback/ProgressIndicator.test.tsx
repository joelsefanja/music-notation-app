/**
 * Unit tests for ProgressIndicator component
 * Tests progress indication functionality and SOLID architecture integration
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
// Import custom matchers from @testing-library/jest-dom
import '@testing-library/jest-dom';
import { ProgressIndicator } from '../../../src/components/feedback/ProgressIndicator';
// DI_TOKENS is imported here to be used in the mock setup for better type safety and consistency.
import { DI_TOKENS } from '../../../src/services/dependency-injection/dependency-container';
// createConfiguredContainer is imported, but its implementation will be mocked.
import { createConfiguredContainer } from '../../../src/services/dependency-injection/container-setup';

// Mock the EventManager instance that the container will resolve
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

// Define a consistent mock container instance that will be returned by both
// createConfiguredContainer and useContainer. This ensures consistency in tests.
const mockContainerInstance = {
  resolve: jest.fn((token: string) => {
    // Use DI_TOKENS constant for better maintainability
    if (token === DI_TOKENS.EVENT_MANAGER) {
      return mockEventManager;
    }
    // Return a default empty object for any other unmocked tokens
    return {};
  })
};

// Mock the dependency injection container setup
jest.mock('../../../src/services/dependency-injection/container-setup', () => ({
  // When createConfiguredContainer is called, it will return our predefined mockContainerInstance
  createConfiguredContainer: jest.fn(() => mockContainerInstance)
}));

// Mock the useContainer hook to return the same mock container instance
jest.mock('../../../src/hooks/useContainer', () => ({
  useContainer: () => mockContainerInstance
}));

describe('ProgressIndicator', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
    // Ensure the DOM is cleaned up after each test to prevent side effects
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders linear progress bar by default', () => {
      render(<ProgressIndicator progress={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders circular progress when variant is circular', () => {
      render(<ProgressIndicator progress={75} variant="circular" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');

      // Check for percentage text in circular variant
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays progress text when provided', () => {
      render(<ProgressIndicator progress={30} text="Converting..." />);

      expect(screen.getByText('Converting...')).toBeInTheDocument();
    });

    it('shows percentage when showPercentage is true', () => {
      render(<ProgressIndicator progress={60} text="Loading" showPercentage={true} />);

      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.getByText('(60%)')).toBeInTheDocument();
    });
  });

  describe('Progress Validation', () => {
    it('clamps progress values to 0-100 range', () => {
      const { rerender } = render(<ProgressIndicator progress={-10} />);

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      rerender(<ProgressIndicator progress={150} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('handles NaN progress values', () => {
      render(<ProgressIndicator progress={NaN} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles undefined progress values', () => {
      // Ensure the ProgressIndicator component's prop types correctly handle undefined
      // For testing, casting to 'any' is acceptable if the component handles it gracefully.
      render(<ProgressIndicator progress={undefined as any} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('Styling and Variants', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(<ProgressIndicator progress={50} size="sm" />);

      // The parent element of the progressbar often holds the size class for linear indicators
      let progressContainer = screen.getByRole('progressbar').parentElement;
      expect(progressContainer).toHaveClass('h-1');

      rerender(<ProgressIndicator progress={50} size="lg" />);

      progressContainer = screen.getByRole('progressbar').parentElement;
      expect(progressContainer).toHaveClass('h-3');
    });

    it('applies custom className', () => {
      render(<ProgressIndicator progress={50} className="custom-class" />);

      // The outermost container often has the custom className
      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-class');
    });

    it('applies different color schemes', () => {
      // Using 'green' as it's an allowed color and maps to bg-green-500
      const { rerender } = render(<ProgressIndicator progress={50} color="green" />);

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-green-500');

      // Using 'orange' as it's an allowed color and maps to bg-orange-500
      rerender(<ProgressIndicator progress={50} color="orange" />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-orange-500');

      // Using 'blue' as it's an allowed color and maps to bg-blue-500
      rerender(<ProgressIndicator progress={50} color="blue" />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-blue-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      render(<ProgressIndicator progress={40} text="Processing" />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '40');

      // Check for the visually hidden text for screen readers
      const srText = screen.getByText('Processing: Progress: 40 percent complete');
      expect(srText).toHaveClass('sr-only');
    });

    it('handles progress without text', () => {
      render(<ProgressIndicator progress={25} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();

      const srText = screen.getByText('Progress: 25 percent complete');
      expect(srText).toHaveClass('sr-only');
    });

    it('provides proper ARIA labels for different states', () => {
      const { rerender } = render(<ProgressIndicator progress={0} text="Starting" />);

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      rerender(<ProgressIndicator progress={100} text="Complete" />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Event Integration', () => {
    it('should publish progress events when progress changes', () => {
      const { rerender } = render(<ProgressIndicator progress={25} />);

      rerender(<ProgressIndicator progress={50} />);

      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ProgressUpdated',
          data: expect.objectContaining({
            progress: 50
          })
        })
      );
    });

    it('should publish completion events when progress reaches 100', () => {
      render(<ProgressIndicator progress={100} />);

      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ProgressCompleted'
        })
      );
    });

    it('should subscribe to progress events on mount', () => {
      render(<ProgressIndicator progress={50} />);

      // Expect subscribe to have been called at least once
      expect(mockEventManager.subscribe).toHaveBeenCalled();
    });

    it('should unsubscribe from events on unmount', () => {
      const { unmount } = render(<ProgressIndicator progress={50} />);

      unmount();

      // Expect unsubscribe to have been called at least once
      expect(mockEventManager.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Animation and Transitions', () => {
    it('should animate progress changes smoothly', () => {
      const { rerender } = render(<ProgressIndicator progress={0} animated={true} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('transition-all'); // Check for the transition class

      rerender(<ProgressIndicator progress={75} animated={true} />);

      // For animated properties, checking inline style is a way to verify the effect
      // Note: This might be brittle if the component uses a different animation mechanism.
      // A more robust test might involve snapshot testing or visual regression.
      expect(progressBar).toHaveStyle('width: 75%');
    });

    it('should respect reduced motion preferences', () => {
      // Mock window.matchMedia to simulate reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(), // Deprecated, but good to mock for older codebases
          removeListener: jest.fn(), // Deprecated
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<ProgressIndicator progress={50} animated={true} />);

      const progressBar = screen.getByRole('progressbar');
      // If prefers-reduced-motion is true, the transition class should NOT be present
      expect(progressBar).not.toHaveClass('transition-all');
    });
  });

  describe('Performance', () => {
    // Use fake timers to control the debounce behavior
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers(); // Ensure any pending timers are flushed
      jest.useRealTimers(); // Restore real timers after each test
    });

    it('should handle rapid progress updates efficiently', () => {
      const { rerender } = render(<ProgressIndicator progress={0} />);

      // Simulate rapid progress updates
      for (let i = 1; i <= 100; i += 10) {
        rerender(<ProgressIndicator progress={i} />);
      }

      // Advance timers to allow debounced updates to process
      jest.runAllTimers();

      const progressBar = screen.getByRole('progressbar');
      // The last value rendered should be the last one passed, or the one after debounce
      // If the component itself has debouncing on rendering, this might need adjustment.
      // Assuming the component updates its internal state immediately and debounces event publishing.
      expect(progressBar).toHaveAttribute('aria-valuenow', '91'); // Last value passed in the loop
    });

    it('should debounce progress events', () => {
      render(<ProgressIndicator progress={0} />); // Initial render, might publish 0%

      // Clear mocks to only count events after the initial render
      jest.clearAllMocks();

      // Rapid updates should be debounced
      // Assuming a debounce time, these should all fall within one debounce window
      render(<ProgressIndicator progress={10} />);
      render(<ProgressIndicator progress={20} />);
      render(<ProgressIndicator progress={30} />);

      // At this point, no debounced event should have fired yet
      expect(mockEventManager.publish).not.toHaveBeenCalled();

      // Advance timers past the debounce delay (e.g., 500ms, adjust as per component's debounce)
      jest.advanceTimersByTime(500); // Assuming a debounce of 500ms

      // After advancing timers, only one event should have been published with the last value
      expect(mockEventManager.publish).toHaveBeenCalledTimes(1);
      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ProgressUpdated',
          data: expect.objectContaining({
            progress: 30 // The last progress value should be published
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid progress values gracefully', () => {
      // Spy on console.error to ensure no unexpected errors are logged
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ProgressIndicator progress={'invalid' as any} />);
      }).not.toThrow(); // Ensure the component doesn't crash

      const progressBar = screen.getByRole('progressbar');
      // Invalid values should default to 0
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      // Optionally, assert that an error was logged if the component is designed to do so
      // expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid progress value'));

      consoleSpy.mockRestore(); // Restore the original console.error implementation
    });

    it('should recover from event manager errors', () => {
      // Mock the publish method to throw an error
      mockEventManager.publish.mockImplementation(() => {
        throw new Error('Event error during publish');
      });

      // Ensure the component renders without throwing even if the event manager fails
      expect(() => {
        render(<ProgressIndicator progress={50} />);
      }).not.toThrow();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');

      // Verify that the publish method was still attempted
      expect(mockEventManager.publish).toHaveBeenCalled();
    });
  });
});
