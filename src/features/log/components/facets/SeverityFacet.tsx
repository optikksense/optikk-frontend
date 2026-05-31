import { memo } from "react";

import { cn } from "@/lib/utils";

import type { SeveritySlug } from "../../utils/severity";
import { SEVERITY_STYLES } from "../../utils/severity";

interface Props {
  readonly labels: readonly string[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
}

const SEV_TOKEN: Record<SeveritySlug, string> = {
  trace: "var(--trace-c)",
  debug: "var(--debug-c)",
  info: "var(--info-c)",
  warn: "var(--warn-c)",
  error: "var(--err-c)",
  fatal: "var(--fatal-c)",
};

/** Severity facet — stacked distribution bar + per-level rows with toggle. */
function SeverityFacetComponent({ labels, onInclude }: Props) {
  const isActive = (label: string) => labels.includes(label.toUpperCase());

  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.08em]">
        Severity
      </div>
      <div className="flex h-[6px] overflow-hidden rounded-[3px]">
        {SEVERITY_STYLES.map((s) => (
          <span key={s.bucket} className="flex-1" style={{ background: SEV_TOKEN[s.slug] }} />
        ))}
      </div>
      <div className="flex flex-col gap-px">
        {SEVERITY_STYLES.map((s) => {
          const active = isActive(s.label);
          return (
            <button
              key={s.bucket}
              type="button"
              onClick={() => onInclude("severity_text", s.label.toUpperCase())}
              className={cn(
                "grid w-full cursor-pointer grid-cols-[14px_1fr_auto] items-center gap-[10px] rounded-[5px] border-0 bg-transparent p-[6px] text-left text-[13px] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
                active ? "text-[var(--fg-1)]" : "text-[var(--fg-3)]"
              )}
              title={
                active
                  ? `Filtered to ${s.label.toUpperCase()}`
                  : `Filter to ${s.label.toUpperCase()}`
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ background: SEV_TOKEN[s.slug] }} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SeverityFacet = memo(SeverityFacetComponent);
