import { Activity, AlertCircle, Braces, Flame, Search } from "lucide-react";
import { memo, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

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

const kbd =
  "inline-grid place-items-center min-w-[16px] h-[16px] px-1 font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-[4px]";

function TraceTabBarComponent({
  activeTab,
  onActiveTabChange,
  search,
  onSearchChange,
  errorCount,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex items-center gap-4 px-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="flex">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          const errCount = t.key === "errors" ? (t.count ?? 0) : 0;
          return (
            <button
              key={t.key}
              type="button"
              className={cn(
                "inline-flex items-center gap-[7px] px-3 py-2.5 text-[12.5px] text-[var(--text-muted)] border-0 bg-transparent cursor-pointer border-b-2 border-transparent -mb-px hover:text-[var(--text-primary)]",
                isActive && "text-[var(--text-primary)] border-b-[var(--color-primary)]"
              )}
              onClick={() => onActiveTabChange(t.key)}
              title={`${t.label} (${t.hotkey})`}
            >
              <Icon size={13} aria-hidden />
              {t.label}
              {errCount > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[10px] font-mono bg-[var(--color-error-subtle)] text-[var(--color-error)]">
                  {errCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="ml-auto py-1.5">
        <div className="flex items-center gap-1.5 w-[420px] max-w-[60vw] px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md focus-within:border-[var(--color-primary)] focus-within:bg-[var(--bg-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-subtle-15)]">
          <span className="text-[var(--text-caption)] inline-flex items-center">
            <Search size={13} aria-hidden />
          </span>
          <input
            ref={inputRef}
            type="search"
            className="flex-1 bg-transparent border-0 outline-none text-[var(--text-primary)] font-inherit text-[12.5px] min-w-0 placeholder:text-[var(--text-caption)]"
            placeholder="Filter spans by op, service, attribute…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <kbd className={kbd}>/</kbd>
        </div>
      </div>
    </div>
  );
}

export const TraceTabBar = memo(TraceTabBarComponent);
