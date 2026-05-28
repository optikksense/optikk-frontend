import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

import { cn } from "@/lib/utils";

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
    <div className="flex items-center gap-3.5 px-5 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] overflow-x-auto">
      <span className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--text-caption)] whitespace-nowrap">
        Services
      </span>
      <div className="flex gap-1.5 flex-1 flex-wrap">
        {tallies.map((t) => {
          const isActive = activeService === t.name;
          const swatchColor = `oklch(0.62 0.14 ${t.hue})`;
          return (
            <button
              key={t.name}
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 pr-[9px] pl-1.5 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] whitespace-nowrap cursor-pointer flex-none hover:bg-[var(--bg-hover)]",
                isActive &&
                  "border-[var(--color-primary)] bg-[var(--color-primary-subtle-15)] text-[var(--text-primary)]",
                t.errors > 0 && "shadow-[inset_0_0_0_1px_var(--color-error-subtle)]"
              )}
              onClick={() => onActiveServiceChange(isActive ? null : t.name)}
              title={`${t.name} · ${t.count} span${t.count === 1 ? "" : "s"}${t.errors > 0 ? ` · ${t.errors} error${t.errors === 1 ? "" : "s"}` : ""}`}
            >
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: swatchColor }}
              />
              <span className="whitespace-nowrap">{t.name}</span>
              <span className="text-[var(--text-caption)] font-mono text-[11px]">{t.count}</span>
              {t.errors > 0 && (
                <span
                  className="text-[var(--color-error)] inline-flex items-center"
                  aria-label={`${t.errors} errors`}
                >
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
