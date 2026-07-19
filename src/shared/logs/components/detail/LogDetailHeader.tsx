import { DrawerHeader } from "@shared/components/ui/overlay/detail-drawer";
import { formatTimestamp } from "@shared/utils/formatters";
import { memo } from "react";

import type { LogRecord } from "../../types/log";
import { serviceSwatchColor } from "../../utils/serviceHue";
import { severityStyle } from "../../utils/severity";

interface Props {
  readonly log: LogRecord | undefined;
  readonly onClose: () => void;
}

function LogDetailHeaderComponent({ log, onClose }: Props) {
  if (!log) {
    return (
      <DrawerHeader onClose={onClose}>
        <div className="font-semibold text-[14px] text-[var(--fg-0)]">Log detail</div>
      </DrawerHeader>
    );
  }

  const sev = severityStyle(log.severityBucket);

  return (
    <DrawerHeader onClose={onClose}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-bold font-mono text-[11px]"
          style={{
            color: sev.color,
            borderColor: sev.color,
            background: "var(--bg-card)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: sev.color }} />
          {sev.shortLabel}
        </span>
        {log.environment && (
          <span className="rounded-md border border-[var(--line)] bg-[var(--bg-inset)] px-2 py-0.5 font-mono text-[11px] text-[var(--fg-3)]">
            {log.environment}
          </span>
        )}
      </div>
      <div className="line-clamp-2 break-words font-mono font-semibold text-[14px] text-[var(--fg-0)] leading-[1.4]">
        {log.body || "—"}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[12.5px] text-[var(--fg-3)]">
        <span>{formatTimestamp(log.timestamp)}</span>
        <span>·</span>
        <span style={{ color: serviceSwatchColor(log.serviceName) }}>{log.serviceName}</span>
        {log.host && (
          <>
            <span>·</span>
            <span>{log.host}</span>
          </>
        )}
      </div>
    </DrawerHeader>
  );
}

export const LogDetailHeader = memo(LogDetailHeaderComponent);
