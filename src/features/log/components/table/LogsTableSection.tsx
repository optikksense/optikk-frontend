import { Select, Switch, Tooltip } from 'antd';
import { AlertCircle, FileText } from 'lucide-react';
import { ReactNode } from 'react';

import { ObservabilityDataBoard, ObservabilityQueryBar, boardHeight } from '@shared/components/ui';

import { formatNumber } from '@shared/utils/formatters';

import ServicePills from '../log/ServicePills';

import type {
  LogColumn,
  LogFacet,
  LogFilterField,
  LogRecord,
  LogsBoardRenderContext,
  LogStructuredFilter,
} from '../../types';

/**
 *
 */
export interface LogsFiltersState {
  filters: LogStructuredFilter[];
  searchText: string;
  selectedService: string | null;
  errorsOnly: boolean;
  setFilters: (filters: LogStructuredFilter[]) => void;
  setSearchText: (value: string) => void;
  setSelectedService: (value: string | null) => void;
  setErrorsOnly: (value: boolean) => void;
  clearAll: () => void;
}

/**
 *
 */
export interface LogsPaginationState {
  page: number;
  pageSize: number;
  total: number;
  setPage: (value: number | ((prev: number) => number)) => void;
  setPageSize: (value: number) => void;
}

/**
 *
 */
export interface LogsDataState {
  logs: LogRecord[];
  isLoading: boolean;
  serviceFacets: LogFacet[];
}

/**
 *
 */
export interface LogsTableConfig {
  columns: LogColumn[];
  filterFields: LogFilterField[];
  renderRow: (row: LogRecord, args: LogsBoardRenderContext) => ReactNode;
}

/**
 *
 */
export interface LogsTableSectionProps {
  data: LogsDataState;
  pagination: LogsPaginationState;
  filters: LogsFiltersState;
  config: LogsTableConfig;
}

export default function LogsTableSection({
  data,
  pagination,
  filters,
  config,
}: LogsTableSectionProps) {
  const { logs, isLoading, serviceFacets } = data;
  const { page, pageSize, total, setPage, setPageSize } = pagination;
  const {
    filters: structuredFilters,
    searchText,
    selectedService,
    errorsOnly,
    setFilters,
    setSearchText,
    setSelectedService,
    setErrorsOnly,
    clearAll,
  } = filters;
  const { columns, filterFields, renderRow } = config;

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
            onSelect={setSelectedService}
          />
        </div>
      )}

      <div className="logs-querybar-row">
        <ObservabilityQueryBar
          fields={filterFields}
          filters={structuredFilters}
          setFilters={setFilters}
          searchText={searchText}
          setSearchText={setSearchText}
          onClearAll={clearAll}
          valueHints={{
            'service_name': serviceFacets.map(f => f.value),
            'level': ['INFO', 'ERROR', 'WARN', 'DEBUG', 'FATAL']
          }}
          placeholder="Search log messages, filter by service, level, host…"
          rightSlot={(
            <Tooltip title="Show only error and fatal logs">
              <div
                className={`logs-errors-toggle ${errorsOnly ? 'active' : ''}`}
                onClick={() => setErrorsOnly(!errorsOnly)}
              >
                <AlertCircle size={13} />
                Errors only
                <Switch
                  size="small"
                  checked={errorsOnly}
                  onChange={setErrorsOnly}
                  onClick={(_, e) => e.stopPropagation()}
                />
              </div>
            </Tooltip>
          )}
        />
      </div>

      <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
        <ObservabilityDataBoard<LogRecord>
          data={{ rows: logs, isLoading, serverTotal: resolvedTotal }}
          config={{
            columns,
            rowKey: (log, index) => {
              const id = log.id;
              if (id !== null && id !== undefined && String(id) !== '') {
                return `log-${String(id)}`;
              }
              return `log-${index}-${String(log.timestamp ?? '')}`;
            },
            renderRow,
            entityName: 'log',
            storageKey: 'logs_visible_cols_v2',
            emptyTips: [
              { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
              { num: 2, text: <>Remove active <strong>filters</strong> or clear the search</> },
              { num: 3, text: <>Ensure your services emit logs via <strong>OTLP</strong></> },
            ]
          }}
        />
      </div>

      {!isLoading && (resolvedTotal > 0 || logs.length > 0) && (
        <div className="logs-pagination">
          <span className="logs-pagination-info">
            Showing {offset + 1}–{Math.min(offset + pageSize, resolvedTotal)} of {formatNumber(resolvedTotal)}
          </span>
          <div className="logs-pagination-controls">
            <Select<number>
              size="small"
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              options={[20, 50, 100, 200].map((n) => ({ label: `${n} / page`, value: n }))}
              style={{ width: 110 }}
            />
            <button className="logs-nav-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ← Prev
            </button>
            <span className="logs-pagination-pages">
              Page {page} of {pageCount}
            </span>
            <button
              className="logs-nav-btn"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
