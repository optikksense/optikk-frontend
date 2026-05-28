import { useLocation, useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { Skeleton, Surface } from "@/components/ui";
import { buildServiceDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { ROUTES } from "@/shared/constants/routes";
import { formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { ErrorHotspotRow } from "../hooks/useOverviewModel";

interface Props {
  readonly rows: readonly ErrorHotspotRow[];
  readonly loading: boolean;
}

function severityColor(rate: number): string {
  if (rate >= 5) return "var(--color-critical)";
  if (rate >= 1) return "var(--color-degraded)";
  return "var(--color-info)";
}

function Row({ row, onOpen }: { readonly row: ErrorHotspotRow; readonly onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-between gap-3 rounded-md bg-[var(--bg-inset)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-hover)]"
    >
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono font-medium text-[12px] text-[var(--text-primary)]">
          {row.operationName}
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10.5px] text-[var(--text-muted)]">
          {row.serviceName} · {formatNumber(row.totalCount)} req
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span
          className="font-mono font-semibold text-[12px] tabular-nums"
          style={{ color: severityColor(row.errorRate) }}
        >
          {formatNumber(row.errorCount)}
        </span>
        <span className="font-mono text-[10.5px] text-[var(--text-muted)] tabular-nums">
          {formatPercentage(row.errorRate)}
        </span>
      </div>
    </button>
  );
}

export default function TopErrorsCard({ rows, loading }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const open = (row: ErrorHotspotRow): void => {
    const search = buildServiceDrawerSearch(location.search, row.serviceName);
    navigate({ to: location.pathname + search });
  };

  return (
    <Surface elevation={1} padding="md" className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-semibold text-[13px] text-[var(--text-primary)]">Top errors</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Highest error counts across services
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.errors })}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        >
          <ExternalLink size={12} />
          All errors
        </button>
      </div>

      {loading && rows.length === 0 ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : rows.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-[var(--text-muted)]">
          No errors in the selected range
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <Row key={row.key} row={row} onOpen={() => open(row)} />
          ))}
        </div>
      )}
    </Surface>
  );
}
