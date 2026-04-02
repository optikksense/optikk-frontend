import { FileText, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Badge, Button, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { LOGS_QUERY_FIELDS } from '@/features/explorer-core/constants/fields';
import { buildLogsExplorerQuery } from '@/features/explorer-core/utils/explorerQuery';
import { ObservabilityQueryBar, PageHeader, PageShell, PageSurface } from '@shared/components/ui';
import { ROUTES } from '@/shared/constants/routes';
import { formatNumber, formatRelativeTime } from '@shared/utils/formatters';
import type { StructuredFilter } from '@/shared/hooks/useURLFilters';
import { useURLFilters } from '@/shared/hooks/useURLFilters';

import { LevelBadge } from '../../components/log/LogRow';
import { LogsNavTabs } from '../../components/LogsNavTabs';
import { useLogTransactions } from '../../hooks/useLogTransactions';
import { LOG_FILTER_FIELDS, LOGS_URL_FILTER_CONFIG } from '../../utils/logUtils';

const GROUP_OPTIONS: SelectOption[] = [
  { value: 'trace_id', label: 'Trace ID' },
  { value: 'service', label: 'Service' },
  { value: 'host', label: 'Host' },
  { value: 'pod', label: 'Pod' },
  { value: 'container', label: 'Container' },
];

function formatDurationNs(ns: number): string {
  if (ns <= 0) return '—';
  const ms = ns / 1e6;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(2)}s`;
  const m = s / 60;
  return `${m.toFixed(1)}m`;
}

function severityFromNumber(n: number): string {
  if (n >= 17) return 'ERROR';
  if (n >= 13) return 'WARN';
  if (n >= 9) return 'INFO';
  return 'DEBUG';
}

export default function LogTransactionsPage(): JSX.Element {
  const navigate = useNavigate();
  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const queryText = typeof urlValues['query'] === 'string' ? urlValues['query'] : '';
  const errorsOnly = urlValues['errorsOnly'] === true;

  const explorerQuery = useMemo(
    () => buildLogsExplorerQuery({ queryText, filters, errorsOnly }),
    [queryText, filters, errorsOnly]
  );

  const [groupByField, setGroupByField] = useState('trace_id');

  const txQuery = useLogTransactions({
    query: explorerQuery,
    groupByField,
    limit: 150,
  });

  const rows = txQuery.data?.transactions ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Log transactions"
        icon={<FileText size={22} />}
        subtitle="Group logs into transactions for funnel and correlation analysis."
        actions={
          <Button
            variant="ghost"
            size="sm"
            icon={<Share2 size={14} />}
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast.success('Share link copied');
            }}
          >
            Share
          </Button>
        }
      />

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <LogsNavTabs />
        <div className="flex flex-col gap-4">
          <ObservabilityQueryBar
            fields={LOG_FILTER_FIELDS}
            filters={filters}
            setFilters={(next: StructuredFilter[]) => setFilters(next)}
            searchText={queryText}
            setSearchText={(v: string) => urlSetters['query']?.(v)}
            onClearAll={() => clearURLFilters()}
            syntaxFields={[...LOGS_QUERY_FIELDS]}
            onSubmitQuery={() => txQuery.refetch()}
            placeholder="service:checkout AND status:error"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="info">{txQuery.isLoading ? 'Loading…' : 'Transactions'}</Badge>
            <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <span>Group by</span>
              <Select
                value={groupByField}
                onChange={(v) => setGroupByField(String(v))}
                options={GROUP_OPTIONS}
              />
            </div>
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">
                  Group value
                </th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Logs</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Duration</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">
                  Max severity
                </th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">First seen</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Last seen</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Services</th>
                <th className="px-3 py-2 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[var(--border-color)]/50 hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <td className="max-w-[220px] truncate px-3 py-2 font-mono text-[11px]">
                    {row.group_value}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums">
                    {formatNumber(row.log_count)}
                  </td>
                  <td className="px-3 py-2 text-[12px]">{formatDurationNs(row.duration_ns)}</td>
                  <td className="px-3 py-2">
                    <LevelBadge level={severityFromNumber(row.max_severity)} />
                  </td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-muted)]">
                    {formatRelativeTime(row.first_seen)}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-muted)]">
                    {formatRelativeTime(row.last_seen)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.services.slice(0, 6).map((s) => (
                        <Badge key={s} variant="default" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const field =
                          groupByField === 'service'
                            ? 'service'
                            : groupByField === 'trace_id'
                              ? 'trace_id'
                              : groupByField;
                        navigate(
                          `${ROUTES.logs}?query=${encodeURIComponent(`${field}:${row.group_value}`)}`
                        );
                      }}
                    >
                      Filter explorer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSurface>
    </PageShell>
  );
}
