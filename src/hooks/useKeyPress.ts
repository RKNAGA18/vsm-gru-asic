import { useEffect, useCallback } from "react";

export function useKeyPress(
  key: string | string[],
  handler: (e: KeyboardEvent) => void,
  deps: unknown[] = []
) {
  const keys = Array.isArray(key) ? key : [key];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableHandler = useCallback(handler, deps);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (keys.includes(e.key)) stableHandler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys, stableHandler]);
}
