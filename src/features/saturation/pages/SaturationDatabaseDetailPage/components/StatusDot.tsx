import { cn } from "@shared/lib/utils";

import type { InstanceStatus } from "@/features/saturation/pages/SaturationDatabasePage/databaseInstanceModel";

const DOT_CLASS: Record<InstanceStatus, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  err: "bg-error",
};

export function StatusDot({ status }: { status: InstanceStatus }) {
  return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASS[status])} />;
}
