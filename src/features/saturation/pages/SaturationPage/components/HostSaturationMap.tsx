import { useState } from "react";

import { normalizePercentage } from "@shared/utils/formatters";

import {
  type HostFillMetric,
  useHostSaturationMap,
} from "../hooks/useHostSaturationMap";

const FILL_OPTIONS: { key: HostFillMetric; label: string }[] = [
  { key: "cpu", label: "CPU" },
  { key: "memory", label: "Memory" },
  { key: "disk", label: "Disk" },
];

/** Saturation heat: percent on a 0–100 scale (fraction form is normalized); green→amber→red. */
function heatColor(pct: number): string {
  const t = Math.max(0, Math.min(1, pct / 100));
  if (t < 0.5) return "rgba(52,211,153,0.75)";
  if (t < 0.7) return "rgba(250,204,21,0.7)";
  if (t < 0.85) return "rgba(247,144,9,0.8)";
  return "rgba(240,68,56,0.85)";
}

function FillToggle({
  value,
  onChange,
}: {
  value: HostFillMetric;
  onChange: (v: HostFillMetric) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Fill by
      </span>
      <div className="flex gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] p-0.5">
        {FILL_OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`rounded px-2 py-0.5 text-[11px] ${
              value === o.key
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HostSaturationMap() {
  const [fill, setFill] = useState<HostFillMetric>("cpu");
  const { nodes, isPending } = useHostSaturationMap(fill);

  return (
    <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-[14px] text-[var(--text-primary)]">
            Host saturation map
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Latest {fill} utilization per host · read-only
          </div>
        </div>
        <FillToggle value={fill} onChange={setFill} />
      </header>

      {nodes.length === 0 ? (
        <div className="grid h-[120px] place-items-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No hosts in this window."}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {nodes.map((node) => {
            const pct = normalizePercentage(node.value);
            return (
              <div
                key={node.host}
                title={`${node.host}\n${fill}: ${pct.toFixed(1)}%`}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border-color)] text-[9px] text-white shadow-sm"
                style={{ background: heatColor(pct) }}
              >
                <span className="max-w-full truncate px-0.5">{node.host.split(".")[0]}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
