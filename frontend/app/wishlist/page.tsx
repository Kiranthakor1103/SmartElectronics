'use client';

import { useSyncExternalStore } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import { clearWishlist } from '@/app/lib/redux/features/wishlist/wishlistSlice';
import { addToCart } from '@/app/lib/redux/features/cart/cartSlice';
import ProductCard from '@/app/components/ProductCard';
import { PageHero } from '@/app/components/ui/PageHero';
import { ButtonLink } from '@/app/components/ui/Button';
import { useToast } from '@/app/components/ToastProvider';
import ScrollReveal from '@/app/components/ScrollReveal';

const emptySubscribe = () => () => {};

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const items = useAppSelector((s) => s.wishlist.items);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((p) => typeof p.stock !== 'number' || p.stock > 0);
    if (inStockItems.length === 0) {
      toast('All wishlist items are currently out of stock', 'error');
      return;
    }
    inStockItems.forEach((p) => dispatch(addToCart(p)));
    toast(`Added ${inStockItems.length} in-stock item${inStockItems.length > 1 ? 's' : ''} to cart`);
  };

  if (!mounted) {
    return (
      <>
        <PageHero
          eyebrow="Wishlist"
          title="Saved for later"
          description="Loading your saved items…"
        />
        <div className="section-container pb-20">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-slate-200/80 bg-white animate-pulse" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Wishlist"
          title="Your wishlist is empty"
          description="Save products you love and come back anytime."
        />
        <div className="section-container pb-20 text-center">
          <ButtonLink href="/products" variant="secondary" size="lg">
            Browse Products
          </ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Wishlist"
        title="Saved for later"
        description={`${items.length} item${items.length !== 1 ? 's' : ''} in your wishlist`}
      />

      <section className="pb-20">
        <div className="section-container">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-ring"
            >
              Add all to cart
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(clearWishlist());
                toast('Wishlist cleared', 'info');
              }}
              className="text-sm font-semibold text-slate-500 hover:text-rose-500"
            >
              Clear wishlist
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ScrollReveal key={product.id}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
