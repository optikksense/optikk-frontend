import { Activity, AlertCircle, Braces, Flame, Search } from "lucide-react";
import { memo, useEffect, useRef } from "react";

import type { VisualizationTab } from "../../../store/tracesStore";

interface Props {
  readonly activeTab: VisualizationTab;
  readonly onActiveTabChange: (tab: VisualizationTab) => void;
  readonly search: string;
  readonly onSearchChange: (next: string) => void;
  readonly errorCount: number;
}

interface TabSpec {
  readonly key: VisualizationTab;
  readonly label: string;
  readonly icon: typeof Activity;
  readonly hotkey: string;
  readonly count?: number;
}

function TraceTabBarComponent({
  activeTab,
  onActiveTabChange,
  search,
  onSearchChange,
  errorCount,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // `/` focuses the search box (matches the design's keyboard hint).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = e.target;
      if (t instanceof HTMLElement) {
        const tag = t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable) return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tabs: readonly TabSpec[] = [
    { key: "timeline", label: "Waterfall", icon: Activity, hotkey: "1" },
    { key: "flamegraph", label: "Flame", icon: Flame, hotkey: "2" },
    { key: "errors", label: "Errors", icon: AlertCircle, hotkey: "3", count: errorCount },
    { key: "raw", label: "Raw JSON", icon: Braces, hotkey: "4" },
  ];

  return (
    <div className="tdp-tabbar">
      <div className="tdp-tabs">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          const errCount = t.key === "errors" ? (t.count ?? 0) : 0;
          return (
            <button
              key={t.key}
              type="button"
              className={`tdp-tab ${isActive ? "is-active" : ""}`}
              onClick={() => onActiveTabChange(t.key)}
              title={`${t.label} (${t.hotkey})`}
            >
              <Icon size={13} aria-hidden />
              {t.label}
              {errCount > 0 && (
                <span
                  className="tdp-sd-pill tdp-sd-pill-err"
                  style={{ padding: "1px 6px", fontSize: 10 }}
                >
                  {errCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="tdp-tab-tools">
        <div className="tdp-searchbox">
          <span className="tdp-search-i">
            <Search size={13} aria-hidden />
          </span>
          <input
            ref={inputRef}
            type="search"
            className="tdp-search-input"
            placeholder="Filter spans by op, service, attribute…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <kbd className="tdp-kbd">/</kbd>
        </div>
      </div>
    </div>
  );
}

export const TraceTabBar = memo(TraceTabBarComponent);
