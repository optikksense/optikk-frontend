import { Badge } from "@/components/ui";
import { FileText } from "lucide-react";
import { memo } from "react";

import { APP_COLORS } from "@config/colorLiterals";

interface Props {
  count: number;
  isSpeculative: boolean;
}

function LogsHeaderComponent({ count, isSpeculative }: Props) {
  return (
    <div className="flex items-center gap-2 font-semibold text-[15px] text-[var(--text-primary)]">
      <FileText size={18} />
      <span>Associated Logs</span>
      {count > 0 ? (
        <Badge
          color="default"
          style={{
            marginLeft: 8,
            background: APP_COLORS.rgba_255_255_255_0p06_2,
            border: "none",
            color: "var(--text-secondary)",
          }}
        >
          {count} events
        </Badge>
      ) : null}
      {count > 0 ? (
        <Badge variant={isSpeculative ? "warning" : "success"}>
          {isSpeculative ? "Heuristic correlation" : "Exact trace correlation"}
        </Badge>
      ) : null}
    </div>
  );
}

export const LogsHeader = memo(LogsHeaderComponent);
