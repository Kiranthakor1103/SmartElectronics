"use client";

import { useMemo } from "react";
import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

export default function RelatedProducts({
  product,
  allProducts,
}: {
  product: Product;
  allProducts: Product[];
}) {
  const related = useMemo(() => {
    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category || p.brand === product.brand)
      )
      .slice(0, 4);
  }, [product, allProducts]);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-16">
      <h2 className="mb-8 text-2xl font-bold text-slate-900">You may also like</h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {related.map((p) => (
          <ScrollReveal key={p.id}>
            <ProductCard product={p} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
