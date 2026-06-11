import { useEffect, useMemo } from "react";

import { shiftTimeRange, zoomTimeRange } from "@shared/utils/timeBounds";
import { useAppStore } from "@store/appStore";

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  section: "Navigation" | "Actions" | "Time";
}

export interface UseKeyboardShortcutsResult {
  shortcuts: KeyboardShortcut[];
}

const BASE_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "command-palette",
    keys: ["Ctrl", "K"],
    description: "Open the command palette",
    section: "Navigation",
  },
  {
    id: "shortcut-help",
    keys: ["?"],
    description: "Open keyboard shortcuts help",
    section: "Navigation",
  },
  {
    id: "refresh",
    keys: ["Shift", "R"],
    description: "Refresh data on the active screen",
    section: "Actions",
  },
  {
    id: "toggle-density",
    keys: ["Shift", "D"],
    description: "Toggle compact density mode",
    section: "Actions",
  },
  {
    id: "time-shift-back",
    keys: ["Shift", "\u2190"],
    description: "Shift time window backward",
    section: "Time",
  },
  {
    id: "time-shift-forward",
    keys: ["Shift", "\u2192"],
    description: "Shift time window forward",
    section: "Time",
  },
  {
    id: "time-zoom-in",
    keys: ["Shift", "\u2191"],
    description: "Zoom in (halve duration)",
    section: "Time",
  },
  {
    id: "time-zoom-out",
    keys: ["Shift", "\u2193"],
    description: "Zoom out (double duration)",
    section: "Time",
  },
  {
    id: "focus-time-picker",
    keys: ["t"],
    description: "Focus time range picker",
    section: "Time",
  },
];

function isInputElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(): UseKeyboardShortcutsResult {
  const shortcuts = useMemo(() => BASE_SHORTCUTS, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isInputElement(document.activeElement)) return;

      const { setCustomTimeRange, timeRange, triggerRefresh } = useAppStore.getState();

      if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        const bounds = shiftTimeRange(timeRange, "backward");
        setCustomTimeRange(bounds.startMs, bounds.endMs);
        return;
      }

      if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        const bounds = shiftTimeRange(timeRange, "forward");
        setCustomTimeRange(bounds.startMs, bounds.endMs);
        return;
      }

      if (e.shiftKey && e.key === "ArrowUp") {
        e.preventDefault();
        const bounds = zoomTimeRange(timeRange, "in");
        setCustomTimeRange(bounds.startMs, bounds.endMs);
        return;
      }

      if (e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        const bounds = zoomTimeRange(timeRange, "out");
        setCustomTimeRange(bounds.startMs, bounds.endMs);
        return;
      }

      if (e.key === "t" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const trigger = document.querySelector(
          '[data-testid="time-range-trigger"]'
        ) as HTMLButtonElement | null;
        trigger?.click();
        return;
      }

      if (e.shiftKey && e.key === "R") {
        e.preventDefault();
        triggerRefresh();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { shortcuts };
}
