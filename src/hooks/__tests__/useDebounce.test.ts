import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 250ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    // Value should still be the old one
    expect(result.current).toBe('initial');

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Change value multiple times rapidly
    rerender({ value: 'change1', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    rerender({ value: 'change2', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    // Should still be initial value because timer was reset
    expect(result.current).toBe('initial');
    
    rerender({ value: 'final', delay: 500 });
    
    // Fast-forward full delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should now be the final value
    expect(result.current).toBe('final');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'updated', delay: 100 });
    
    // Fast-forward by 100ms
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    expect(result.current).toBe('updated');
  });

  it('should handle different value types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 500 } }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100, delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe(100);
  });

  it('should handle object values', () => {
    const initialObj = { name: 'initial' };
    const updatedObj = { name: 'updated' };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 500 } }
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj, delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe(updatedObj);
  });
});