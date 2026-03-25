import { Surface } from '@/components/ui';

import DataTable from '@shared/components/ui/data-display/DataTable';

import { APP_COLORS } from '@config/colorLiterals';

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
    <Surface elevation={1} padding="md" className="chart-card">
      <DataTable
        data={{
          columns: errorColumns,
          rows: errorGroups,
          loading: errorsLoading,
          rowKey: (record: any) =>
            `${record.operation_name}-${record.http_status_code}-${record.status_message}`,
        }}
      />
    </Surface>
  );
}
