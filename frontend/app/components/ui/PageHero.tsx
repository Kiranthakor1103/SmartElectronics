import { type ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-mesh">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      <div className="section-container relative py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="mb-4 inline-block animate-fade-in rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 shadow-sm backdrop-blur-sm">
              {eyebrow}
            </span>
          )}
          <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="animate-fade-in-up animate-delay-100 mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              {description}
            </p>
          )}
          {children && (
            <div className="animate-fade-in-up animate-delay-200 mt-10 flex flex-wrap items-center justify-center gap-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
