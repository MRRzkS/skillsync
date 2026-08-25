"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ticks up once per second while `active` is true, and resets to 0 when it
 * becomes false. Used to show "Generating... (12s)" instead of a bare
 * spinner during long AI calls, so a slow response doesn't look hung.
 */
export function useElapsedSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  return seconds;
}
