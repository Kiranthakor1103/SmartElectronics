"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import {
  removeFromCart,
  decrementQuantity,
  addToCart,
} from "@/app/lib/redux/features/cart/cartSlice";
import FreeShippingBar from "./FreeShippingBar";

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
}

export default function MiniCart({ open, onClose }: MiniCartProps) {
  const dispatch = useAppDispatch();
  const { items, subtotal, total, discount, shipping } = useAppSelector((s) => s.cart);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            Cart ({items.reduce((n, i) => n + i.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-ring"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-slate-500">Your cart is empty</p>
            <Link
              href="/products"
              onClick={onClose}
              className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <div className="mb-4">
                <FreeShippingBar subtotal={subtotal - discount} />
              </div>
              <ul className="space-y-4">
                {items.map((item) => {
                  const img =
                    item.thumbnail || item.images?.[0] || "/placeholder.svg";
                  const isOut = typeof item.stock === 'number' && item.stock <= 0;
                  const isMaxQty = typeof item.stock === 'number' && item.quantity >= item.stock;
                  return (
                    <li key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50">
                        <Image src={img} alt="" fill className="object-contain p-1" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-700">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {isOut && (
                            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => dispatch(decrementQuantity(item.id))}
                            className="h-7 w-7 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={isMaxQty || isOut}
                            onClick={() => {
                              if (!isMaxQty && !isOut) {
                                dispatch(addToCart(item));
                              }
                            }}
                            className="h-7 w-7 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="ml-auto text-xs text-rose-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-slate-100 px-5 py-5">
              <div className="space-y-1 text-sm">
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <Link
                href="/cart"
                onClick={onClose}
                className="mt-4 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Cart
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="mt-2 block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
