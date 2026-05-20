import { memo } from "react";

import { SEVERITY_STYLES } from "../../utils/severity";

interface Props {
  readonly labels: readonly string[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
}

/** Severity facet — stacked distribution bar + per-level rows with toggle. */
function SeverityFacetComponent({ labels, onInclude }: Props) {
  const isActive = (label: string) => labels.includes(label.toUpperCase());

  return (
    <div className="ok-facet">
      <div className="ok-facet-t">Severity</div>
      <div className="ok-sev-bar">
        {SEVERITY_STYLES.map((s) => (
          <span key={s.bucket} className={`s-${s.slug}`} />
        ))}
      </div>
      <div className="ok-sev-list">
        {SEVERITY_STYLES.map((s) => {
          const active = isActive(s.label);
          return (
            <button
              key={s.bucket}
              type="button"
              onClick={() => onInclude("severity_text", s.label.toUpperCase())}
              className={`ok-sev-r ${active ? "" : "is-off"}`}
              title={
                active
                  ? `Filtered to ${s.label.toUpperCase()}`
                  : `Filter to ${s.label.toUpperCase()}`
              }
            >
              <span className={`ok-sev-d s-${s.slug}`} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SeverityFacet = memo(SeverityFacetComponent);
