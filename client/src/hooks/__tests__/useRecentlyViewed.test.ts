import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentlyViewed } from '../useRecentlyViewed';

const STORAGE_KEY = 'rostid_recently_viewed';

const makeProduct = (id: string) => ({
  id,
  slug: `product-${id}`,
  name: `Product ${id}`,
  priceOre: 10000,
  imageUrl: null,
});

beforeEach(() => {
  localStorage.clear();
});

describe('useRecentlyViewed', () => {
  describe('track', () => {
    it('adds a product to localStorage', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      act(() => result.current.track(makeProduct('1')));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('1');
    });

    it('adds viewedAt timestamp to tracked product', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      act(() => result.current.track(makeProduct('1')));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(typeof stored[0].viewedAt).toBe('number');
    });

    it('moves existing product to front on re-track (deduplication)', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      act(() => result.current.track(makeProduct('1')));
      act(() => result.current.track(makeProduct('2')));
      act(() => result.current.track(makeProduct('1')));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored[0].id).toBe('1');
      expect(stored).toHaveLength(2);
    });

    it('caps the list at 8 items', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      act(() => {
        for (let i = 1; i <= 10; i++) {
          result.current.track(makeProduct(String(i)));
        }
      });
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(8);
    });

    it('newest product is first in list', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      act(() => result.current.track(makeProduct('A')));
      act(() => result.current.track(makeProduct('B')));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored[0].id).toBe('B');
    });
  });

  describe('getAll', () => {
    it('returns empty array when nothing stored', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      expect(result.current.getAll()).toEqual([]);
    });

    it('returns stored products sorted by viewedAt descending', () => {
      const { result } = renderHook(() => useRecentlyViewed());
      act(() => result.current.track(makeProduct('X')));
      act(() => result.current.track(makeProduct('Y')));
      const all = result.current.getAll();
      expect(all[0].id).toBe('Y');
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {{{');
      const { result } = renderHook(() => useRecentlyViewed());
      expect(result.current.getAll()).toEqual([]);
    });
  });
});
