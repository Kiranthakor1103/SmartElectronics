"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  title,
  discountPercent,
}: {
  images: string[];
  title: string;
  discountPercent?: number;
}) {
  const gallery = images.length > 0 ? images : ["/placeholder.svg"];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 sm:min-h-[400px] lg:min-h-[480px]">
        <Image
          src={gallery[active]}
          alt={`${title} — image ${active + 1}`}
          width={500}
          height={500}
          className="max-h-[280px] w-full object-contain p-6 sm:max-h-[380px] lg:max-h-[440px]"
          priority
        />
        {discountPercent != null && discountPercent > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
            -{discountPercent}% OFF
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                active === i
                  ? "border-indigo-600 ring-2 ring-indigo-600/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
            >
              <Image src={src} alt="" fill className="object-contain p-1" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
