import { useCallback } from 'react';

const STORAGE_KEY = 'rostid_recently_viewed';
const MAX_ITEMS = 8;

interface RecentlyViewedProduct {
  id: string;
  slug: string;
  name: string;
  priceOre: number;
  imageUrl?: string | null;
  viewedAt: number;
}

function getStored(): RecentlyViewedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedProduct[]) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const track = useCallback((product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    const existing = getStored().filter((p) => p.id !== product.id);
    const updated = [{ ...product, viewedAt: Date.now() }, ...existing].slice(0, MAX_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage may be unavailable
    }
  }, []);

  const getAll = useCallback((): RecentlyViewedProduct[] => {
    return getStored().sort((a, b) => b.viewedAt - a.viewedAt);
  }, []);

  return { track, getAll };
}
