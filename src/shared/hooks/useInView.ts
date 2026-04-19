import { type RefObject, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Root margin forwarded to IntersectionObserver. Default "100px" — fire just before element enters viewport. */
  rootMargin?: string;
  /** If true (default), the hook latches to `true` on first intersection and never flips back. Callers that gate
   * `useQuery({ enabled })` want this so data doesn't re-fetch when the element scrolls back out of view. */
  once?: boolean;
}

/**
 * Returns a ref + boolean indicating whether the referenced element has entered the viewport.
 * Designed for gating below-fold data fetches on scroll visibility.
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {}
): { ref: RefObject<T>; inView: boolean } {
  const { rootMargin = "100px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback for non-browser environments (SSR / tests).
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return { ref: ref as RefObject<T>, inView };
}
