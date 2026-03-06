import { APP_COLORS } from '@config/colorLiterals';
import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';

import { formatNumber } from '@utils/formatters';

import { NODE_SERVICE_COLUMNS } from './nodeConstants';

interface NodeServicesTableProps {
  rows: any[];
  isLoading: boolean;
}

/**
 *
 * @param root0
 * @param root0.rows
 * @param root0.isLoading
 */
export default function NodeServicesTable({ rows, isLoading }: NodeServicesTableProps) {
  return (
    <div style={{ height: boardHeight(10) }}>
      <ObservabilityDataBoard
        columns={NODE_SERVICE_COLUMNS}
        rows={rows}
        rowKey={(row: any) => row.service_name}
        entityName="service"
        isLoading={isLoading}
        renderRow={(row: any, { colWidths, visibleCols }: any) => {
          const rate = Number(row.error_rate) || 0;
          const errorColor = rate > 10 ? APP_COLORS.hex_f04438 : rate > 2 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991;
          return (
            <>
              {visibleCols.service_name && (
                <div style={{ width: colWidths.service_name, flexShrink: 0, fontWeight: 600 }}>{row.service_name}</div>
              )}
              {visibleCols.request_count && (
                <div style={{ width: colWidths.request_count, flexShrink: 0 }}>{formatNumber(Number(row.request_count) || 0)}</div>
              )}
              {visibleCols.error_rate && (
                <div style={{ width: colWidths.error_rate, flexShrink: 0, color: errorColor, fontWeight: 600 }}>{rate.toFixed(2)}%</div>
              )}
              {visibleCols.avg_latency_ms && (
                <div style={{ width: colWidths.avg_latency_ms, flexShrink: 0 }}>
                  {row.avg_latency_ms != null ? `${Number(row.avg_latency_ms).toFixed(1)}ms` : '-'}
                </div>
              )}
              {visibleCols.p95_latency_ms && (
                <div style={{ width: colWidths.p95_latency_ms, flexShrink: 0 }}>
                  {row.p95_latency_ms != null ? `${Number(row.p95_latency_ms).toFixed(1)}ms` : '-'}
                </div>
              )}
              {visibleCols.pod_count && (
                <div style={{ flex: 1 }}>{formatNumber(Number(row.pod_count) || 0)}</div>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
