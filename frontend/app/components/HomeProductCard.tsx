'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import { addToCart } from '@/app/lib/redux/features/cart/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '@/app/lib/redux/features/wishlist/wishlistSlice';
import type { Product } from '@/app/lib/redux/features/product/productsSlice';
import { useToast } from './ToastProvider';

const SmartElectronicsBadge = () => (
  <span className="inline-flex items-center gap-0.5 rounded-full bg-cyan-50 px-1.5 py-0.5 text-[9px] font-black text-cyan-800 border border-cyan-200/90 select-none ml-1 shadow-2xs">
    SmartElectronics <span className="text-amber-500 font-bold">⚡ Verified</span>
  </span>
);

export interface DealProduct extends Product {
  originalPrice?: number;
  badge?: string;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

const HomeProductCard = memo(function HomeProductCard({ product }: { product: DealProduct }) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.thumbnail);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted && selectIsInWishlist(product.id, wishlistItems);

  // Sync state on prop changes
  const prevThumbnailRef = useRef(product.thumbnail);
  if (prevThumbnailRef.current !== product.thumbnail) {
    prevThumbnailRef.current = product.thumbnail;
    setImgSrc(product.thumbnail);
  }

  const discountPct = Math.round(product.discountPercentage);
  const originalPrice =
    product.originalPrice ??
    Math.round(product.price / (1 - discountPct / 100));
  const savings = originalPrice - product.price;
  const outOfStock = typeof product.stock === 'number' ? product.stock <= 0 : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    setAdding(true);
    dispatch(addToCart(product));
    toast(`Added "${product.title.slice(0, 24)}…" to cart!`);
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <article className="deal-card group relative flex flex-col bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl overflow-hidden h-full shadow-xs hover:shadow-xl transition-all duration-300">

        {/* Deal or Out of Stock Badge */}
        {outOfStock ? (
          <span className="absolute top-3 left-3 z-10 rounded-lg bg-rose-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md uppercase tracking-wider">
            Out of Stock
          </span>
        ) : product.badge ? (
          <span className="badge-pulse absolute top-3 left-3 z-10 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md uppercase tracking-wider">
            {product.badge}
          </span>
        ) : null}

        {/* Wishlist Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(toggleWishlist(product));
            toast(
              isWishlisted ? "Removed from wishlist" : "Added to wishlist",
              isWishlisted ? "info" : "success"
            );
          }}
          className={`absolute top-3 right-3 z-10 rounded-full p-2 shadow-sm backdrop-blur-md transition-all hover:scale-110 focus:outline-none border ${
            isWishlisted
              ? "bg-rose-50 border-rose-200 text-rose-500"
              : "bg-white/90 border-slate-100 text-slate-400 hover:text-rose-500"
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'currentColor'}`}
          />
        </button>

        {/* Product Image */}
        <div className="img-zoom-wrap relative h-44 w-full bg-slate-50/50 flex items-center justify-center p-3">
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60")}
          />
          {/* Discount Tag */}
          {discountPct > 0 && (
            <span className="absolute bottom-2 left-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
              {discountPct}% OFF
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
              <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-grow p-3.5 gap-1.5">
          {/* Brand & SubCategory */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {product.brand}
            </span>
            {(product as any).subCategory && (
              <span className="text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded-md">
                {(product as any).subCategory}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-xs font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>

          {/* Star Rating */}
          {product.rating != null && !outOfStock && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-1.5 py-0.5 text-[10px] font-black text-white leading-none">
                {product.rating.toFixed(1)} <Star className="h-2.5 w-2.5 fill-white text-white" />
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                ({(product.rating * 1247 % 3000 + 128).toFixed(0)})
              </span>
              {product.rating >= 4.0 && <SmartElectronicsBadge />}
            </div>
          )}

          {/* Pricing */}
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 mt-0.5">
            <span className="text-sm font-black text-slate-950">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-400 line-through font-semibold">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] font-bold text-violet-600">
            Save ₹{savings.toLocaleString('en-IN')}
          </span>

          {(product as any).couponCode && (
            <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit">
              <span>🏷️</span> Use code <strong className="font-mono font-black text-emerald-800">{(product as any).couponCode}</strong>
            </div>
          )}

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Only {product.stock} left in stock!
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="px-3.5 pb-3.5">
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all duration-200 ${
              outOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : adding
                  ? 'bg-indigo-700 text-white scale-95'
                  : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
            {outOfStock ? 'Out of Stock' : adding ? 'Added! ✓' : 'Add to Cart'}
          </button>
        </div>
      </article>
    </Link>
  );
});

export default HomeProductCard;
