import { cn } from "@shared/lib/utils";
import type { TimeRange } from "@shared/types";
import { ArrowRight } from "lucide-react";
import { RANGE_GROUPS } from "./constants";

interface Props {
  fromExpr: string;
  toExpr: string;
  isActivePreset: (preset: string) => boolean;
  onSelectRange: (range: TimeRange) => void;
}

export function RelativeTimeTab({ fromExpr, toExpr, isActivePreset, onSelectRange }: Props) {
  return (
    <div className="flex flex-col">
      <div className="border-border border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="mb-1 font-semibold text-[10px] text-foreground-tertiary uppercase tracking-wider">
              From
            </div>
            <div className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-[13px] text-primary">
              {fromExpr}
            </div>
          </div>
          <ArrowRight size={14} className="mt-4 shrink-0 text-foreground-tertiary" />
          <div className="flex-1">
            <div className="mb-1 font-semibold text-[10px] text-foreground-tertiary uppercase tracking-wider">
              To
            </div>
            <div className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-[13px] text-primary">
              {toExpr}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto p-3" style={{ maxHeight: 340 }}>
        {RANGE_GROUPS.map((group, groupIdx) => (
          <div key={group.title} className={cn(groupIdx > 0 && "mt-3")}>
            <div className="mb-1.5 px-1 font-semibold text-[10px] text-foreground-tertiary uppercase tracking-wider">
              {group.title}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {group.items.map((item) => {
                const active = isActivePreset(item.preset);
                return (
                  <button
                    type="button"
                    key={item.preset}
                    className={cn(
                      "group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border bg-transparent px-2 py-2.5 text-center transition-all duration-150",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(124,127,242,0.15)]"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                    onClick={() => onSelectRange(item)}
                  >
                    <span
                      className={cn(
                        "font-semibold text-[13px] leading-tight",
                        active ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
