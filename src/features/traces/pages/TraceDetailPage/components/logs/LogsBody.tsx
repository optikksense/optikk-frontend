import { SimpleTable } from "@/components/ui";
import { memo } from "react";

import { LOG_COLUMNS } from "../../logColumns";

type LogRow = Record<string, unknown> & { timestamp?: string | number; service_name?: string };

interface Props {
  logs: LogRow[];
  loading: boolean;
}

function LogsBodyComponent({ logs, loading }: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="ok-spinner" />
      </div>
    );
  }
  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-[var(--text-muted)]">
        No logs associated with this trace
      </div>
    );
  }
  return (
    <SimpleTable
      columns={LOG_COLUMNS as never}
      dataSource={logs}
      rowKey={(row, index) =>
        `${(row as { timestamp?: string | number }).timestamp ?? ""}-${(row as { service_name?: string }).service_name ?? ""}-${index}`
      }
      size="small"
      pagination={false}
      scroll={{ y: 300 }}
      className="glass-table"
    />
  );
}

export const LogsBody = memo(LogsBodyComponent);
