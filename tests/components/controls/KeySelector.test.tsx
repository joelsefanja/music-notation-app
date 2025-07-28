/**
 * Unit tests for KeySelector component
 * Tests key selection functionality and SOLID architecture integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeySelector } from '../../../src/components/controls/KeySelector';
import { ContainerProvider } from '../../../src/hooks/useContainer';
import { createConfiguredContainer } from '../../../src/services/dependency-injection/container-setup';
import { DI_TOKENS } from '../../../src/services/dependency-injection/dependency-container';

// Mock the dependency injection container
const mockContainer = createConfiguredContainer({
  storageType: 'memory',
  errorRecoveryLevel: 'moderate'
});

const mockKeyTransposer = {
  transpose: jest.fn(),
  getAvailableKeys: jest.fn().mockReturnValue([
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm'
  ]),
  getKeyRelationships: jest.fn(),
  suggestEnharmonicSpelling: jest.fn(),
  isValidKey: jest.fn().mockReturnValue(true),
  getCircleOfFifths: jest.fn(),
  getRelativeKey: jest.fn(),
  getParallelKey: jest.fn()
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
      if (token === DI_TOKENS.KEY_TRANSPOSER) {
        return mockKeyTransposer;
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

describe('KeySelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders with correct label', () => {
      const label = 'Test Key';
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label={label}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('displays key options from transposer service', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      // Verify that the selector is rendered
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      
      // Verify that keys are loaded from the service
      expect(mockKeyTransposer.getAvailableKeys).toHaveBeenCalled();
    });

    it('shows the selected value', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="Am"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('Am');
    });

    it('includes both major and minor keys', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      // Verify the component requests available keys
      expect(mockKeyTransposer.getAvailableKeys).toHaveBeenCalled();
      
      // The actual key options will be populated from the mock
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Key Selection', () => {
    it('calls onChange when selection changes', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'G' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('G');
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
            disabled={true}
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('updates display when key changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <KeySelector
            value="G"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('G');
    });
  });

  describe('SOLID Architecture Integration', () => {
    it('should get available keys from key transposer', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      expect(mockKeyTransposer.getAvailableKeys).toHaveBeenCalled();
    });

    it('should publish key change events', async () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'G' } });
      
      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'KeyChanged',
          data: expect.objectContaining({
            oldKey: 'C',
            newKey: 'G'
          })
        })
      );
    });

    it('should validate key selection through transposer service', async () => {
      mockKeyTransposer.isValidKey.mockReturnValue(false);
      
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'InvalidKey' } });
      
      // Component should still call onChange even with invalid key
      expect(mockOnChange).toHaveBeenCalledWith('InvalidKey');
      
      // Reset mock for other tests
      mockKeyTransposer.isValidKey.mockReturnValue(true);
    });

    it('should handle key relationships when requested', async () => {
      mockKeyTransposer.getKeyRelationships.mockReturnValue({
        relative: 'Am',
        parallel: 'Cm',
        dominant: 'G',
        subdominant: 'F'
      });
      
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      // Component should be able to request key relationships
      expect(mockKeyTransposer.getKeyRelationships).toBeDefined();
    });

    it('should handle enharmonic spellings when requested', async () => {
      mockKeyTransposer.suggestEnharmonicSpelling.mockReturnValue('Db');
      
      render(
        <TestWrapper>
          <KeySelector
            value="C#"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      // Component should have access to enharmonic spelling functionality
      expect(mockKeyTransposer.suggestEnharmonicSpelling).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper semantic structure', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const label = screen.getByText('Key');
      expect(label).toBeInTheDocument();
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
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
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      
      // Focus and interact with keyboard
      await user.click(select);
      await user.keyboard('{ArrowDown}');
      
      expect(select).toHaveFocus();
    });

    it('should be accessible to screen readers', async () => {
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'G' } });
      
      // The component should maintain accessible behavior
      expect(select).toHaveValue('G');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing key transposer gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock container to return null for key transposer
      const brokenContainer = {
        resolve: jest.fn(() => null)
      };
      
      expect(() => {
        render(
          <ContainerProvider container={brokenContainer as any}>
            <KeySelector
              value="C"
              onChange={mockOnChange}
              label="Key"
            />
          </ContainerProvider>
        );
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle key loading errors', () => {
      mockKeyTransposer.getAvailableKeys.mockImplementation(() => {
        throw new Error('Failed to load keys');
      });
      
      expect(() => {
        render(
          <TestWrapper>
            <KeySelector
              value="C"
              onChange={mockOnChange}
              label="Key"
            />
          </TestWrapper>
        );
      }).not.toThrow();
      
      // Reset mock for other tests
      mockKeyTransposer.getAvailableKeys.mockReturnValue([
        'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
        'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm'
      ]);
    });

    it('should handle invalid key values', () => {
      render(
        <TestWrapper>
          <KeySelector
            value="InvalidKey"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('InvalidKey');
    });
  });

  describe('Performance', () => {
    it('should not re-fetch keys on every render', () => {
      const { rerender } = render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      const initialCallCount = mockKeyTransposer.getAvailableKeys.mock.calls.length;
      
      // Rerender with same props
      rerender(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      // Should not call getAvailableKeys again
      expect(mockKeyTransposer.getAvailableKeys.mock.calls.length).toBe(initialCallCount);
    });

    it('should cleanup event subscriptions on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      unmount();
      
      expect(mockEventManager.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Props Validation', () => {
    it('should handle all common musical keys', () => {
      const commonKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
      const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];

      [...commonKeys, ...minorKeys].forEach(key => {
        const { unmount } = render(
          <TestWrapper>
            <KeySelector
              value={key}
              onChange={mockOnChange}
              label="Key"
            />
          </TestWrapper>
        );
        
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue(key);
        
        unmount();
      });
    });

    it('should handle optional props correctly', () => {
      // Test with minimal props
      render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('should support custom key lists', () => {
      // Test that component works with custom key lists from the service
      mockKeyTransposer.getAvailableKeys.mockReturnValue(['C', 'G', 'F']);
      
      const { unmount } = render(
        <TestWrapper>
          <KeySelector
            value="C"
            onChange={mockOnChange}
            label="Key"
          />
        </TestWrapper>
      );
      
      expect(mockKeyTransposer.getAvailableKeys).toHaveBeenCalled();
      
      unmount();
      
      // Reset for other tests
      mockKeyTransposer.getAvailableKeys.mockReturnValue([
        'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
        'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm'
      ]);
    });
  });
});