'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import {
  addToCart,
  decrementQuantity,
  removeFromCart,
  clearCart,
  syncCartStock,
} from '@/app/lib/redux/features/cart/cartSlice';
import { ProductService } from '@/services/productService';
import { PageHero } from '@/app/components/ui/PageHero';
import { ButtonLink } from '@/app/components/ui/Button';
import PromoCodeInput from '@/app/components/PromoCodeInput';
import FreeShippingBar from '@/app/components/FreeShippingBar';
import { useToast } from '@/app/components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { subtotal, discount, shipping, total, coupon } = useAppSelector((state) => state.cart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live stock synchronization: ensure items in cart reflect real-time DB inventory
  useEffect(() => {
    if (cartItems.length > 0) {
      Promise.all(
        cartItems.map((item) =>
          ProductService.getProductById(item.id).then((fresh) =>
            fresh && typeof fresh.stock === 'number' ? { id: item.id, stock: fresh.stock } : null
          )
        )
      ).then((results) => {
        const validUpdates = results.filter(Boolean) as { id: number; stock: number }[];
        if (validUpdates.length > 0) {
          dispatch(syncCartStock(validUpdates));
        }
      });
    }
  }, [cartItems.length, dispatch]);

  const outOfStockItems = cartItems.filter((i) => typeof i.stock === 'number' && i.stock <= 0);
  const hasOutOfStockItems = outOfStockItems.length > 0;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (hasOutOfStockItems) {
      toast('Please remove out-of-stock items before checkout', 'error');
      return;
    }
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <>
        <PageHero
          eyebrow="Cart"
          title="Shopping cart"
          description="Loading your items…"
        />
        <div className="section-container pb-20">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="h-32 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
              <div className="h-32 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Cart"
          title="Your cart is empty"
          description="Explore our curated products and find something you'll love."
        />
        <div className="section-container pb-20 text-center">
          <ButtonLink href="/products" variant="secondary" size="lg">
            Browse Products
          </ButtonLink>
        </div>
      </>
    );
  }

  const afterDiscount = subtotal - discount;

  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="Shopping cart"
        description={`${cartItems.reduce((n, i) => n + i.quantity, 0)} items · Review and checkout securely`}
      />

      <section className="pb-20">
        <div className="section-container">
          <div className="mb-8">
            <FreeShippingBar subtotal={afterDiscount} />
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {hasOutOfStockItems && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-xs flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="text-sm font-bold">Action required: Out of stock items in cart</h4>
                    <p className="text-xs text-rose-700">
                      Some items in your cart are currently out of stock. Please remove them before proceeding to checkout.
                    </p>
                  </div>
                </div>
              )}
              {cartItems.map((item) => {
                const itemImage =
                  item.thumbnail || (item.images && item.images[0]) || '/placeholder.svg';
                const isOut = typeof item.stock === 'number' && item.stock <= 0;
                const isMaxQty = typeof item.stock === 'number' && item.quantity >= item.stock;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${
                      isOut ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
                    }`}
                  >
                    <Link
                      href={`/products/${item.id}`}
                      className="relative mx-auto h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:mx-0"
                    >
                      <Image src={itemImage} alt="" fill className="object-contain p-2" />
                    </Link>

                    <div className="min-w-0 flex-grow text-center sm:text-left">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="line-clamp-1 text-lg font-bold text-slate-900 hover:text-indigo-600">
                          {item.title}
                        </h3>
                      </Link>
                      {item.brand && (
                        <p className="mt-0.5 text-sm text-slate-500">{item.brand}</p>
                      )}
                      {isOut && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          Out of Stock
                        </span>
                      )}
                      <p className="mt-1 font-semibold text-slate-900 sm:hidden">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 sm:justify-end">
                      <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => dispatch(decrementQuantity(item.id))}
                          className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 focus-ring"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] px-2 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isMaxQty || isOut) {
                              toast('Maximum available stock reached', 'info');
                              return;
                            }
                            dispatch(addToCart(item));
                          }}
                          disabled={isMaxQty || isOut}
                          className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed focus-ring"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="hidden min-w-[90px] text-right sm:block">
                        <p className="font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          dispatch(removeFromCart(item.id));
                          toast('Item removed', 'info');
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 focus-ring"
                        aria-label={`Remove ${item.title}`}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
                <Link
                  href="/products"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  ← Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearCart());
                    toast('Cart cleared', 'info');
                  }}
                  className="text-sm font-semibold text-slate-500 hover:text-rose-500"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
                <PromoCodeInput />

                <div className="space-y-3 border-t border-slate-100 pt-6 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount{coupon ? ` (${coupon.code})` : ''}</span>
                      <span className="font-semibold">−₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">
                      {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || hasOutOfStockItems}
                  className={`w-full rounded-xl py-4 text-sm font-semibold text-white shadow-lg transition focus-ring ${
                    hasOutOfStockItems
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50'
                  }`}
                >
                  {hasOutOfStockItems
                    ? 'Remove Out of Stock Items'
                    : isCheckingOut
                    ? 'Processing…'
                    : 'Proceed to Checkout'}
                </button>

                <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Z" clipRule="evenodd" />
                  </svg>
                  Secure payments with Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
