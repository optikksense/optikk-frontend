import { Badge } from "@/components/ui";
import { formatDuration } from "@shared/utils/formatters";
import { memo } from "react";

import { STATUS_VARIANT } from "./statusVariant";

interface Props {
  selectedSpan: { operation_name?: string; status?: string; duration_ms?: number } | null;
}

function DrawerHeaderComponent({ selectedSpan }: Props) {
  return (
    <div className="sdd-header">
      <div>
        <div className="sdd-header__name">{selectedSpan?.operation_name || "Span Detail"}</div>
        <div className="sdd-header__meta">
          <Badge variant={STATUS_VARIANT[selectedSpan?.status ?? ""] ?? "default"}>
            {selectedSpan?.status || "UNSET"}
          </Badge>
          <span className="text-muted text-xs">
            {selectedSpan?.duration_ms != null ? formatDuration(selectedSpan.duration_ms) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export const DrawerHeader = memo(DrawerHeaderComponent);
