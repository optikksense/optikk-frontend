import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DRAWER_WIDTH_DEFAULT,
  DRAWER_WIDTH_MAX,
  DRAWER_WIDTH_MIN,
  useTracesStore,
} from "../../../store/tracesStore";

interface DrawerWidth {
  readonly widthPx: number;
  readonly minPx: number;
  readonly maxPx: number;
  readonly setWidthPx: (px: number) => void;
}

function viewportMax(): number {
  if (typeof window === "undefined") return DRAWER_WIDTH_MAX;
  return Math.min(DRAWER_WIDTH_MAX, Math.floor(window.innerWidth * 0.6));
}

/** Drawer width persisted in tracesStore, clamped to viewport on resize. */
export function useDrawerWidth(): DrawerWidth {
  const stored = useTracesStore((s) => s.drawerWidthPx);
  const setStored = useTracesStore((s) => s.setDrawerWidthPx);
  const [maxPx, setMaxPx] = useState<number>(() => viewportMax());

  useEffect(() => {
    const onResize = () => setMaxPx(viewportMax());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const widthPx = useMemo(() => {
    const px = Number.isFinite(stored) ? stored : DRAWER_WIDTH_DEFAULT;
    return Math.max(DRAWER_WIDTH_MIN, Math.min(maxPx, px));
  }, [stored, maxPx]);

  const setWidthPx = useCallback((px: number) => setStored(px), [setStored]);

  return { widthPx, minPx: DRAWER_WIDTH_MIN, maxPx, setWidthPx };
}
