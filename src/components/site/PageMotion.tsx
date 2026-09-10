import { useEffect, useRef } from "react";

const LOADER_HIDDEN_EVENT = "tona:loader-hidden";

const MOTION_TARGET_SELECTOR = [
  "main section",
  "main section h1",
  "main section h2",
  "main section h3",
  "main section h4",
  "main section p",
  "main section article",
  "main section form",
  "main section img",
  "main section .grid > *",
  "main section a.brand-button",
  "main section button",
].join(",");

type PageMotionProps = {
  pathname: string;
};

export function PageMotion({ pathname }: PageMotionProps) {
  const isFirstPage = useRef(true);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = Array.from(
      main.querySelectorAll<HTMLElement>(MOTION_TARGET_SELECTOR),
    );
    let animationFrame: number | undefined;
    let fallbackTimer: number | undefined;
    let observer: IntersectionObserver | undefined;
    let started = false;
    const finishTimers: number[] = [];
    const motionDelays = new Map<HTMLElement, number>();
    const sectionTargetCounts = new Map<Element, number>();

    targets.forEach((target, index) => {
      const section = target.closest("section") ?? target;
      const sectionTargetCount = sectionTargetCounts.get(section) ?? 0;
      sectionTargetCounts.set(section, sectionTargetCount + 1);

      const motionType = target.matches("section")
        ? "section"
        : target.matches("img")
          ? "media"
          : target.matches("article, form, .grid > *")
            ? "card"
            : target.matches("h1, h2, h3, h4")
              ? "headline"
              : "item";
      const delay = Math.min(sectionTargetCount, 6) * 75;

      target.dataset.tonaMotion = motionType;
      target.style.setProperty("--tona-motion-delay", `${delay}ms`);
      target.style.setProperty(
        "--tona-motion-x",
        `${index % 2 === 0 ? -18 : 18}px`,
      );
      motionDelays.set(target, delay);
    });

    const finishMotion = (target: HTMLElement) => {
      target.classList.remove("is-visible");
      delete target.dataset.tonaMotion;
      target.style.removeProperty("--tona-motion-delay");
      target.style.removeProperty("--tona-motion-x");
    };

    const revealTarget = (target: HTMLElement) => {
      target.classList.add("is-visible");
      finishTimers.push(
        window.setTimeout(
          () => finishMotion(target),
          1100 + (motionDelays.get(target) ?? 0),
        ),
      );
    };

    const revealAll = () => {
      targets.forEach(revealTarget);
    };

    const startMotion = () => {
      if (started) return;
      started = true;

      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);

      if (reducedMotion || !("IntersectionObserver" in window)) {
        revealAll();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            revealTarget(entry.target as HTMLElement);
            observer?.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -7%",
        },
      );

      animationFrame = window.requestAnimationFrame(() => {
        targets.forEach((target) => observer?.observe(target));
      });
    };

    if (reducedMotion) {
      startMotion();
    } else {
      window.addEventListener(LOADER_HIDDEN_EVENT, startMotion, { once: true });
      fallbackTimer = window.setTimeout(
        startMotion,
        isFirstPage.current ? 2500 : 1250,
      );
    }

    isFirstPage.current = false;

    return () => {
      window.removeEventListener(LOADER_HIDDEN_EVENT, startMotion);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      finishTimers.forEach((timer) => window.clearTimeout(timer));
      observer?.disconnect();

      targets.forEach((target) => {
        finishMotion(target);
      });
    };
  }, [pathname]);

  return null;
}
