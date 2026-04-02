import { FileText, Share2 } from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Badge, Button } from '@/components/ui';
import { LOGS_QUERY_FIELDS } from '@/features/explorer-core/constants/fields';
import { buildLogsExplorerQuery } from '@/features/explorer-core/utils/explorerQuery';
import { ObservabilityQueryBar, PageHeader, PageShell, PageSurface } from '@shared/components/ui';
import { ROUTES } from '@/shared/constants/routes';
import { formatNumber, formatRelativeTime } from '@shared/utils/formatters';
import type { StructuredFilter } from '@/shared/hooks/useURLFilters';
import { useURLFilters } from '@/shared/hooks/useURLFilters';

import { LogsNavTabs } from '../../components/LogsNavTabs';
import { useLogPatterns } from '../../hooks/useLogPatterns';
import { LOG_FILTER_FIELDS, LOGS_URL_FILTER_CONFIG } from '../../utils/logUtils';

function highlightPattern(text: string): JSX.Element {
  const parts = text.split(/(<[^>]+>)/g);
  return (
    <span className="font-mono text-[12px] text-[var(--text-primary)]">
      {parts.map((part, i) =>
        part.startsWith('<') && part.endsWith('>') ? (
          <span key={i} className="text-[var(--color-accent)]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function LogPatternsPage(): JSX.Element {
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

  const patternsQuery = useLogPatterns({ query: explorerQuery, limit: 150 });

  const rows = patternsQuery.data?.patterns ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Log patterns"
        icon={<FileText size={22} />}
        subtitle="Clustered log templates with placeholder tokens for high-volume triage."
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
            onSubmitQuery={() => patternsQuery.refetch()}
            placeholder="service:checkout AND status:error"
          />
          <div className="flex items-center gap-2">
            <Badge variant="info">{patternsQuery.isLoading ? 'Loading…' : 'Patterns'}</Badge>
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Pattern</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Count</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">First seen</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Last seen</th>
                <th className="px-3 py-2 font-semibold text-[var(--text-secondary)]">Sample</th>
                <th className="px-3 py-2 text-right text-[var(--text-secondary)]"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[var(--border-color)]/50 hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <td className="px-3 py-2 align-top">{highlightPattern(row.pattern)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{formatNumber(row.count)}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-muted)]">
                    {formatRelativeTime(row.first_seen)}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-muted)]">
                    {formatRelativeTime(row.last_seen)}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-secondary)]">
                    <span className="line-clamp-2">{row.sample}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigate(
                          `${ROUTES.logs}?query=${encodeURIComponent(`body:*${row.pattern.slice(0, 64)}*`)}`
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
