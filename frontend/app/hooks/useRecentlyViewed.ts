"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "@/app/lib/storage";

const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(getStorageItem<Product[]>(STORAGE_KEYS.recentlyViewed, []));
  }, []);

  const addRecentlyViewed = useCallback((product: Product) => {
    setItems((prev) => {
      const base = prev.length > 0 ? prev : getStorageItem<Product[]>(STORAGE_KEYS.recentlyViewed, []);
      const filtered = base.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX_ITEMS);
      setStorageItem(STORAGE_KEYS.recentlyViewed, next);
      return next;
    });
  }, []);

  return { recentlyViewed: items, addRecentlyViewed };
}

