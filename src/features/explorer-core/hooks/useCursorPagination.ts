import { useCallback, useMemo, useState } from "react";

export interface UseCursorPaginationResult {
  /** Current page cursor ("" on first page). */
  cursor: string;
  /** Called with the server-provided nextCursor. */
  goNext: (nextCursor: string) => void;
  /** Pop the stack to return to the previous page. */
  goPrev: () => void;
  /** Reset to the first page. Call when filters/time-range/pageSize change. */
  reset: () => void;
  hasPrev: boolean;
  depth: number;
}

/**
 * Stack-based cursor pagination. Push the server's nextCursor on "Next";
 * pop on "Prev". Reset the stack whenever a filter that invalidates the
 * current cursor changes.
 */
export function useCursorPagination(): UseCursorPaginationResult {
  const [stack, setStack] = useState<string[]>([]);

  const goNext = useCallback((nextCursor: string) => {
    if (!nextCursor) return;
    setStack((prev) => [...prev, nextCursor]);
  }, []);

  const goPrev = useCallback(() => {
    setStack((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
  }, []);

  const reset = useCallback(() => setStack([]), []);

  return useMemo(
    () => ({
      cursor: stack.length === 0 ? "" : stack[stack.length - 1]!,
      goNext,
      goPrev,
      reset,
      hasPrev: stack.length > 0,
      depth: stack.length,
    }),
    [stack, goNext, goPrev, reset]
  );
}
