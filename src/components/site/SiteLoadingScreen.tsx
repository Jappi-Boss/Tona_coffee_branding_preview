import { useEffect, useRef, useState } from "react";

type LoaderPhase = "showing" | "leaving" | "hidden";

type SiteLoadingScreenProps = {
  routePending: boolean;
};

const announceLoaderHidden = () => {
  window.dispatchEvent(new Event("tona:loader-hidden"));
};

export function SiteLoadingScreen({ routePending }: SiteLoadingScreenProps) {
  const [initialPhase, setInitialPhase] = useState<LoaderPhase>("showing");
  const [initialComplete, setInitialComplete] = useState(false);
  const [navigationPhase, setNavigationPhase] = useState<LoaderPhase>("hidden");
  const navigationStartedAt = useRef<number | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const leaveTimer = window.setTimeout(
      () => setInitialPhase("leaving"),
      reducedMotion ? 350 : 1450,
    );
    const hideTimer = window.setTimeout(
      () => {
        setInitialPhase("hidden");
        setInitialComplete(true);
        announceLoaderHidden();
      },
      reducedMotion ? 500 : 2050,
    );

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!initialComplete) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let leaveTimer: number | undefined;
    let hideTimer: number | undefined;

    if (routePending) {
      navigationStartedAt.current = Date.now();
      setNavigationPhase("showing");
    } else if (navigationStartedAt.current !== null) {
      const elapsed = Date.now() - navigationStartedAt.current;
      const minimumVisibleTime = reducedMotion ? 100 : 550;
      const remainingTime = Math.max(0, minimumVisibleTime - elapsed);

      leaveTimer = window.setTimeout(
        () => setNavigationPhase("leaving"),
        remainingTime,
      );
      hideTimer = window.setTimeout(
        () => {
          setNavigationPhase("hidden");
          navigationStartedAt.current = null;
          announceLoaderHidden();
        },
        remainingTime + (reducedMotion ? 150 : 560),
      );
    }

    return () => {
      if (leaveTimer !== undefined) window.clearTimeout(leaveTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [initialComplete, routePending]);

  const phase = initialPhase === "hidden" ? navigationPhase : initialPhase;
  const isVisible = phase !== "hidden";

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="tona-loader"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label="Loading Tona Coffee"
    >
      <div className="tona-loader__glow" aria-hidden="true" />

      <div className="tona-loader__content">
        <div className="tona-loader__cup" aria-hidden="true">
          <span className="tona-loader__steam tona-loader__steam--one" />
          <span className="tona-loader__steam tona-loader__steam--two" />
          <span className="tona-loader__steam tona-loader__steam--three" />
          <span className="tona-loader__coffee" />
          <span className="tona-loader__handle" />
        </div>

        <img
          src="/tona-logo.png"
          alt="Tona Coffee"
          width="1024"
          height="1024"
          className="tona-loader__logo"
        />

        <div className="tona-loader__copy">
          <p>Stay for Tona</p>
          <span>Stay for the moment</span>
        </div>

        <div className="tona-loader__track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
