import { type ReactNode } from "react";

export function CTASection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-slate-900" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(at 30% 20%, rgb(99 102 241 / 0.5) 0px, transparent 50%), radial-gradient(at 80% 80%, rgb(139 92 246 / 0.4) 0px, transparent 50%)",
        }}
        aria-hidden="true"
      />
      <div className="section-container relative text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">{description}</p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {children}
        </div>
      </div>
    </section>
  );
}
