"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { hydrateCart, clearCart } from "@/app/lib/redux/features/cart/cartSlice";
import { hydrateWishlist, clearWishlist } from "@/app/lib/redux/features/wishlist/wishlistSlice";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getUserStorageKey,
  getCurrentUserIdentifier,
  STORAGE_KEYS,
} from "@/app/lib/storage";
import { userStoreService } from "@/app/lib/services/userStoreService";
import type { CartItem } from "@/app/lib/redux/features/cart/cartSlice";
import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import type { Coupon } from "@/app/lib/constants/ecommerce";

type PersistedCart = {
  items: CartItem[];
  coupon: Coupon | null;
};

export default function StoreHydration() {
  const dispatch = useAppDispatch();
  const lastUserRef = useRef<string | null | undefined>(undefined);
  const isMigratedRef = useRef(false);

  const hydrateForUser = useCallback(async () => {
    const currentUserId = getCurrentUserIdentifier();
    const prevUserId = lastUserRef.current;
    lastUserRef.current = currentUserId;

    // Migrate legacy global keys if first run and guest keys are empty
    if (!isMigratedRef.current) {
      isMigratedRef.current = true;
      const legacyWishlist = getStorageItem<Product[] | null>(STORAGE_KEYS.wishlist, null);
      if (Array.isArray(legacyWishlist) && legacyWishlist.length > 0) {
        const guestWishKey = getUserStorageKey("wishlist", null);
        const existingGuest = getStorageItem<Product[]>(guestWishKey, []);
        if (existingGuest.length === 0) {
          setStorageItem(guestWishKey, legacyWishlist);
        }
        removeStorageItem(STORAGE_KEYS.wishlist);
      }

      const legacyCart = getStorageItem<PersistedCart | null>(STORAGE_KEYS.cart, null);
      if (legacyCart?.items?.length) {
        const guestCartKey = getUserStorageKey("cart", null);
        const existingGuestCart = getStorageItem<PersistedCart | null>(guestCartKey, null);
        if (!existingGuestCart?.items?.length) {
          setStorageItem(guestCartKey, legacyCart);
        }
        removeStorageItem(STORAGE_KEYS.cart);
      }
    }

    // CASE 1: User is logged in
    if (currentUserId) {
      const userWishlistKey = getUserStorageKey("wishlist", currentUserId);
      const userCartKey = getUserStorageKey("cart", currentUserId);

      let localWishlist = getStorageItem<Product[]>(userWishlistKey, []);
      let localCart = getStorageItem<PersistedCart | null>(userCartKey, null);

      // If transition was from unauthenticated guest -> logged in, check if guest had items to transfer
      if (prevUserId === null) {
        const guestWishKey = getUserStorageKey("wishlist", null);
        const guestCartKey = getUserStorageKey("cart", null);
        const guestWishlist = getStorageItem<Product[]>(guestWishKey, []);
        const guestCart = getStorageItem<PersistedCart | null>(guestCartKey, null);

        if (guestWishlist.length > 0) {
          const mergedWishlist = [...localWishlist];
          for (const item of guestWishlist) {
            if (!mergedWishlist.some((w) => String(w.id) === String(item.id))) {
              mergedWishlist.push(item);
            }
          }
          localWishlist = mergedWishlist;
          setStorageItem(userWishlistKey, localWishlist);
          removeStorageItem(guestWishKey);
        }

        if (guestCart?.items?.length) {
          const mergedCartItems = [...(localCart?.items || [])];
          for (const item of guestCart.items) {
            const match = mergedCartItems.find((c) => String(c.id) === String(item.id));
            if (match) {
              match.quantity += item.quantity;
            } else {
              mergedCartItems.push({ ...item });
            }
          }
          localCart = {
            items: mergedCartItems,
            coupon: localCart?.coupon || guestCart.coupon || null,
          };
          setStorageItem(userCartKey, localCart);
          removeStorageItem(guestCartKey);
        }
      }

      // 1. Immediately hydrate local user cache for instant UI
      dispatch(hydrateWishlist(localWishlist));
      if (localCart?.items) {
        dispatch(hydrateCart({ items: localCart.items, coupon: localCart.coupon ?? null }));
      } else {
        dispatch(hydrateCart({ items: [], coupon: null }));
      }

      // 2. Fetch from backend API to ensure multi-device sync
      try {
        const [serverWishlist, serverCart] = await Promise.all([
          userStoreService.fetchUserWishlist(),
          userStoreService.fetchUserCart(),
        ]);

        // Only apply if user hasn't changed during fetch
        if (getCurrentUserIdentifier() === currentUserId) {
          if (Array.isArray(serverWishlist)) {
            // Merge local and server items
            const finalWishlist = [...serverWishlist];
            for (const item of localWishlist) {
              if (!finalWishlist.some((w) => String(w.id) === String(item.id))) {
                finalWishlist.push(item);
              }
            }
            dispatch(hydrateWishlist(finalWishlist));
            setStorageItem(userWishlistKey, finalWishlist);

            if (finalWishlist.length !== serverWishlist.length) {
              userStoreService.syncUserWishlist(finalWishlist).catch(() => {});
            }
          }

          if (serverCart && Array.isArray(serverCart.items)) {
            const finalCartItems = [...serverCart.items];
            if (localCart?.items) {
              for (const item of localCart.items) {
                const match = finalCartItems.find((c) => String(c.id) === String(item.id));
                if (!match) {
                  finalCartItems.push(item);
                }
              }
            }
            const finalCoupon = serverCart.coupon || localCart?.coupon || null;
            dispatch(hydrateCart({ items: finalCartItems, coupon: finalCoupon }));
            setStorageItem(userCartKey, { items: finalCartItems, coupon: finalCoupon });

            if (finalCartItems.length !== serverCart.items.length) {
              userStoreService.syncUserCart(finalCartItems, finalCoupon).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching remote store data:", err);
      }
    } else {
      // CASE 2: Guest (or logged out)
      const guestWishKey = getUserStorageKey("wishlist", null);
      const guestCartKey = getUserStorageKey("cart", null);

      const guestWishlist = getStorageItem<Product[]>(guestWishKey, []);
      const guestCart = getStorageItem<PersistedCart | null>(guestCartKey, null);

      dispatch(hydrateWishlist(guestWishlist));
      if (guestCart?.items?.length) {
        dispatch(hydrateCart({ items: guestCart.items, coupon: guestCart.coupon ?? null }));
      } else {
        dispatch(clearCart());
      }
    }
  }, [dispatch]);

  useEffect(() => {
    hydrateForUser();

    const handleAuthChange = () => {
      hydrateForUser();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [hydrateForUser]);

  return null;
}
