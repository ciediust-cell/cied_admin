import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const isClient =
    typeof window !== "undefined" && typeof window.matchMedia !== "undefined";

  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (!isClient) return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    if (!isClient) return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // `matches` exists on both types
      // @ts-ignore - keep robust across TS lib differences
      setIsMobile(e.matches ?? window.innerWidth < MOBILE_BREAKPOINT);
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener(
        "change",
        onChange as EventListenerOrEventListenerObject,
      );
    } else if (typeof (mql as any).addListener === "function") {
      // older browsers
      (mql as any).addListener(onChange);
    }

    // set initial
    setIsMobile(mql.matches);

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener(
          "change",
          onChange as EventListenerOrEventListenerObject,
        );
      } else if (typeof (mql as any).removeListener === "function") {
        (mql as any).removeListener(onChange);
      }
    };
  }, [isClient]);

  return isMobile;
}
