'use client';

import { ButtonLink } from '@/app/components/ui/Button';

export default function CancelPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-mesh px-4 py-16">
      <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-red-500 to-amber-500" aria-hidden="true" />

        <div className="relative mb-6 flex justify-center">
          <div className="absolute h-20 w-20 animate-pulse rounded-full bg-rose-100 opacity-30" aria-hidden="true" />
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-rose-100 bg-rose-50">
            <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Checkout cancelled
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500 sm:text-base">
          No charges were made. Your cart items are still saved.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left text-sm text-slate-600">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
            What happened?
          </h2>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
              <span><strong>Backed out?</strong> Your cart is fully preserved.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
              <span><strong>Card declined?</strong> Double-check your card details.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
              <span><strong>Network issue?</strong> Ensure stable internet before retrying.</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/cart" variant="secondary" className="flex-1 w-full">
            Return to Cart
          </ButtonLink>
          <ButtonLink href="/products" variant="outline" className="flex-1 w-full">
            Browse Products
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
