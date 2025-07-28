import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '../useResponsive';

// Mock window.innerWidth and window.innerHeight
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock window.addEventListener and removeEventListener
const mockEventListener = () => {
  const listeners: { [key: string]: EventListener[] } = {};
  
  window.addEventListener = jest.fn((event: string, listener: EventListener) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(listener);
  });

  window.removeEventListener = jest.fn((event: string, listener: EventListener) => {
    if (listeners[event]) {
      const index = listeners[event].indexOf(listener);
      if (index > -1) {
        listeners[event].splice(index, 1);
      }
    }
  });

  return {
    triggerResize: () => {
      if (listeners.resize) {
        listeners.resize.forEach(listener => listener(new Event('resize')));
      }
    }
  };
};

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns desktop breakpoint for large screens', () => {
    mockWindowSize(1200, 800);
    mockEventListener();

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(800);
  });

  it('returns tablet breakpoint for medium screens', () => {
    mockWindowSize(800, 600);
    mockEventListener();

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe('tablet');
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  it('returns mobile breakpoint for small screens', () => {
    mockWindowSize(400, 600);
    mockEventListener();

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.width).toBe(400);
    expect(result.current.height).toBe(600);
  });

  it('handles breakpoint boundaries correctly', () => {
    const { triggerResize } = mockEventListener();

    // Test mobile/tablet boundary (768px)
    mockWindowSize(767, 600);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.breakpoint).toBe('mobile');

    act(() => {
      mockWindowSize(768, 600);
      triggerResize();
    });

    expect(result.current.breakpoint).toBe('tablet');

    // Test tablet/desktop boundary (1024px)
    act(() => {
      mockWindowSize(1023, 600);
      triggerResize();
    });

    expect(result.current.breakpoint).toBe('tablet');

    act(() => {
      mockWindowSize(1024, 600);
      triggerResize();
    });

    expect(result.current.breakpoint).toBe('desktop');
  });

  it('updates state when window is resized', () => {
    const { triggerResize } = mockEventListener();
    mockWindowSize(1200, 800);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.width).toBe(1200);

    act(() => {
      mockWindowSize(600, 800);
      triggerResize();
    });

    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.width).toBe(600);
  });

  it('adds and removes resize event listener', () => {
    mockWindowSize(1024, 768);
    mockEventListener();

    const { unmount } = renderHook(() => useResponsive());

    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('handles server-side rendering gracefully', () => {
    // Temporarily remove window object to simulate SSR
    const originalWindow = global.window;
    delete (global as any).window;

    const { result } = renderHook(() => useResponsive());

    // Should default to desktop values
    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    // Restore window object
    global.window = originalWindow;
  });
});