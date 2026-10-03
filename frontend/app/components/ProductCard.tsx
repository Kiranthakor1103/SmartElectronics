'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, memo } from 'react';
import { useAppDispatch } from '@/app/lib/redux/hooks';
import { addToCart } from '@/app/lib/redux/features/cart/cartSlice';
import type { Product } from '@/app/lib/redux/features/product/productsSlice';
import WishlistButton from './WishlistButton';
import { useToast } from './ToastProvider';
import { ShoppingBag, Star } from 'lucide-react';

const SmartElectronicsBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[9px] font-black text-cyan-800 border border-cyan-200/90 select-none shadow-2xs">
    SmartElectronics <span className="text-amber-500 font-bold">⚡ Verified</span>
  </span>
);

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const displayImage = product.thumbnail ?? product.images?.[0] ?? '/placeholder.svg';
  const displayTitle = product.title ?? 'Untitled Product';
  
  const [imgSrc, setImgSrc] = useState(displayImage);

  // Keep state in sync with prop changes
  const prevImageRef = useRef(displayImage);
  if (prevImageRef.current !== displayImage) {
    prevImageRef.current = displayImage;
    setImgSrc(displayImage);
  }

  const discountPercent = product.discountPercentage ? Math.round(product.discountPercentage) : 0;
  const outOfStock = typeof product.stock === 'number' ? product.stock <= 0 : false;

  return (
    <article className="group relative flex flex-col bg-white p-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 rounded-2xl border border-slate-200/80 hover:border-indigo-300">
      
      {/* Top badges & Wishlist */}
      <div className="flex items-center justify-between z-10 mb-2">
        {outOfStock ? (
          <span className="rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
            Out of Stock
          </span>
        ) : discountPercent > 0 ? (
          <span className="rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 border border-rose-200">
            {discountPercent}% OFF
          </span>
        ) : (
          <span />
        )}
        <WishlistButton product={product} size="sm" />
      </div>

      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="relative mb-3 flex h-48 w-full items-center justify-center img-zoom-wrap rounded-xl p-2 bg-slate-50/50">
        <Image
          src={imgSrc}
          alt={displayTitle}
          fill
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
          className="object-contain"
          onError={() => setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60")}
        />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs text-xs font-black text-white uppercase tracking-wider rounded-xl">
            Out of Stock
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow text-left">
        {/* Brand & SubCategory Pill */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          {product.brand && (
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {product.brand}
            </span>
          )}
          {(product as any).subCategory && (
            <span className="text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
              {(product as any).subCategory}
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`} className="group-hover:text-indigo-600 transition-colors">
          <h3 className="line-clamp-2 text-xs font-bold text-slate-800 leading-snug">
            {displayTitle}
          </h3>
        </Link>
        
        {product.rating != null && !outOfStock && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-0.5 text-[10px] font-black text-white leading-none shadow-xs">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="h-2.5 w-2.5 fill-white text-white" />
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              ({Math.floor((product.rating * 100) % 400) + 12})
            </span>
            {product.rating >= 4.0 && <SmartElectronicsBadge />}
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-black text-slate-950">₹{product.price.toLocaleString("en-IN")}</span>
          {discountPercent > 0 && (
            <span className="text-xs text-slate-400 line-through font-semibold">
              ₹{Math.round(product.price / (1 - discountPercent / 100)).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {(product as any).couponCode && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg w-fit">
            <span>🏷️</span> Use coupon <span className="font-mono font-black text-emerald-800 underline">{(product as any).couponCode}</span>
          </div>
        )}
      </div>
      
      {/* Add to Cart button */}
      <button
        type="button"
        disabled={outOfStock}
        onClick={(e) => {
          e.preventDefault();
          if (outOfStock) return;
          dispatch(addToCart(product));
          toast('Added to cart');
        }}
        className={outOfStock
          ? "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-400 border border-slate-200 cursor-not-allowed"
          : "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.98]"
        }
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        <span>{outOfStock ? 'OUT OF STOCK' : 'Add to Cart'}</span>
      </button>
    </article>
  );
});

export default ProductCard;
