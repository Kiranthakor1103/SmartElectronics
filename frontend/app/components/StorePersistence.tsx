"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/app/lib/redux/hooks";
import {
  setStorageItem,
  getUserStorageKey,
  getCurrentUserIdentifier,
} from "@/app/lib/storage";
import { userStoreService } from "@/app/lib/services/userStoreService";

export default function StorePersistence() {
  const cart = useAppSelector((s) => s.cart);
  const wishlist = useAppSelector((s) => s.wishlist.items);

  const debounceWishlistTimer = useRef<NodeJS.Timeout | null>(null);
  const debounceCartTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Avoid running on initial mount before hydration
    if (isInitialMount.current) {
      return;
    }

    const userIdentifier = getCurrentUserIdentifier();
    const cartKey = getUserStorageKey("cart", userIdentifier);

    setStorageItem(cartKey, {
      items: cart.items,
      coupon: cart.coupon,
    });

    if (userIdentifier) {
      if (debounceCartTimer.current) clearTimeout(debounceCartTimer.current);
      debounceCartTimer.current = setTimeout(() => {
        userStoreService.syncUserCart(cart.items, cart.coupon);
      }, 600);
    }
  }, [cart.items, cart.coupon]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const userIdentifier = getCurrentUserIdentifier();
    const wishlistKey = getUserStorageKey("wishlist", userIdentifier);

    setStorageItem(wishlistKey, wishlist);

    if (userIdentifier) {
      if (debounceWishlistTimer.current) clearTimeout(debounceWishlistTimer.current);
      debounceWishlistTimer.current = setTimeout(() => {
        userStoreService.syncUserWishlist(wishlist);
      }, 600);
    }
  }, [wishlist]);

  return null;
}
