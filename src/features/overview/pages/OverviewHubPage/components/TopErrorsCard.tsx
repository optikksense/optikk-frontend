import { useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { ROUTES } from "@/shared/constants/routes";
import { Skeleton, Surface } from "@shared/components/primitives/ui";
import { formatNumber } from "@shared/utils/formatters";

import type { ErrorHotspotRow } from "../hooks/useOverviewModel";

interface Props {
  readonly rows: readonly ErrorHotspotRow[];
  readonly loading: boolean;
}

function Row({ row, onOpen }: { readonly row: ErrorHotspotRow; readonly onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-between gap-3 rounded-md bg-surface-inset px-2.5 py-2 text-left transition-colors hover:bg-accent"
    >
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium font-mono text-[12px] text-foreground">
          {row.operationName}
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10.5px] text-foreground-muted">
          {row.serviceName}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-mono font-semibold text-[12px] text-error tabular-nums">
          {formatNumber(row.errorCount)}
        </span>
        <span className="font-mono text-[10.5px] text-foreground-muted tabular-nums">errors</span>
      </div>
    </button>
  );
}

export default function TopErrorsCard({ rows, loading }: Props) {
  const navigate = useNavigate();

  const open = (row: ErrorHotspotRow): void => {
    if (!row.groupId) return;
    navigate({ to: `/errors/${encodeURIComponent(row.groupId)}` });
  };

  return (
    <Surface elevation={1} padding="md" className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-semibold text-[13px] text-foreground">Top errors</div>
          <div className="text-[11px] text-foreground-muted">
            Highest error counts across services
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.errors })}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-foreground-secondary hover:bg-accent"
        >
          <ExternalLink size={12} />
          All errors
        </button>
      </div>

      {loading && rows.length === 0 ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : rows.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-foreground-muted">
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
