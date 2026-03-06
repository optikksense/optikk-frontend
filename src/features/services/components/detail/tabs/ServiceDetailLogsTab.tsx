import { Card } from 'antd';

import DataTable from '@components/common/data-display/DataTable';

interface ServiceDetailLogsTabProps {
  logs: any[];
  logsLoading: boolean;
  logColumns: any[];
  onTraceNavigate: (traceId: string) => void;
}

/**
 * Logs tab for service detail page.
 */
export default function ServiceDetailLogsTab({
  logs,
  logsLoading,
  logColumns,
  onTraceNavigate,
}: ServiceDetailLogsTabProps): JSX.Element {
  return (
    <Card className="chart-card" size="small">
      <DataTable
        columns={logColumns}
        data={logs}
        loading={logsLoading}
        rowKey={(record: any) => `${record.timestamp}-${record.trace_id}-${record.span_id}`}
        onRow={(record: any) => ({
          onClick: () => record.trace_id && onTraceNavigate(record.trace_id),
          style: { cursor: record.trace_id ? 'pointer' : 'default' },
        })}
      />
    </Card>
  );
}
