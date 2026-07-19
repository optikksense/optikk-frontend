import type { TraceLog } from "@shared/api/traces/schemas";
import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import { getSeverityTheme } from "@shared/logs/utils/logTransformers";

interface SpanDrawerLogsProps {
  spanLogs: readonly TraceLog[];
  onOpenInLogs: () => void;
}

export function SpanDrawerLogs({ spanLogs, onOpenInLogs }: SpanDrawerLogsProps) {
  return (
    <DrawerSection
      title={`Logs in this span · ${spanLogs.length}`}
      action={
        <button
          type="button"
          onClick={onOpenInLogs}
          className="cursor-pointer border-0 bg-transparent font-mono text-[12px] text-[var(--accent-2)]"
        >
          open in logs →
        </button>
      }
    >
      {spanLogs.length === 0 ? (
        <div className="py-2 text-[12px] text-[var(--fg-3)]">No logs recorded for this span.</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {spanLogs.map((l, i) => {
            const { level, color } = getSeverityTheme(l.severityText);
            return (
              <div
                key={l.id || `${l.timestamp}-${i}`}
                className="group flex flex-col gap-1.5 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-surface-inset"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                  <span className="font-mono text-[11px] text-foreground-muted">
                    {String(l.timestamp)}
                  </span>
                  {l.severityText && (
                    <span
                      className="rounded px-1.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
                      style={{ color, background: `${color}15` }}
                    >
                      {level}
                    </span>
                  )}
                </div>
                <div className="font-mono text-[12.5px] text-[var(--fg-0)] leading-[1.4]">
                  {l.body || "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DrawerSection>
  );
}
