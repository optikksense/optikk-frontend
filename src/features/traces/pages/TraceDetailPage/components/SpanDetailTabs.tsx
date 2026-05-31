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
      className="flex items-center gap-4 border-border border-b bg-background px-2"
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
                  "-mb-px inline-flex cursor-pointer items-center gap-[7px] border-0 border-transparent border-b-2 bg-transparent px-3 py-2.5 text-[12.5px] text-foreground-muted hover:text-foreground",
                  isActive && "border-b-primary text-foreground"
                )}
              >
                {t.label}
                {typeof t.count === "number" && t.count > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0 font-mono text-[10px] text-foreground-caption">
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
