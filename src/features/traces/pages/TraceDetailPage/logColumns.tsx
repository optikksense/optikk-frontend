import { Badge } from "@/components/ui";

import { APP_COLORS } from "@config/colorLiterals";
import { formatTimestamp } from "@shared/utils/formatters";

export const LOG_COLUMNS = [
  {
    title: "Timestamp",
    dataIndex: "timestamp",
    key: "timestamp",
    width: 190,
    render: (value: unknown) => {
      try {
        if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
          return formatTimestamp(value);
        }
        return "-";
      } catch {
        return "-";
      }
    },
  },
  {
    title: "Level",
    dataIndex: "level",
    key: "level",
    width: 90,
    render: (level: unknown) => (
      <Badge color={level === "ERROR" ? "red" : level === "WARN" ? "orange" : APP_COLORS.hex_73c991}>
        {typeof level === "string" && level.length > 0 ? level : "INFO"}
      </Badge>
    ),
  },
  {
    title: "Service",
    dataIndex: "service_name",
    key: "service_name",
    width: 160,
    render: (service: unknown) =>
      typeof service === "string" && service.length > 0 ? service : "-",
  },
  {
    title: "Trace ID",
    dataIndex: "trace_id",
    key: "trace_id",
    width: 220,
    render: (traceIdValue: unknown) => (
      <span className="font-mono text-[12px]">
        {typeof traceIdValue === "string" && traceIdValue.length > 0 ? traceIdValue : "-"}
      </span>
    ),
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    ellipsis: true,
    render: (msg: unknown) => (
      <span className="font-mono text-[12px]">
        {typeof msg === "string" && msg.length > 0 ? msg : "-"}
      </span>
    ),
  },
] as const;
