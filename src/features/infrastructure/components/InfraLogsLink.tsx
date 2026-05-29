import { useNavigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { Button } from "@shared/components/primitives/ui";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import {
  buildLogsHubHref,
  hostEqualsFilter,
  podEqualsFilter,
} from "@shared/observability/deepLinks";

interface InfraLogsLinkProps {
  /** Scope dimension — `host` deep-links by hostname, `pod` by pod name. */
  readonly scope: "host" | "pod";
  readonly value: string;
}

function scopeFilter(scope: "host" | "pod", value: string) {
  return scope === "host" ? hostEqualsFilter(value) : podEqualsFilter(value);
}

export function InfraLogsLink({ scope, value }: InfraLogsLinkProps) {
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();

  const openLogs = (): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [scopeFilter(scope, value)],
        fromMs: Number(startTime),
        toMs: Number(endTime),
      }) as never,
    });
  };

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)]">
          <FileText size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[13px] text-[var(--text-primary)]">Logs</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Open the log explorer scoped to{" "}
            <code className="rounded bg-[var(--bg-tertiary)] px-1 font-mono">
              {scope}={value}
            </code>{" "}
            for the current time range.
          </div>
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={openLogs}>
        View logs
      </Button>
    </section>
  );
}
