import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

import type { TraceRecord } from "@shared/entities/trace/model";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly activeService: string | null;
  readonly onActiveServiceChange: (next: string | null) => void;
}

interface ServiceTally {
  readonly name: string;
  readonly count: number;
  readonly errors: number;
  readonly totalDur: number;
  readonly hue: number;
}

const PALETTE_HUES = [222, 32, 268, 174, 112, 8, 296, 56, 198, 332];

function hashHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return PALETTE_HUES[Math.abs(h) % PALETTE_HUES.length];
}

function ServiceStripComponent({ spans, activeService, onActiveServiceChange }: Props) {
  const tallies = useMemo<ServiceTally[]>(() => {
    const m = new Map<string, { count: number; errors: number; totalDur: number }>();
    for (const s of spans) {
      const k = s.service_name || "unknown";
      const cur = m.get(k) ?? { count: 0, errors: 0, totalDur: 0 };
      cur.count += 1;
      cur.totalDur += s.duration_ms ?? 0;
      if (s.status === "ERROR") cur.errors += 1;
      m.set(k, cur);
    }
    return Array.from(m.entries())
      .map(([name, t]) => ({ name, ...t, hue: hashHue(name) }))
      .sort((a, b) => b.totalDur - a.totalDur);
  }, [spans]);

  if (tallies.length === 0) return null;

  return (
    <div className="tdp-svcstrip">
      <span className="tdp-strip-label">Services</span>
      <div className="tdp-svcstrip-pills">
        {tallies.map((t) => {
          const isActive = activeService === t.name;
          return (
            <button
              key={t.name}
              type="button"
              className={`tdp-svcpill ${isActive ? "is-active" : ""} ${t.errors > 0 ? "has-err" : ""}`}
              style={{ ["--tdp-svc-color" as string]: `oklch(0.62 0.14 ${t.hue})` }}
              onClick={() => onActiveServiceChange(isActive ? null : t.name)}
              title={`${t.name} · ${t.count} span${t.count === 1 ? "" : "s"}${t.errors > 0 ? ` · ${t.errors} error${t.errors === 1 ? "" : "s"}` : ""}`}
            >
              <span className="tdp-svc-swatch" />
              <span className="tdp-svc-name">{t.name}</span>
              <span className="tdp-svc-count">{t.count}</span>
              {t.errors > 0 && (
                <span className="tdp-svc-err" aria-label={`${t.errors} errors`}>
                  <AlertCircle size={11} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const ServiceStrip = memo(ServiceStripComponent);
