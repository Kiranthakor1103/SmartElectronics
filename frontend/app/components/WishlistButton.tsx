"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import {
  toggleWishlist,
  selectIsInWishlist,
} from "@/app/lib/redux/features/wishlist/wishlistSlice";
import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import { useToast } from "./ToastProvider";

export default function WishlistButton({
  product,
  className = "",
  size = "md",
}: {
  product: Product;
  className?: string;
  size?: "sm" | "md";
}) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const isActive = mounted && selectIsInWishlist(product.id, wishlistItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClass = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={() => {
        dispatch(toggleWishlist(product));
        toast(
          isActive ? "Removed from wishlist" : "Added to wishlist",
          isActive ? "info" : "success"
        );
      }}
      className={`flex items-center justify-center rounded-xl border transition-all focus-ring ${
        isActive
          ? "border-rose-200 bg-rose-50 text-rose-500"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-rose-500"
      } ${sizeClass} ${className}`}
      aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isActive}
    >
      <svg
        className={iconClass}
        fill={isActive ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
}
