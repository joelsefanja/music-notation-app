/**
 * Unit tests for SectionRenderer component
 * Tests section rendering functionality and SOLID architecture integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionRenderer } from '../../../src/components/editor/SectionRenderer';
import { createConfiguredContainer } from '../../../src/services/dependency-injection/container-setup';
import { DI_TOKENS } from '../../../src/services/dependency-injection/dependency-container';
import { Section } from '../../../src/types/section';
import { TextLine, EmptyLine, AnnotationLine } from '../../../src/types/line';

// Mock the dependency injection container
const mockContainer = createConfiguredContainer({
  storageType: 'memory',
  errorRecoveryLevel: 'moderate'
});

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
      if (token === 'EVENT_MANAGER') {
        return mockEventManager;
      }
      return {};
    })
  }))
}));

// Mock the useContainer hook
jest.mock('../../../src/hooks/useContainer', () => ({
  useContainer: () => mockContainer
}));

describe('SectionRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders verse section with title', () => {
      const section: Section = {
        type: 'verse',
        title: 'Verse 1',
        lines: [
          {
            type: 'text',
            text: 'Amazing grace how sweet the sound',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      expect(screen.getByText('Verse 1')).toBeInTheDocument();
      expect(screen.getByText('Amazing grace how sweet the sound')).toBeInTheDocument();
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Verse 1 section');
    });

    it('renders section without custom title using default title', () => {
      const section: Section = {
        type: 'chorus',
        lines: [
          {
            type: 'text',
            text: 'How sweet the sound',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      expect(screen.getByText('Chorus')).toBeInTheDocument();
      expect(screen.getByText('How sweet the sound')).toBeInTheDocument();
    });

    it('applies correct styling for different section types', () => {
      const verseSection: Section = {
        type: 'verse',
        lines: [{ 
          type: 'text', 
          text: 'Verse text', 
          chords: [],
          lineNumber: 1
        } as TextLine]
      };

      const { rerender } = render(<SectionRenderer section={verseSection} />);
      
      expect(screen.getByRole('region')).toHaveClass('border-blue-300');

      const chorusSection: Section = {
        type: 'chorus',
        lines: [{ 
          type: 'text', 
          text: 'Chorus text', 
          chords: [],
          lineNumber: 1
        } as TextLine]
      };

      rerender(<SectionRenderer section={chorusSection} />);
      
      expect(screen.getByRole('region')).toHaveClass('border-green-300');
    });

    it('renders empty section with placeholder', () => {
      const section: Section = {
        type: 'verse',
        title: 'Empty Verse',
        lines: []
      };

      render(<SectionRenderer section={section} />);
      
      expect(screen.getByText('Empty Verse')).toBeInTheDocument();
      expect(screen.getByText('(Empty section)')).toBeInTheDocument();
    });
  });

  describe('Mixed Line Types', () => {
    it('renders section with mixed line types', () => {
      const section: Section = {
        type: 'verse',
        lines: [
          {
            type: 'text',
            text: 'Amazing grace',
            chords: [],
            lineNumber: 1
          } as TextLine,
          {
            type: 'empty',
            count: 1,
            lineNumber: 2
          } as EmptyLine,
          {
            type: 'annotation',
            value: 'Play softly',
            annotationType: 'instruction',
            lineNumber: 3
          } as AnnotationLine
        ]
      };

      const { container } = render(<SectionRenderer section={section} />);
      
      expect(screen.getByText('Amazing grace')).toBeInTheDocument();
      expect(screen.getByText('Play softly')).toBeInTheDocument();
      
      // Check for empty line using container query since it's aria-hidden
      const emptyLineElement = container.querySelector('.empty-line');
      expect(emptyLineElement).toBeInTheDocument();
    });
  });

  describe('Section Types', () => {
    it('does not show title for unknown section type without custom title', () => {
      const section: Section = {
        type: 'unknown',
        lines: [
          {
            type: 'text',
            text: 'Some text',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      expect(screen.queryByText('Section')).not.toBeInTheDocument();
      expect(screen.getByText('Some text')).toBeInTheDocument();
    });

    it('shows title for unknown section type with custom title', () => {
      const section: Section = {
        type: 'unknown',
        title: 'Custom Section',
        lines: [
          {
            type: 'text',
            text: 'Some text',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      expect(screen.getByText('Custom Section')).toBeInTheDocument();
      expect(screen.getByText('Some text')).toBeInTheDocument();
    });

    it('renders all section types with correct default titles', () => {
      const sectionTypes: Array<{ type: Section['type'], expectedTitle: string }> = [
        { type: 'verse', expectedTitle: 'Verse' },
        { type: 'chorus', expectedTitle: 'Chorus' },
        { type: 'bridge', expectedTitle: 'Bridge' },
        { type: 'pre-chorus', expectedTitle: 'Pre-Chorus' },
        { type: 'intro', expectedTitle: 'Intro' },
        { type: 'outro', expectedTitle: 'Outro' },
        { type: 'instrumental', expectedTitle: 'Instrumental' },
        { type: 'solo', expectedTitle: 'Solo' },
        { type: 'coda', expectedTitle: 'Coda' },
        { type: 'tag', expectedTitle: 'Tag' },
        { type: 'note', expectedTitle: 'Note' }
      ];

      sectionTypes.forEach(({ type, expectedTitle }) => {
        const section: Section = {
          type,
          lines: [{ 
            type: 'text', 
            text: 'Test', 
            chords: [],
            lineNumber: 1
          } as TextLine]
        };

        const { unmount } = render(<SectionRenderer section={section} />);
        
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Event Integration', () => {
    it('should subscribe to section events on mount', () => {
      const section: Section = {
        type: 'verse',
        lines: [
          {
            type: 'text',
            text: 'Test line',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      expect(mockEventManager.subscribe).toHaveBeenCalled();
    });

    it('should unsubscribe from events on unmount', () => {
      const section: Section = {
        type: 'verse',
        lines: [
          {
            type: 'text',
            text: 'Test line',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      const { unmount } = render(<SectionRenderer section={section} />);
      
      unmount();
      
      expect(mockEventManager.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes for sections', () => {
      const section: Section = {
        type: 'verse',
        title: 'Verse 1',
        lines: [
          {
            type: 'text',
            text: 'Test line',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      const sectionElement = screen.getByRole('region');
      expect(sectionElement).toHaveAttribute('aria-label', 'Verse 1 section');
    });

    it('provides proper heading structure', () => {
      const section: Section = {
        type: 'chorus',
        title: 'Chorus',
        lines: [
          {
            type: 'text',
            text: 'Test line',
            chords: [],
            lineNumber: 1
          } as TextLine
        ]
      };

      render(<SectionRenderer section={section} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid section data gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const invalidSection = {
        type: null,
        lines: null
      } as any;

      expect(() => {
        render(<SectionRenderer section={invalidSection} />);
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('handles missing line data gracefully', () => {
      const section: Section = {
        type: 'verse',
        lines: [
          null as any,
          {
            type: 'text',
            text: 'Valid line',
            chords: [],
            lineNumber: 2
          } as TextLine
        ]
      };

      expect(() => {
        render(<SectionRenderer section={section} />);
      }).not.toThrow();
      
      expect(screen.getByText('Valid line')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large sections efficiently', () => {
      const lines: TextLine[] = [];
      for (let i = 0; i < 100; i++) {
        lines.push({
          type: 'text',
          text: `Line ${i}`,
          chords: [],
          lineNumber: i + 1
        } as TextLine);
      }

      const section: Section = {
        type: 'verse',
        lines
      };

      const startTime = performance.now();
      render(<SectionRenderer section={section} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});