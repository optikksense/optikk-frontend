import { Pill, type PillVariant } from "@shared/components/primitives/ui/pill";

import { type InstanceStatus, STATUS_LABEL } from "../databaseInstanceModel";

const STATUS_VARIANT: Record<InstanceStatus, PillVariant> = {
  ok: "success",
  warn: "warning",
  err: "error",
};

interface StatusPillProps {
  readonly status: InstanceStatus;
  readonly label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <Pill variant={STATUS_VARIANT[status]} dot>
      {label ?? STATUS_LABEL[status]}
    </Pill>
  );
}
