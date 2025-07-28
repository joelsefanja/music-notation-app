import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormatTransition, useFormatTransition, PresetFormatTransition } from '../../../src/components/animations/FormatTransition';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, exit, transition, whileHover, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('FormatTransition', () => {
  it('renders current format correctly', () => {
    render(
      <FormatTransition currentFormat="chordpro">
        <div>ChordPro Content</div>
      </FormatTransition>
    );
    
    expect(screen.getByText('CHORDPRO')).toBeInTheDocument();
    expect(screen.getByText('ChordPro Content')).toBeInTheDocument();
  });

  it('shows previous format when provided', () => {
    render(
      <FormatTransition currentFormat="onsong" previousFormat="chordpro">
        <div>OnSong Content</div>
      </FormatTransition>
    );
    
    expect(screen.getByText('ONSONG')).toBeInTheDocument();
    expect(screen.getByText('CHORDPRO')).toBeInTheDocument();
    expect(screen.getByText('from')).toBeInTheDocument();
  });

  it('displays progress indicator', () => {
    const { container } = render(
      <FormatTransition currentFormat="songbook">
        <div>Songbook Content</div>
      </FormatTransition>
    );
    
    const progressBar = container.querySelector('.bg-blue-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormatTransition currentFormat="nashville" className="custom-class">
        <div>Nashville Content</div>
      </FormatTransition>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles different transition types', () => {
    const { rerender } = render(
      <FormatTransition currentFormat="chordpro" transitionType="fade">
        <div>Content</div>
      </FormatTransition>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
    
    rerender(
      <FormatTransition currentFormat="chordpro" transitionType="slide">
        <div>Content</div>
      </FormatTransition>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('useFormatTransition', () => {
  const TestComponent: React.FC = () => {
    const { currentFormat, previousFormat, isTransitioning, changeFormat, resetTransition } = useFormatTransition();
    
    return (
      <div>
        <div data-testid="current-format">{currentFormat}</div>
        <div data-testid="previous-format">{previousFormat}</div>
        <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
        <button onClick={() => changeFormat('chordpro')}>Change to ChordPro</button>
        <button onClick={() => changeFormat('onsong')}>Change to OnSong</button>
        <button onClick={resetTransition}>Reset</button>
      </div>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('manages format transition state correctly', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('current-format')).toHaveTextContent('');
    expect(screen.getByTestId('previous-format')).toHaveTextContent('');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
  });

  it('changes format correctly', async () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByText('Change to ChordPro').click();
    });
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
    
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    expect(screen.getByTestId('current-format')).toHaveTextContent('chordpro');
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
  });

  it('tracks previous format correctly', async () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByText('Change to ChordPro').click();
    });
    
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    act(() => {
      screen.getByText('Change to OnSong').click();
    });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    expect(screen.getByTestId('previous-format')).toHaveTextContent('chordpro');
    expect(screen.getByTestId('current-format')).toHaveTextContent('onsong');
  });

  it('resets transition correctly', () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByText('Change to ChordPro').click();
    });
    
    act(() => {
      screen.getByText('Reset').click();
    });
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('previous-format')).toHaveTextContent('');
  });

  it('ignores same format changes', () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByText('Change to ChordPro').click();
    });
    
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    act(() => {
      screen.getByText('Change to ChordPro').click();
    });
    
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
  });
});

describe('PresetFormatTransition', () => {
  it('renders with smooth preset', () => {
    render(
      <PresetFormatTransition format="chordpro" preset="smooth">
        <div>Content</div>
      </PresetFormatTransition>
    );
    
    expect(screen.getByText('CHORDPRO')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with quick preset', () => {
    render(
      <PresetFormatTransition format="onsong" preset="quick">
        <div>Content</div>
      </PresetFormatTransition>
    );
    
    expect(screen.getByText('ONSONG')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with dramatic preset', () => {
    render(
      <PresetFormatTransition format="nashville" preset="dramatic">
        <div>Content</div>
      </PresetFormatTransition>
    );
    
    expect(screen.getByText('NASHVILLE')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PresetFormatTransition format="songbook" className="custom-class">
        <div>Content</div>
      </PresetFormatTransition>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});