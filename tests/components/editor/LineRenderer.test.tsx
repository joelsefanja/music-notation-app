import React from 'react'; // Keep this line
import { render, screen } from '@testing-library/react'; // Keep this line
import '@testing-library/jest-dom';
import { LineRenderer, TextLineRenderer, EmptyLineRenderer, AnnotationLineRenderer } from '../../../src/components/editor/LineRenderer';
import { TextLine, EmptyLine, AnnotationLine } from '../../../src/types/line';
import { ChordPlacement } from '../../../src/types/chord';

describe('LineRenderer', () => {
  describe('TextLineRenderer', () => {
    it('renders text line without chords', () => {
      const line: TextLine = {
        type: 'text',
        text: 'Amazing grace how sweet the sound',
        chords: [],
        lineNumber: 1
      };

      render(<TextLineRenderer line={line} />);
      
      expect(screen.getByText('Amazing grace how sweet the sound')).toBeInTheDocument();
      expect(screen.getByRole('text')).toHaveAttribute('aria-label', 'Text line: Amazing grace how sweet the sound');
    });

    it('renders text line with chords above (default)', () => {
      const chords: ChordPlacement[] = [
        {
          value: 'C',
          originalText: '[C]',
          startIndex: 0,
          endIndex: 0,
          placement: 'above'
        },
        {
          value: 'F',
          originalText: '[F]',
          startIndex: 8,
          endIndex: 8,
          placement: 'above'
        }
      ];

      const line: TextLine = {
        type: 'text',
        text: 'Amazing grace how sweet the sound',
        chords,
        lineNumber: 1
      };

      render(<TextLineRenderer line={line} />);
      
      expect(screen.getByText('Amazing grace how sweet the sound')).toBeInTheDocument();
      expect(screen.getByText(/C/)).toBeInTheDocument();
      expect(screen.getByText(/F/)).toBeInTheDocument();
    });

    it('renders text line with inline chords', () => {
      const chords: ChordPlacement[] = [
        {
          value: 'C',
          originalText: '[C]',
          startIndex: 0,
          endIndex: 0,
          placement: 'inline'
        }
      ];

      const line: TextLine = {
        type: 'text',
        text: 'Amazing grace',
        chords,
        lineNumber: 1
      };

      render(<TextLineRenderer line={line} />);
      
      expect(screen.getByText('Amazing grace')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('EmptyLineRenderer', () => {
    it('renders single empty line by default', () => {
      const line: EmptyLine = {
        type: 'empty',
        count: 1,
        lineNumber: 1
      };

      const { container } = render(<EmptyLineRenderer line={line} />);
      
      const emptyLineElement = container.querySelector('.empty-line');
      expect(emptyLineElement).toBeInTheDocument();
      expect(emptyLineElement).toHaveAttribute('aria-hidden', 'true');
      expect(emptyLineElement).toHaveAttribute('role', 'presentation');
    });

    it('renders multiple empty lines when count is specified', () => {
      const line: EmptyLine = {
        type: 'empty',
        count: 3,
        lineNumber: 1
      };

      const { container } = render(<EmptyLineRenderer line={line} />);
      
      const emptyLineElement = container.querySelector('.empty-line');
      expect(emptyLineElement).toHaveStyle({ height: '4.5rem' }); // 3 * 1.5rem
    });
  });

  describe('AnnotationLineRenderer', () => {
    it('renders comment annotation', () => {
      const line: AnnotationLine = {
        type: 'annotation',
        value: 'This is a comment',
        annotationType: 'comment',
        lineNumber: 1
      };

      render(<AnnotationLineRenderer line={line} />);
      
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
      expect(screen.getByText(/Comment:/)).toBeInTheDocument();
      expect(screen.getByRole('note')).toHaveAttribute('aria-label', 'Comment: This is a comment');
    });

    it('renders instruction annotation with proper styling', () => {
      const line: AnnotationLine = {
        type: 'annotation',
        value: 'Play slowly',
        annotationType: 'instruction',
        lineNumber: 1
      };

      render(<AnnotationLineRenderer line={line} />);
      
      expect(screen.getByText('Play slowly')).toBeInTheDocument();
      expect(screen.getByText(/Instruction:/)).toBeInTheDocument();
      expect(screen.getByRole('note')).toHaveClass('text-orange-700');
    });

    it('renders tempo annotation', () => {
      const line: AnnotationLine = {
        type: 'annotation',
        value: '120 BPM',
        annotationType: 'tempo',
        lineNumber: 1
      };

      render(<AnnotationLineRenderer line={line} />);
      
      expect(screen.getByText('120 BPM')).toBeInTheDocument();
      expect(screen.getByText(/Tempo:/)).toBeInTheDocument();
      expect(screen.getByRole('note')).toHaveClass('text-green-700');
    });

    it('renders dynamics annotation', () => {
      const line: AnnotationLine = {
        type: 'annotation',
        value: 'forte',
        annotationType: 'dynamics',
        lineNumber: 1
      };

      render(<AnnotationLineRenderer line={line} />);
      
      expect(screen.getByText('forte')).toBeInTheDocument();
      expect(screen.getByText(/Dynamics:/)).toBeInTheDocument();
      expect(screen.getByRole('note')).toHaveClass('text-purple-700');
    });
  });

  describe('LineRenderer (main component)', () => {
    it('renders text line correctly', () => {
      const line: TextLine = {
        type: 'text',
        text: 'Test text',
        chords: [],
        lineNumber: 1
      };

      render(<LineRenderer line={line} />);
      
      expect(screen.getByText('Test text')).toBeInTheDocument();
    });

    it('renders empty line correctly', () => {
      const line: EmptyLine = {
        type: 'empty',
        count: 2,
        lineNumber: 1
      };

      const { container } = render(<LineRenderer line={line} />);
      
      const emptyLineElement = container.querySelector('.empty-line');
      expect(emptyLineElement).toBeInTheDocument();
      expect(emptyLineElement).toHaveAttribute('role', 'presentation');
    });

    it('renders annotation line correctly', () => {
      const line: AnnotationLine = {
        type: 'annotation',
        value: 'Test annotation',
        annotationType: 'comment',
        lineNumber: 1
      };

      render(<LineRenderer line={line} />);
      
      expect(screen.getByText('Test annotation')).toBeInTheDocument();
    });

    it('renders fallback for unknown line types', () => {
      const unknownLine = {
        type: 'unknown',
        data: 'some data'
      } as any;

      render(<LineRenderer line={unknownLine} />);
      
      expect(screen.getByText('Unknown line type:')).toBeInTheDocument();
    });
  });
});