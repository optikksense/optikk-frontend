import { memo } from "react";

import { cn } from "@/lib/utils";

import type { SpanDetailTab } from "../../../store/tracesStore";

export interface TabSpec {
  readonly key: SpanDetailTab;
  readonly label: string;
  readonly count?: number;
  readonly visible: boolean;
}

interface Props {
  readonly tabs: readonly TabSpec[];
  readonly active: SpanDetailTab;
  readonly onChange: (next: SpanDetailTab) => void;
}

function SpanDetailTabsComponent({ tabs, active, onChange }: Props) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-4 px-2 bg-background border-b border-border"
    >
      <div className="flex">
        {tabs
          .filter((t) => t.visible)
          .map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(t.key)}
                className={cn(
                  "inline-flex items-center gap-[7px] px-3 py-2.5 text-[12.5px] text-foreground-muted border-0 bg-transparent cursor-pointer border-b-2 border-transparent -mb-px hover:text-foreground",
                  isActive && "text-foreground border-b-primary"
                )}
              >
                {t.label}
                {typeof t.count === "number" && t.count > 0 && (
                  <span className="font-mono text-[10px] text-foreground-caption px-1.5 py-0 bg-muted rounded-full">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export const SpanDetailTabs = memo(SpanDetailTabsComponent);
