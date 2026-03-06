import { Card } from 'antd';

import DataTable from '@components/common/data-display/DataTable';

interface ServiceDetailErrorsTabProps {
  errorGroups: any[];
  errorsLoading: boolean;
  errorColumns: any[];
}

/**
 * Errors tab for service detail page.
 */
export default function ServiceDetailErrorsTab({
  errorGroups,
  errorsLoading,
  errorColumns,
}: ServiceDetailErrorsTabProps): JSX.Element {
  return (
    <Card className="chart-card" size="small">
      <DataTable
        columns={errorColumns}
        data={errorGroups}
        loading={errorsLoading}
        rowKey={(record: any) =>
          `${record.operation_name}-${record.http_status_code}-${record.status_message}`
        }
        expandable={{
          expandedRowRender: (record: any) => (
            <div style={{ padding: 12, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', color: '#F04438', background: 'var(--bg-tertiary, #1A1A1A)', borderRadius: 6 }}>
              {record.status_message || 'No additional details'}
            </div>
          ),
        }}
      />
    </Card>
  );
}

