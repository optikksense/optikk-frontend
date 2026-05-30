import { memo } from "react";

import { Pill } from "@shared/components/primitives/ui/pill";

import type { PillVariant } from "@shared/components/primitives/ui/pill";
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

const VARIANTS: Record<string, PillVariant> = {
  alert: "error",
  warn: "warning",
  ok: "success",
  no_data: "neutral",
};

function MonitorStatusBadge({ status }: Props) {
  const variant = VARIANTS[status] ?? "neutral";
  const label = LABELS[status] ?? status;
  return (
    <Pill variant={variant} dot>
      {label}
    </Pill>
  );
}

export default memo(MonitorStatusBadge);
