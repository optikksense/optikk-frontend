import { useEffect, useRef } from "react";

/**
 * A hook that runs an interval timer that respects page visibility.
 * Pauses interval executions when the document is hidden to conserve CPU.
 *
 * @param callback The callback function to invoke on each interval.
 * @param intervalMs The interval duration in milliseconds. Pass 0/null to disable.
 */
export function useVisibilityInterval(callback: () => void, intervalMs: number | null): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (intervalMs == null || intervalMs <= 0) return;

    let timerId: number | null = null;

    const start = () => {
      if (timerId !== null) return;
      timerId = window.setInterval(() => callbackRef.current(), intervalMs);
    };

    const stop = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        callbackRef.current();
        start();
      }
    };

    if (!document.hidden) {
      start();
    }

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);
}
