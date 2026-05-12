import { memo, useMemo } from "react";

import { SEVERITY_STYLES } from "../../utils/severity";
import { FacetDistributionBar } from "./FacetDistributionBar";

interface Props {
  readonly labels: readonly string[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
}

/** Severity facet with a stacked distribution bar and clickable labels. */
function SeverityFacetComponent({ labels, onInclude, onExclude }: Props) {
  const segments = useMemo(
    () =>
      SEVERITY_STYLES.map((s) => ({
        color: s.color,
        ratio: labels.includes(s.label.toUpperCase()) ? 1 : 0.1,
        label: s.label,
      })),
    [labels]
  );

  return (
    <div className="border-b border-[var(--border-color)] px-3 py-2.5">
      <span className="mb-1.5 block font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        Severity
      </span>
      <div className="mb-2">
        <FacetDistributionBar segments={segments} height={6} />
      </div>
      <div className="space-y-0.5">
        {SEVERITY_STYLES.map((s) => (
          <button
            key={s.bucket}
            type="button"
            onClick={() => onInclude("severity_text", s.label.toUpperCase())}
            className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-[12px] hover:bg-[var(--bg-hover)]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[var(--text-primary)]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const SeverityFacet = memo(SeverityFacetComponent);
