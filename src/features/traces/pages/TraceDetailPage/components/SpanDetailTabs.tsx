import { memo } from "react";

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
    <div role="tablist" className="tdp-tabbar" style={{ padding: "0 8px" }}>
      <div className="tdp-tabs">
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
                className={`tdp-tab ${isActive ? "is-active" : ""}`}
              >
                {t.label}
                {typeof t.count === "number" && t.count > 0 && (
                  <span
                    className="tdp-sd-kind"
                    style={{
                      padding: "0 5px",
                      borderRadius: 999,
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 10,
                    }}
                  >
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
