import * as React from "react";

const MOBILE_BREAKPOINT = 768;

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export function useIsMobile() {
  const isClient =
    typeof window !== "undefined" && typeof window.matchMedia !== "undefined";

  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (!isClient) return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    if (!isClient) return;

    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    ) as LegacyMediaQueryList;
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
    } else if (typeof mql.addListener === "function") {
      // older browsers
      mql.addListener(onChange);
    }

    // set initial
    setIsMobile(mql.matches);

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", onChange);
      } else if (typeof mql.removeListener === "function") {
        mql.removeListener(onChange);
      }
    };
  }, [isClient]);

  return isMobile;
}
