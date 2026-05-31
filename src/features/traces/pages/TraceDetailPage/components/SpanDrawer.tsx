import { memo, useCallback, useEffect, useRef } from "react";

interface Props {
  readonly open: boolean;
  readonly widthPx: number;
  readonly minPx: number;
  readonly maxPx: number;
  readonly onResize: (px: number) => void;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

/**
 * Non-modal right drawer for span detail. Unlike `@features/explorer/.../DetailDrawer`
 * (a Radix Dialog with overlay + click-outside dismiss), this drawer lets the user keep
 * interacting with the waterfall behind it. Width is resizable via the left edge handle;
 * the parent layout reflows the viz area via `padding-right` so spans aren't occluded.
 */
function SpanDrawerComponent({ open, widthPx, minPx, maxPx, onResize, onClose, children }: Props) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingRef.current) return;
      // Drawer grows as the pointer moves left (delta = startX - currentX).
      const delta = startXRef.current - e.clientX;
      const next = Math.max(minPx, Math.min(maxPx, startWidthRef.current + delta));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => onResize(next));
    },
    [maxPx, minPx, onResize]
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = widthPx;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp, widthPx]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // Esc closes drawer (only when open and focus isn't in an editable field).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target;
      if (t instanceof HTMLElement) {
        const tag = t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable) return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside
      aria-label="Span detail"
      style={{ width: widthPx }}
      className="absolute top-0 right-0 bottom-0 z-30 flex flex-col border-border border-l bg-background shadow-[-4px_0_16px_rgba(0,0,0,0.25)]"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize span detail"
        onPointerDown={onHandlePointerDown}
        className="-translate-x-[2px] absolute top-0 bottom-0 left-0 z-10 w-[5px] cursor-col-resize hover:bg-[var(--color-primary,#648FFF)]/30 active:bg-[var(--color-primary,#648FFF)]/50"
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </aside>
  );
}

export const SpanDrawer = memo(SpanDrawerComponent);
