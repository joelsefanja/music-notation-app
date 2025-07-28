/**
 * Unit tests for InputEditor component
 * Tests input editing functionality and SOLID architecture integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputEditor } from '../../../src/components/editor/InputEditor';
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
  detectFormat: jest.fn().mockReturnValue(NotationFormat.CHORDPRO),
  getSupportedFormats: jest.fn().mockReturnValue([NotationFormat.CHORDPRO, NotationFormat.ONSONG]),
  validateInput: jest.fn().mockReturnValue(true)
};

const mockChordFactory = {
  createChord: jest.fn(),
  createNashvilleChord: jest.fn(),
  createChordFromComponents: jest.fn(),
  isValidChord: jest.fn().mockReturnValue(true),
  createSimpleChord: jest.fn(),
  createSlashChord: jest.fn(),
  cloneChord: jest.fn(),
  createBuilder: jest.fn(),
  createNashvilleBuilder: jest.fn()
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

// Mock the container resolution
jest.mock('../../../src/services/dependency-injection/container-setup', () => ({
  createConfiguredContainer: jest.fn(() => ({
    resolve: jest.fn((token: string) => {
      if (token === DI_TOKENS.CONVERSION_ENGINE) {
        return mockConversionEngine;
      }
      if (token === DI_TOKENS.CHORD_FACTORY) {
        return mockChordFactory;
      }
      if (token === DI_TOKENS.EVENT_MANAGER) {
        return mockEventManager;
      }
      if (token === DI_TOKENS.STORAGE_SERVICE) {
        return mockStorageService;
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

describe('InputEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders with default placeholder', () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      expect(screen.getByPlaceholderText('Paste your chord sheet here...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      const customPlaceholder = 'Custom placeholder text';
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} placeholder={customPlaceholder} />
        </TestWrapper>
      );
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('displays the provided value', () => {
      const testValue = 'Test chord sheet content';
      render(
        <TestWrapper>
          <InputEditor value={testValue} onChange={mockOnChange} />
        </TestWrapper>
      );
      
      expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
    });

    it('displays Input header', () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Input')).toBeInTheDocument();
    });
  });

  describe('Input Functionality', () => {
    it('calls onChange when text is entered', () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('New content');
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} disabled={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('has correct styling attributes', () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('font-mono');
      expect(textarea).toHaveAttribute('spellCheck', 'false');
      expect(textarea).toHaveAttribute('autoComplete', 'off');
      expect(textarea).toHaveAttribute('autoCorrect', 'off');
      expect(textarea).toHaveAttribute('autoCapitalize', 'off');
    });

    it('supports multiline input', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3');
      
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('Line 1\\nLine 2\\nLine 3'));
    });
  });

  describe('SOLID Architecture Integration', () => {
    it('should detect format automatically on input change', async () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} autoDetectFormat={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '{title: Test Song}\\n[C]Amazing grace' } });
      
      await waitFor(() => {
        expect(mockConversionEngine.detectFormat).toHaveBeenCalledWith('{title: Test Song}\\n[C]Amazing grace');
      });
    });

    it('should validate chords in real-time', async () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} validateChords={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '[C] [G] [Am] [F]' } });
      
      await waitFor(() => {
        expect(mockChordFactory.isValidChord).toHaveBeenCalled();
      });
    });

    it('should publish input change events', async () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });
      
      expect(mockEventManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'InputChanged',
          data: expect.objectContaining({
            content: 'New content'
          })
        })
      );
    });

    it('should auto-save content when enabled', async () => {
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} autoSave={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Content to save' } });
      
      // Fast-forward debounce timer
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(mockStorageService.save).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            content: 'Content to save'
          })
        );
      });
      
      jest.useRealTimers();
    });

    it('should show format detection results', async () => {
      mockConversionEngine.detectFormat.mockReturnValue(NotationFormat.CHORDPRO);
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} showFormatDetection={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '{title: Test}\\n[C]Test' } });
      
      await waitFor(() => {
        expect(screen.getByText(/detected format: ChordPro/i)).toBeInTheDocument();
      });
    });

    it('should highlight invalid chords', async () => {
      mockChordFactory.isValidChord.mockReturnValue(false);
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} highlightInvalidChords={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '[InvalidChord]' } });
      
      await waitFor(() => {
        expect(screen.getByText(/invalid chord detected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('chord sheet input'));
    });

    it('should support keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      
      // Test Ctrl+A (select all)
      await user.keyboard('{Control>}a{/Control}');
      
      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(textarea.value.length);
    });

    it('should announce format detection to screen readers', async () => {
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} showFormatDetection={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '{title: Test}' } });
      
      await waitFor(() => {
        const announcement = screen.getByLabelText(/format detected/i);
        expect(announcement).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle format detection errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockConversionEngine.detectFormat.mockImplementation(() => {
        throw new Error('Format detection failed');
      });
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} autoDetectFormat={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test content' } });
      
      // Should not crash
      expect(textarea).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle chord validation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockChordFactory.isValidChord.mockImplementation(() => {
        throw new Error('Chord validation failed');
      });
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} validateChords={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '[C]' } });
      
      // Should not crash
      expect(textarea).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle auto-save errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorageService.save.mockRejectedValue(new Error('Save failed'));
      
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} autoSave={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Content' } });
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/auto-save failed/i)).toBeInTheDocument();
      });
      
      jest.useRealTimers();
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should debounce format detection', async () => {
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} autoDetectFormat={true} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Rapid typing
      fireEvent.change(textarea, { target: { value: 'T' } });
      fireEvent.change(textarea, { target: { value: 'Te' } });
      fireEvent.change(textarea, { target: { value: 'Test' } });
      
      // Should not call detectFormat yet
      expect(mockConversionEngine.detectFormat).not.toHaveBeenCalled();
      
      // Fast-forward debounce timer
      jest.advanceTimersByTime(500);
      
      // Now should call detectFormat once
      expect(mockConversionEngine.detectFormat).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });

    it('should cleanup event subscriptions on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <InputEditor value=\"\" onChange={mockOnChange} />
        </TestWrapper>
      );
      
      unmount();
      
      expect(mockEventManager.unsubscribe).toHaveBeenCalled();
    });

    it('should handle large input efficiently', async () => {
      const largeContent = 'Line\\n'.repeat(1000);
      
      render(
        <TestWrapper>
          <InputEditor value={largeContent} onChange={mockOnChange} />
        </TestWrapper>
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(largeContent);
    });
  });
});