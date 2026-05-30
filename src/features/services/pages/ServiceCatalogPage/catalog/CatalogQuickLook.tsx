import { ExternalLink, X } from "lucide-react";

import { ServiceAvatar } from "../../../components/ServiceAvatar";
import { fmtMs, fmtNum, fmtPct } from "../../ServiceDetailPage/formatters";
import { SparklineCell } from "./SparklineCell";
import { StatusDot } from "./StatusDot";
import type { CatalogRow } from "./buildCatalogRows";

interface Props {
  readonly row: CatalogRow;
  readonly onClose: () => void;
  readonly onOpenService: (serviceName: string) => void;
}

const STAT_K = "text-[10.5px] uppercase tracking-[0.06em] text-[var(--text-muted)]";
const STAT_V = "text-[14px] font-semibold text-[var(--text-primary)] tabular-nums";

function statusLabel(status: CatalogRow["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function sparkTone(status: CatalogRow["status"]): "info" | "warn" | "err" {
  return status === "error" ? "err" : status === "warn" ? "warn" : "info";
}

/** Row quick-look: identity + golden signals from the already-loaded catalog row.
 *  (The design's incident callout is omitted — no incident backend.) */
export function CatalogQuickLook({ row, onClose, onOpenService }: Props) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-4 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="flex items-start gap-2.5">
        <ServiceAvatar serviceName={row.serviceName} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold text-[var(--text-primary)]">
            {row.serviceName}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <StatusDot status={row.status} />
            <span>{statusLabel(row.status)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X size={14} />
        </button>
      </div>

      <div className="font-mono text-[11px] text-[var(--text-muted)]">
        {row.version}
        {row.environment !== "—" ? ` · ${row.environment}` : ""}
      </div>

      <div>
        <div className={STAT_K}>Request rate · last 1h</div>
        <div className="mt-1 text-[14px] font-semibold text-[var(--text-primary)] tabular-nums">
          {fmtNum(row.rps)} <span className="text-[11px] font-normal text-[var(--text-muted)]">rps</span>
        </div>
        <div className="mt-1.5">
          <SparklineCell values={row.sparkline} tone={sparkTone(row.status)} width={248} height={40} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className={STAT_K}>Error rate</div>
          <div className={STAT_V}>{fmtPct(row.errorRate, 2)}</div>
        </div>
        <div>
          <div className={STAT_K}>P50</div>
          <div className={STAT_V}>{fmtMs(row.p50Ms)}</div>
        </div>
        <div>
          <div className={STAT_K}>P95</div>
          <div className={STAT_V}>{fmtMs(row.p95Ms)}</div>
        </div>
        <div>
          <div className={STAT_K}>P99</div>
          <div className={STAT_V}>{fmtMs(row.p99Ms)}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenService(row.serviceName)}
        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-primary-subtle-28)] bg-[var(--color-primary-subtle-12)] px-3 py-2 text-[12px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle-18)]"
      >
        Open service <ExternalLink size={13} />
      </button>
    </aside>
  );
}
