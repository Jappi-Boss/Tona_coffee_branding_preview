import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="leaf-field relative overflow-hidden border-b-8 border-primary bg-teal-deep text-white">
      <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-primary/90" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <p className="label-mono text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-black uppercase leading-[.88] text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/68">
            {intro}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
