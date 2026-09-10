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
    <section className="public-hero relative overflow-hidden border-b border-white/15 bg-teal-deep text-white">
      <div className="absolute right-[7%] top-0 hidden h-full w-px bg-white/10 lg:block" />
      <div className="relative mx-auto max-w-[90rem] px-5 py-20 lg:px-10 lg:py-28">
        <p className="label-mono text-primary">{eyebrow}</p>
        <h1 className="mt-5 max-w-6xl font-display text-6xl font-black uppercase leading-[.82] text-primary sm:text-7xl lg:text-[7.6rem]">
          {title}
        </h1>
        {intro && (
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/66 sm:text-lg">
            {intro}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
