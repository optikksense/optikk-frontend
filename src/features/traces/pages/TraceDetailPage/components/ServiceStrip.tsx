import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

import { cn } from "@shared/lib/utils";

import type { TraceRecord } from "@shared/api/traces/schemas";

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
      const k = s.serviceName || "unknown";
      const cur = m.get(k) ?? { count: 0, errors: 0, totalDur: 0 };
      cur.count += 1;
      cur.totalDur += s.durationMs ?? 0;
      if (s.status === "ERROR") cur.errors += 1;
      m.set(k, cur);
    }
    return Array.from(m.entries())
      .map(([name, t]) => ({ name, ...t, hue: hashHue(name) }))
      .sort((a, b) => b.totalDur - a.totalDur);
  }, [spans]);

  if (tallies.length === 0) return null;

  return (
    <div className="flex items-center gap-3.5 overflow-x-auto border-border border-b bg-secondary px-5 py-2.5">
      <span className="whitespace-nowrap text-[10.5px] text-foreground-caption uppercase tracking-[0.06em]">
        Services
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {tallies.map((t) => {
          const isActive = activeService === t.name;
          const swatchColor = `oklch(0.62 0.14 ${t.hue})`;
          return (
            <button
              key={t.name}
              type="button"
              className={cn(
                "inline-flex flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-muted py-1 pr-[9px] pl-1.5 text-[12px] text-foreground-secondary hover:bg-accent",
                isActive && "border-primary bg-[var(--color-primary-subtle-15)] text-foreground",
                t.errors > 0 && "shadow-[inset_0_0_0_1px_var(--color-error-subtle)]"
              )}
              onClick={() => onActiveServiceChange(isActive ? null : t.name)}
              title={`${t.name} · ${t.count} span${t.count === 1 ? "" : "s"}${t.errors > 0 ? ` · ${t.errors} error${t.errors === 1 ? "" : "s"}` : ""}`}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ background: swatchColor }}
              />
              <span className="whitespace-nowrap">{t.name}</span>
              <span className="font-mono text-[11px] text-foreground-caption">{t.count}</span>
              {t.errors > 0 && (
                <span
                  className="inline-flex items-center text-error"
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
