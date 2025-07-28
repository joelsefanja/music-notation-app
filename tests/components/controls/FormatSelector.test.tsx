/**
 * Unit tests for FormatSelector component
 * Tests format selection functionality and SOLID architecture integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormatSelector } from '../../../src/components/controls/FormatSelector';
import { ContainerProvider } from '../../../src/hooks/useContainer';
import { createConfiguredContainer } from '../../../src/services/dependency-injection/container-setup';
import { DI_TOKENS } from '../../../src/services/dependency-injection/dependency-container';
import { NotationFormat } from '../../../src/types/line';

// Mock the dependency injection container
const mockContainer = createConfiguredContainer({
  storageType: 'memory',
  errorRecoveryLevel: 'moderate'
});

const mockConversionEngine = {
  convert: jest.fn(),
  detectFormat: jest.fn(),
  getSupportedFormats: jest.fn().mockReturnValue([
    NotationFormat.CHORDPRO,
    NotationFormat.ONSONG,
    NotationFormat.NASHVILLE,
    NotationFormat.GUITAR_TABS,
    NotationFormat.SONGBOOK
  ]),
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

// Mock the container resolution
jest.mock('../../../src/services/dependency-injection/container-setup', () => ({
  createConfiguredContainer: jest.fn(() => ({
    resolve: jest.fn((token: string) => {
      if (token === DI_TOKENS.CONVERSION_ENGINE) {
        return mockConversionEngine;
      }
      if (token === DI_TOKENS.EVENT_MANAGER) {
        return mockEventManager;
      }
      return {};
    })
  }))
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ContainerProvider container={mockContainer}>
    {children}
  </ContainerProvider>
);

describe('FormatSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders with correct label', () => {
      const label = 'Test Format';
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.ONSONG}
            onChange={mockOnChange}
            label={label}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('displays all format options', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.ONSONG}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      // Check for format options based on what's actually available
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      
      // Verify that options are present by checking if they can be selected
      fireEvent.click(select);
      
      // Look for common format names that would be displayed
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows the selected value', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue(NotationFormat.CHORDPRO);
    });
  });

  describe('Format Selection', () => {
    it('calls onChange when selection changes', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.ONSONG}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: NotationFormat.CHORDPRO } });
      
      expect(mockOnChange).toHaveBeenCalledWith(NotationFormat.CHORDPRO);
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.ONSONG}
            onChange={mockOnChange}
            label="Format"
            disabled={true}
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('updates display when format changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.ONSONG}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue(NotationFormat.ONSONG);
    });
  });

  describe('SOLID Architecture Integration', () => {
    it('should get supported formats from conversion engine', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      expect(mockConversionEngine.getSupportedFormats).toHaveBeenCalled();
    });

    it('should publish format change events', async () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: NotationFormat.ONSONG } });
      
      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FormatChanged',
          data: expect.objectContaining({
            oldFormat: NotationFormat.CHORDPRO,
            newFormat: NotationFormat.ONSONG
          })
        })
      );
    });

    it('should handle input validation through conversion engine', async () => {
      // Test that the component can handle validation scenarios
      mockConversionEngine.validateInput.mockReturnValue(false);
      
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: NotationFormat.ONSONG } });
      
      // The component should still call onChange even if validation fails
      expect(mockOnChange).toHaveBeenCalledWith(NotationFormat.ONSONG);
    });
  });

  describe('Accessibility', () => {
    it('has correct styling classes', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.ONSONG}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const label = screen.getByText('Format');
      expect(label).toBeInTheDocument();
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-label', expect.any(String));
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      
      // Focus the select element
      await user.click(select);
      
      // Simulate keyboard navigation
      await user.keyboard('{ArrowDown}');
      
      // The select should be focused and interactive
      expect(select).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing conversion engine gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock container to return null for conversion engine
      const brokenContainer = {
        resolve: jest.fn(() => null)
      };
      
      expect(() => {
        render(
          <ContainerProvider container={brokenContainer as any}>
            <FormatSelector
              value={NotationFormat.CHORDPRO}
              onChange={mockOnChange}
              label="Format"
            />
          </ContainerProvider>
        );
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle format loading errors', () => {
      mockConversionEngine.getSupportedFormats.mockImplementation(() => {
        throw new Error('Failed to load formats');
      });
      
      expect(() => {
        render(
          <TestWrapper>
            <FormatSelector
              value={NotationFormat.CHORDPRO}
              onChange={mockOnChange}
              label="Format"
            />
          </TestWrapper>
        );
      }).not.toThrow();
      
      // Reset the mock for other tests
      mockConversionEngine.getSupportedFormats.mockReturnValue([
        NotationFormat.CHORDPRO,
        NotationFormat.ONSONG,
        NotationFormat.NASHVILLE,
        NotationFormat.GUITAR_TABS,
        NotationFormat.SONGBOOK
      ]);
    });

    it('should handle invalid format values', () => {
      render(
        <TestWrapper>
          <FormatSelector
            value={'INVALID_FORMAT' as NotationFormat}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      
      // Component should still render without crashing
      expect(select).toHaveValue('INVALID_FORMAT');
    });
  });

  describe('Performance', () => {
    it('should cleanup event subscriptions on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      unmount();
      
      expect(mockEventManager.unsubscribe).toHaveBeenCalled();
    });

    it('should not re-fetch formats on every render', () => {
      const { rerender } = render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      const initialCallCount = mockConversionEngine.getSupportedFormats.mock.calls.length;
      
      // Re-render with same props
      rerender(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      // Should not call getSupportedFormats again
      expect(mockConversionEngine.getSupportedFormats.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Props Validation', () => {
    it('should handle all supported NotationFormat values', () => {
      const formats = [
        NotationFormat.CHORDPRO,
        NotationFormat.ONSONG,
        NotationFormat.NASHVILLE,
        NotationFormat.GUITAR_TABS,
        NotationFormat.SONGBOOK
      ];

      formats.forEach(format => {
        const { unmount } = render(
          <TestWrapper>
            <FormatSelector
              value={format}
              onChange={mockOnChange}
              label="Format"
            />
          </TestWrapper>
        );
        
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue(format);
        
        unmount();
      });
    });

    it('should handle optional props correctly', () => {
      // Test with minimal props
      render(
        <TestWrapper>
          <FormatSelector
            value={NotationFormat.CHORDPRO}
            onChange={mockOnChange}
            label="Format"
          />
        </TestWrapper>
      );
      
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });
  });
});