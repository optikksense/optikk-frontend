import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ContextMenuAction {
  readonly kind: "action";
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly onSelect: () => void;
  readonly disabled?: boolean;
  readonly destructive?: boolean;
}

export interface ContextMenuSeparator {
  readonly kind: "separator";
}

export type ContextMenuEntry = ContextMenuAction | ContextMenuSeparator;

interface Props {
  readonly x: number;
  readonly y: number;
  readonly items: readonly ContextMenuEntry[];
  readonly onClose: () => void;
}

const VIEWPORT_PAD = 8;

export function RowContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const maxX = window.innerWidth - width - VIEWPORT_PAD;
    const maxY = window.innerHeight - height - VIEWPORT_PAD;
    setPos({ left: Math.min(x, maxX), top: Math.min(y, maxY) });
  }, [x, y]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{ position: "fixed", left: pos.left, top: pos.top, zIndex: 1000 }}
      className="min-w-[200px] rounded-md border border-border bg-secondary py-1 shadow-lg"
    >
      {items.map((item, i) =>
        item.kind === "separator" ? (
          <div key={`s-${i}`} className="my-1 h-px bg-border" />
        ) : (
          <button
            key={`a-${i}-${item.label}`}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-accent disabled:opacity-50 ${
              item.destructive ? "text-error" : "text-foreground"
            }`}
          >
            {item.icon ? (
              <span className="flex h-3.5 w-3.5 items-center justify-center text-foreground-muted">
                {item.icon}
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            <span className="truncate">{item.label}</span>
          </button>
        )
      )}
    </div>,
    document.body
  );
}
