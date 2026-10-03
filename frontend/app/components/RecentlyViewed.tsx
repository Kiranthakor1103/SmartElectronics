"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

export default function RecentlyViewed({
  products,
  currentId,
}: {
  products: Product[];
  currentId?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const items = products.filter((p) => p.id !== currentId).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-16">
      <h2 className="mb-8 text-2xl font-bold text-slate-900">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {items.map((p) => (
          <ScrollReveal key={p.id}>
            <ProductCard product={p} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

