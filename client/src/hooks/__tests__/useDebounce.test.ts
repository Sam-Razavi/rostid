import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });
    rerender({ value: 'second' });
    expect(result.current).toBe('first');
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });
    rerender({ value: 'second' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('second');
  });

  it('resets the timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('c');
  });

  it('uses default delay of 300ms when not specified', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'start' },
    });
    rerender({ value: 'end' });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('start');
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('end');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: 0 },
    });
    rerender({ value: 42 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe(42);
  });
});
