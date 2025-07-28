import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChordTransition, useChordTransition, calculateChordPositions } from '../../../src/components/animations/ChordTransition';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, transition, whileHover, layout, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, variants, initial, animate, exit, layout, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('ChordTransition', () => {
  const sampleChords = [
    {
      id: 'chord-1',
      value: 'C',
      originalValue: 'C',
      position: { x: 0, y: 0 },
      isChanging: false,
    },
    {
      id: 'chord-2',
      value: 'F',
      originalValue: 'F',
      position: { x: 60, y: 0 },
      isChanging: true,
    },
  ];

  it('renders chord transitions correctly', () => {
    render(<ChordTransition chords={sampleChords} />);
    
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('applies correct styling for changing chords', () => {
    render(<ChordTransition chords={sampleChords} />);
    
    const changingChord = screen.getByText('F');
    expect(changingChord).toHaveClass('bg-blue-100', 'text-blue-700');
    
    const staticChord = screen.getByText('C');
    expect(staticChord).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('positions chords correctly', () => {
    const { container } = render(<ChordTransition chords={sampleChords} />);
    
    const chordElements = container.querySelectorAll('[style*="left"]');
    expect(chordElements[0]).toHaveStyle({ left: '0px', top: '0px' });
    expect(chordElements[1]).toHaveStyle({ left: '60px', top: '0px' });
  });

  it('has proper accessibility attributes', () => {
    render(<ChordTransition chords={sampleChords} />);
    
    const container = screen.getByRole('group');
    expect(container).toHaveAttribute('aria-label', 'Chord transitions');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChordTransition chords={sampleChords} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('useChordTransition', () => {
  const TestComponent: React.FC = () => {
    const { isTransitioning, startTransition, completeTransition, isChordTransitioning } = useChordTransition();
    
    return (
      <div>
        <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
        <div data-testid="chord-1-transitioning">{isChordTransitioning('chord-1').toString()}</div>
        <button onClick={() => startTransition(['chord-1', 'chord-2'])}>
          Start Transition
        </button>
        <button onClick={completeTransition}>
          Complete Transition
        </button>
      </div>
    );
  };

  it('manages transition state correctly', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('chord-1-transitioning')).toHaveTextContent('false');
  });

  it('starts transition correctly', () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByText('Start Transition').click();
    });
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
    expect(screen.getByTestId('chord-1-transitioning')).toHaveTextContent('true');
  });

  it('completes transition correctly', () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByText('Start Transition').click();
    });
    
    act(() => {
      screen.getByText('Complete Transition').click();
    });
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('chord-1-transitioning')).toHaveTextContent('false');
  });
});

describe('calculateChordPositions', () => {
  it('calculates positions correctly for single line', () => {
    const text = 'Amazing grace how sweet';
    const chords = [
      { value: 'C', startIndex: 0, endIndex: 0 },
      { value: 'F', startIndex: 8, endIndex: 8 },
    ];
    
    const positions = calculateChordPositions(text, chords, 14, 1.5);
    
    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({ x: 0, y: -10.5 }); // 0 * 8.4, 0 * 21 - 10.5
    expect(positions[1]).toEqual({ x: 67.2, y: -10.5 }); // 8 * 8.4, 0 * 21 - 10.5
  });

  it('calculates positions correctly for multiple lines', () => {
    const text = 'Amazing grace\nhow sweet the sound';
    const chords = [
      { value: 'C', startIndex: 0, endIndex: 0 },
      { value: 'F', startIndex: 14, endIndex: 14 }, // Start of second line
    ];
    
    const positions = calculateChordPositions(text, chords, 14, 1.5);
    
    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({ x: 0, y: -10.5 }); // First line
    expect(positions[1]).toEqual({ x: 0, y: 10.5 }); // Second line
  });

  it('handles empty text', () => {
    const positions = calculateChordPositions('', [], 14, 1.5);
    expect(positions).toEqual([]);
  });

  it('handles different font sizes', () => {
    const text = 'Amazing';
    const chords = [{ value: 'C', startIndex: 0, endIndex: 0 }];
    
    const positions12 = calculateChordPositions(text, chords, 12, 1.5);
    const positions16 = calculateChordPositions(text, chords, 16, 1.5);
    
    // Both should be negative (above text), but 16px should be more negative (further above)
    expect(positions16[0].y).toBeLessThan(positions12[0].y);
    expect(positions12[0].y).toBe(-9); // 12 * 1.5 / 2 = -9
    expect(positions16[0].y).toBe(-12); // 16 * 1.5 / 2 = -12
  });
});