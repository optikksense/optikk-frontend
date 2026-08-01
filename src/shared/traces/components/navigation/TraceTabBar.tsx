import { cn } from "@shared/lib/utils";
import { Activity, AlertCircle, Braces, Network, Search } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import type { VisualizationTab } from "../../types/detail";

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
  "inline-grid place-items-center min-w-[16px] h-[16px] px-1 font-mono text-[10px] text-foreground-muted bg-muted border border-border rounded-[4px]";

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
    { key: "waterfall", label: "Waterfall", icon: Activity, hotkey: "1" },
    { key: "service_map", label: "Service map", icon: Network, hotkey: "2" },
    { key: "errors", label: "Errors", icon: AlertCircle, hotkey: "3", count: errorCount },
    { key: "raw", label: "JSON", icon: Braces, hotkey: "4" },
  ];

  return (
    <div className="flex items-center gap-4 border-border border-b bg-background px-4">
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
                "-mb-px inline-flex cursor-pointer items-center gap-[7px] border-0 border-transparent border-b-2 bg-transparent px-3 py-2.5 text-[12.5px] text-foreground-muted hover:text-foreground",
                isActive && "border-b-primary text-foreground"
              )}
              onClick={() => onActiveTabChange(t.key)}
              title={`${t.label} (${t.hotkey})`}
            >
              <Icon size={13} aria-hidden />
              {t.label}
              {errCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-error-subtle px-1.5 py-px font-mono text-[10px] text-error">
                  {errCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="ml-auto py-1.5">
        <div className="flex w-[420px] max-w-[60vw] items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 focus-within:border-primary focus-within:bg-background focus-within:shadow-[0_0_0_3px_var(--color-primary-subtle-15)]">
          <span className="inline-flex items-center text-foreground-caption">
            <Search size={13} aria-hidden />
          </span>
          <input
            ref={inputRef}
            type="search"
            className="min-w-0 flex-1 border-0 bg-transparent font-inherit text-[12.5px] text-foreground outline-none placeholder:text-foreground-caption"
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
