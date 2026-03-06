import { Select, Switch, Tooltip } from 'antd';
import { AlertCircle, FileText } from 'lucide-react';
import { ReactNode } from 'react';

import { ObservabilityDataBoard, ObservabilityQueryBar, boardHeight } from '@components/common';

import ServicePills from '@features/log/components/log/ServicePills';

import { formatNumber } from '@utils/formatters';

interface LogsTableSectionProps {
  columns: any[];
  logs: any[];
  total: number;
  page: number;
  pageSize: number;
  logsLoading: boolean;
  serviceFacets: any[];
  selectedService: any;
  filters: any[];
  searchText: any;
  errorsOnly: any;
  filterFields: any[];
  onSelectService: (value: any) => void;
  onSetFilters: (filters: any[]) => void;
  onSetSearchText: (value: any) => void;
  onToggleErrorsOnly: (value: any) => void;
  onClearAll: () => void;
  onSetPage: (value: number | ((prev: number) => number)) => void;
  onSetPageSize: (value: number) => void;
  renderRow: (row: any, args: any) => ReactNode;
}

/**
 *
 * @param root0
 * @param root0.columns
 * @param root0.logs
 * @param root0.total
 * @param root0.page
 * @param root0.pageSize
 * @param root0.logsLoading
 * @param root0.serviceFacets
 * @param root0.selectedService
 * @param root0.filters
 * @param root0.searchText
 * @param root0.errorsOnly
 * @param root0.filterFields
 * @param root0.onSelectService
 * @param root0.onSetFilters
 * @param root0.onSetSearchText
 * @param root0.onToggleErrorsOnly
 * @param root0.onClearAll
 * @param root0.onSetPage
 * @param root0.onSetPageSize
 * @param root0.renderRow
 */
export default function LogsTableSection({
  columns,
  logs,
  total,
  page,
  pageSize,
  logsLoading,
  serviceFacets,
  selectedService,
  filters,
  searchText,
  errorsOnly,
  filterFields,
  onSelectService,
  onSetFilters,
  onSetSearchText,
  onToggleErrorsOnly,
  onClearAll,
  onSetPage,
  onSetPageSize,
  renderRow,
}: LogsTableSectionProps) {
  const resolvedTotal = total || logs.length;
  const offset = (page - 1) * pageSize;
  const pageCount = Math.max(1, Math.ceil(resolvedTotal / pageSize));

  return (
    <div className="logs-table-card">
      <div className="logs-table-card-header">
        <span className="logs-table-card-title">
          <FileText size={15} />
          Log Explorer
          <span className="logs-count-badge">
            {formatNumber(logs.length)} of {formatNumber(resolvedTotal)}
          </span>
        </span>
      </div>

      {serviceFacets.length > 0 && (
        <div className="logs-service-pills-row">
          <ServicePills
            facets={serviceFacets}
            selectedService={selectedService}
            onSelect={onSelectService}
          />
        </div>
      )}

      <div className="logs-querybar-row">
        <ObservabilityQueryBar
          fields={filterFields}
          filters={filters}
          setFilters={onSetFilters}
          searchText={searchText}
          setSearchText={onSetSearchText}
          onClearAll={onClearAll}
          placeholder="Search log messages, filter by service, level, host…"
          rightSlot={(
            <Tooltip title="Show only error and fatal logs">
              <div
                className={`logs-errors-toggle ${errorsOnly ? 'active' : ''}`}
                onClick={() => onToggleErrorsOnly(!errorsOnly)}
              >
                <AlertCircle size={13} />
                Errors only
                <Switch
                  size="small"
                  checked={errorsOnly}
                  onChange={onToggleErrorsOnly}
                  onClick={(_, e) => e.stopPropagation()}
                />
              </div>
            </Tooltip>
          )}
        />
      </div>

      <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
        <ObservabilityDataBoard
          columns={columns}
          rows={logs}
          rowKey={(log, i) => log.id ? `log-${log.id}` : `log-${i}-${log.timestamp}`}
          renderRow={renderRow}
          entityName="log"
          storageKey="logs_visible_cols_v2"
          isLoading={logsLoading}
          serverTotal={resolvedTotal}
          emptyTips={[
            { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
            { num: 2, text: <>Remove active <strong>filters</strong> or clear the search</> },
            { num: 3, text: <>Ensure your services emit logs via <strong>OTLP</strong></> },
          ]}
        />
      </div>

      {!logsLoading && (resolvedTotal > 0 || logs.length > 0) && (
        <div className="logs-pagination">
          <span className="logs-pagination-info">
            Showing {offset + 1}–{Math.min(offset + pageSize, resolvedTotal)} of {formatNumber(resolvedTotal)}
          </span>
          <div className="logs-pagination-controls">
            <Select
              size="small"
              value={pageSize}
              onChange={(v) => {
                onSetPageSize(v);
                onSetPage(1);
              }}
              options={[20, 50, 100, 200].map((n) => ({ label: `${n} / page`, value: n }))}
              style={{ width: 110 }}
            />
            <button className="logs-nav-btn" disabled={page <= 1} onClick={() => onSetPage((p) => Math.max(1, p - 1))}>
              ← Prev
            </button>
            <span className="logs-pagination-pages">
              Page {page} of {pageCount}
            </span>
            <button
              className="logs-nav-btn"
              disabled={page >= pageCount}
              onClick={() => onSetPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
