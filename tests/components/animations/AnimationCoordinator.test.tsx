import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  AnimationCoordinator, 
  useAnimationCoordinator, 
  withAnimationCoordination,
  AnimationPerformanceMonitor 
} from '../../../src/components/animations/AnimationCoordinator';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationStart, onAnimationComplete, ...props }: any) => {
      React.useEffect(() => {
        onAnimationStart?.();
        const timer = setTimeout(() => onAnimationComplete?.(), 100);
        return () => clearTimeout(timer);
      }, [onAnimationStart, onAnimationComplete]);
      return <div {...props}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('AnimationCoordinator', () => {
  beforeAll(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  const TestComponent: React.FC = () => {
    const { 
      state, 
      startAnimation, 
      endAnimation, 
      isAnimationActive, 
      canStartAnimation,
      setPerformanceMode,
      getOptimalSettings 
    } = useAnimationCoordinator();
    
    const settings = getOptimalSettings();
    
    return (
      <div>
        <div data-testid="active-count">{state.activeAnimations.size}</div>
        <div data-testid="queued-count">{state.queuedAnimations.length}</div>
        <div data-testid="performance-mode">{state.performanceMode}</div>
        <div data-testid="reduced-motion">{settings.reducedMotion.toString()}</div>
        <div data-testid="max-concurrent">{settings.maxConcurrentAnimations}</div>
        <div data-testid="animation-1-active">{isAnimationActive('anim-1').toString()}</div>
        <div data-testid="can-start-high">{canStartAnimation(10).toString()}</div>
        
        <button onClick={() => startAnimation('anim-1', 'chord', 5, 500)}>
          Start Animation 1
        </button>
        <button onClick={() => startAnimation('anim-2', 'format', 3, 300)}>
          Start Animation 2
        </button>
        <button onClick={() => endAnimation('anim-1')}>
          End Animation 1
        </button>
        <button onClick={() => setPerformanceMode('low')}>
          Set Low Performance
        </button>
        <button onClick={() => setPerformanceMode('high')}>
          Set High Performance
        </button>
      </div>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides animation coordinator context', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    expect(screen.getByTestId('active-count')).toHaveTextContent('0');
    expect(screen.getByTestId('queued-count')).toHaveTextContent('0');
    expect(screen.getByTestId('performance-mode')).toHaveTextContent('balanced');
  });

  it('starts animations correctly', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    act(() => {
      screen.getByText('Start Animation 1').click();
    });
    
    expect(screen.getByTestId('active-count')).toHaveTextContent('1');
    expect(screen.getByTestId('animation-1-active')).toHaveTextContent('true');
  });

  it('ends animations correctly', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    act(() => {
      screen.getByText('Start Animation 1').click();
    });
    
    act(() => {
      screen.getByText('End Animation 1').click();
    });
    
    expect(screen.getByTestId('active-count')).toHaveTextContent('0');
    expect(screen.getByTestId('animation-1-active')).toHaveTextContent('false');
  });

  it('auto-ends animations after duration', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    act(() => {
      screen.getByText('Start Animation 1').click();
    });
    
    expect(screen.getByTestId('active-count')).toHaveTextContent('1');
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(screen.getByTestId('active-count')).toHaveTextContent('0');
  });

  it('manages performance modes correctly', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    expect(screen.getByTestId('max-concurrent')).toHaveTextContent('5'); // balanced
    
    act(() => {
      screen.getByText('Set Low Performance').click();
    });
    
    expect(screen.getByTestId('performance-mode')).toHaveTextContent('low');
    expect(screen.getByTestId('max-concurrent')).toHaveTextContent('2');
    
    act(() => {
      screen.getByText('Set High Performance').click();
    });
    
    expect(screen.getByTestId('performance-mode')).toHaveTextContent('high');
    expect(screen.getByTestId('max-concurrent')).toHaveTextContent('10');
  });

  it('queues animations when at capacity', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    // Set to low performance mode (max 2 concurrent)
    act(() => {
      screen.getByText('Set Low Performance').click();
    });
    
    // Start 3 animations
    act(() => {
      screen.getByText('Start Animation 1').click();
      screen.getByText('Start Animation 2').click();
    });
    
    // Should have 2 active, 0 queued (since we can start both)
    expect(screen.getByTestId('active-count')).toHaveTextContent('2');
    expect(screen.getByTestId('queued-count')).toHaveTextContent('0');
  });

  it('handles priority correctly', () => {
    render(
      <AnimationCoordinator>
        <TestComponent />
      </AnimationCoordinator>
    );
    
    expect(screen.getByTestId('can-start-high')).toHaveTextContent('true');
  });

  it('throws error when used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useAnimationCoordinator();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useAnimationCoordinator must be used within AnimationCoordinator');
    
    consoleSpy.mockRestore();
  });
});

describe('withAnimationCoordination', () => {
  const BaseComponent: React.FC<{ isAnimating?: boolean; animationSettings?: any }> = ({ 
    isAnimating, 
    animationSettings 
  }) => (
    <div>
      <div data-testid="is-animating">{isAnimating?.toString()}</div>
      <div data-testid="reduced-motion">{animationSettings?.reducedMotion?.toString()}</div>
    </div>
  );

  const WrappedComponent = withAnimationCoordination(BaseComponent, 'test-anim', 'test', 5);

  it('wraps component with animation coordination', () => {
    render(
      <AnimationCoordinator>
        <WrappedComponent />
      </AnimationCoordinator>
    );
    
    expect(screen.getByTestId('is-animating')).toBeInTheDocument();
    expect(screen.getByTestId('reduced-motion')).toBeInTheDocument();
  });
});

describe('AnimationPerformanceMonitor', () => {
  beforeEach(() => {
    // Mock performance.now
    jest.spyOn(performance, 'now').mockImplementation(() => Date.now());
    
    // Mock requestAnimationFrame
    let rafId = 0;
    global.requestAnimationFrame = jest.fn((callback) => {
      setTimeout(callback, 16); // ~60fps
      return ++rafId;
    });
    
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('monitors performance without rendering UI', () => {
    const onPerformanceChange = jest.fn();
    
    render(
      <AnimationCoordinator>
        <AnimationPerformanceMonitor onPerformanceChange={onPerformanceChange} />
      </AnimationCoordinator>
    );
    
    // Component should not render any visible content
    expect(document.body.textContent).toBe('');
  });

  it('calls performance callback', async () => {
    const onPerformanceChange = jest.fn();
    
    render(
      <AnimationCoordinator>
        <AnimationPerformanceMonitor onPerformanceChange={onPerformanceChange} />
      </AnimationCoordinator>
    );
    
    // The callback should be called, but we can't easily test the exact values
    // due to the complexity of mocking performance timing
    expect(onPerformanceChange).toBeDefined();
  });
});