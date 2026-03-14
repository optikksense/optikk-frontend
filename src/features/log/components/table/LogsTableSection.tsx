import { Select, Switch, Tooltip } from 'antd';
import { AlertCircle, FileText, Download } from 'lucide-react';
import { ReactNode, useCallback, useState } from 'react';

import { boardHeight } from '@shared/components/ui';
import OptiQLSearchBar from '../search/OptiQLSearchBar';
import VirtualizedLogsTable from './VirtualizedLogsTable';

import { formatNumber } from '@shared/utils/formatters';

import ServicePills from '../log/ServicePills';
import SavedSearches from '../toolbar/SavedSearches';
import ColumnPresets from '../toolbar/ColumnPresets';

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
  optiQLQuery: string;
  setOptiQLQuery: (value: string) => void;
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
  liveTailEnabled?: boolean;
  setLiveTailEnabled?: (enabled: boolean) => void;
}

/**
 *
 */
export interface LogsTableConfig {
  columns: LogColumn[];
  filterFields: LogFilterField[];
  renderRow: (row: LogRecord, args: LogsBoardRenderContext) => ReactNode;
  onOpenDetail?: (log: LogRecord) => void;
}

/**
 *
 */
export interface LogsTableSectionProps {
  data: LogsDataState;
  pagination: LogsPaginationState;
  filters: LogsFiltersState;
  config: LogsTableConfig;
  onExport?: (format: 'json' | 'csv') => void;
  focusedLogIndex?: number;
}

export default function LogsTableSection({
  data,
  pagination,
  filters,
  config,
  onExport,
}: LogsTableSectionProps) {
  const { logs, isLoading, serviceFacets, liveTailEnabled, setLiveTailEnabled } = data;
  const { page, pageSize, total, setPage, setPageSize } = pagination;
  const {
    optiQLQuery,
    setOptiQLQuery,
    clearAll,
  } = filters;
  const { columns, filterFields, renderRow, onOpenDetail } = config;

  // If Live Tail is enabled, UI hides pagination and counts can be infinite.
  const resolvedTotal = total || logs.length;
  const offset = liveTailEnabled ? 0 : (page - 1) * pageSize;
  const pageCount = liveTailEnabled ? 1 : Math.max(1, Math.ceil(resolvedTotal / pageSize));

  // Initialize column visibility and widths to pass down to Virtualized Table
  const defaultVisible: Record<string, boolean> = {};
  const defaultWidths: Record<string, number> = {};
  columns.forEach(c => {
    defaultVisible[c.key] = c.defaultVisible !== false;
    defaultWidths[c.key] = c.defaultWidth ?? 160;
  });

  // Export dropdown state
  const [exportOpen, setExportOpen] = useState(false);

  // Column presets need to remount the board to pick up new localStorage value
  const [boardKey, setBoardKey] = useState(0);

  const handlePresetApplied = useCallback(() => {
    setBoardKey((k) => k + 1);
  }, []);

  const handleApplySavedSearch = useCallback(
    (savedSearchText: string, savedFilters: LogStructuredFilter[]) => {
      // Legacy saved searches map, ideally they should be converted to OptiQL
      // For now, just overriding if they try to use an old saved search.
      setOptiQLQuery(savedSearchText);
      setPage(1);
    },
    [setOptiQLQuery, setPage],
  );

  return (
    <div className="logs-table-card">
      <div className="logs-table-card-header">
        <span className="logs-table-card-title">
          <FileText size={15} />
          Log Explorer
          <span className="logs-count-badge">
            {formatNumber(logs.length)} of {formatNumber(resolvedTotal)}
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              fontWeight: 400,
              marginLeft: 4,
              letterSpacing: '0.02em',
              userSelect: 'none',
            }}
          >
            ⌨ j/k navigate · / search · esc close
          </span>
        </span>

        {/* Toolbar buttons: live tail, column presets, saved searches, export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {setLiveTailEnabled && (
            <button
              onClick={() => setLiveTailEnabled(!liveTailEnabled)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: liveTailEnabled ? 'var(--literal-rgba-99-102-241-0p4)' : 'var(--glass-border)',
                background: liveTailEnabled
                  ? 'var(--literal-rgba-99-102-241-0p12)'
                  : 'transparent',
                color: liveTailEnabled ? 'var(--primary-color, #6366f1)' : 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontWeight: liveTailEnabled ? 600 : 400,
              }}
            >
              <div 
                style={{
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: liveTailEnabled ? 'var(--primary-color, #6366f1)' : 'var(--text-muted)',
                  boxShadow: liveTailEnabled ? '0 0 6px var(--primary-color, #6366f1)' : 'none',
                  animation: liveTailEnabled ? 'pulse 1.5s infinite' : 'none'
                }} 
              />
              Live Tail
            </button>
          )}

          <ColumnPresets onPresetApplied={handlePresetApplied} />

          <SavedSearches
            currentSearchText={optiQLQuery}
            currentFilters={[]}
            onApply={handleApplySavedSearch}
          />

          {onExport && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportOpen((o) => !o)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--glass-border)',
                  background: exportOpen
                    ? 'var(--literal-rgba-94-96-206-0p12)'
                    : 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <Download size={13} />
                Export
              </button>

              {exportOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    onClick={() => setExportOpen(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      zIndex: 1000,
                      minWidth: 140,
                      background: 'var(--glass-bg)',
                      backdropFilter: 'var(--glass-blur)',
                      WebkitBackdropFilter: 'var(--glass-blur)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 8,
                      boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.4))',
                      padding: 6,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(['json', 'csv'] as const).map((fmt) => (
                      <div
                        key={fmt}
                        onClick={() => {
                          onExport(fmt);
                          setExportOpen(false);
                        }}
                        style={{
                          padding: '7px 12px',
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          borderRadius: 5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            'var(--literal-rgba-255-255-255-0p04)';
                          (e.currentTarget as HTMLElement).style.color =
                            'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            'transparent';
                          (e.currentTarget as HTMLElement).style.color =
                            'var(--text-secondary)';
                        }}
                      >
                        Download .{fmt}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {serviceFacets.length > 0 && (
        <div className="logs-service-pills-row">
          <ServicePills
            facets={serviceFacets}
            selectedService={null}
            onSelect={(svc) => {
              if (svc) {
                const prefix = optiQLQuery.trim() === '' ? '' : ' ';
                setOptiQLQuery(`${optiQLQuery}${prefix}service="${svc}"`);
              }
            }}
          />
        </div>
      )}

      <div className="logs-querybar-row" style={{ marginBottom: 16 }}>
        <OptiQLSearchBar 
          value={optiQLQuery} 
          onChange={setOptiQLQuery} 
          placeholder="Search logs with OptiQL (e.g. service=&#34;api&#34; level:error &#34;timeout&#34;)" 
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="clear-filter-btn" onClick={clearAll} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
            Clear all
          </button>
        </div>
      </div>

      <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
        <VirtualizedLogsTable
          logs={logs}
          isLoading={isLoading}
          columns={columns}
          visibleCols={defaultVisible}
          colWidths={defaultWidths}
          onOpenDetail={onOpenDetail || (() => {})}
          followOutput={liveTailEnabled ? 'smooth' : false}
        />
      </div>

      {!isLoading && !liveTailEnabled && (resolvedTotal > 0 || logs.length > 0) && (
        <div className="logs-pagination">
          <span className="logs-pagination-info">
            Showing {offset + 1}–{Math.min(offset + pageSize, resolvedTotal)} of{' '}
            {formatNumber(resolvedTotal)}
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
            <button
              className="logs-nav-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
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
