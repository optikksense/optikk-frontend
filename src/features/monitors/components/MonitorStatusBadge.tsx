import { memo } from "react";

import type { MonitorStatus } from "../api/monitorsApi";

interface Props {
  readonly status: MonitorStatus | string;
}

const LABELS: Record<string, string> = {
  alert: "Alert",
  warn: "Warn",
  ok: "OK",
  no_data: "No data",
};

const COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  alert: { bg: "bg-red-500/15", fg: "text-red-500", dot: "bg-red-500" },
  warn: { bg: "bg-amber-400/15", fg: "text-amber-500", dot: "bg-amber-500" },
  ok: { bg: "bg-emerald-500/15", fg: "text-emerald-500", dot: "bg-emerald-500" },
  no_data: { bg: "bg-zinc-500/15", fg: "text-zinc-400", dot: "bg-zinc-400" },
};

function MonitorStatusBadge({ status }: Props) {
  const c = COLORS[status] ?? COLORS.no_data;
  const label = LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.fg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}

export default memo(MonitorStatusBadge);
