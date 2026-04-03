import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DataTable from '@shared/components/ui/data-display/DataTable';
import type { SimpleTableColumn } from '@shared/components/primitives/ui/simple-table';

import { useServiceDetailContext } from '../../context/ServiceDetailContext';
import type { ServiceEndpoint } from '../../types';

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

function formatMs(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

function errorRateBadgeColor(rate: number): string {
  if (rate > 5) return 'text-red-400';
  if (rate > 1) return 'text-yellow-400';
  return 'text-green-400';
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-500/20 text-blue-400',
  POST: 'bg-green-500/20 text-green-400',
  PUT: 'bg-yellow-500/20 text-yellow-400',
  PATCH: 'bg-orange-500/20 text-orange-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

function MethodBadge({ method }: { method: string }) {
  const upper = method.toUpperCase();
  const cls = METHOD_COLORS[upper] ?? 'bg-gray-500/20 text-gray-400';
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${cls}`}>
      {upper}
    </span>
  );
}

/** Group similar endpoints by replacing numeric path segments with :id */
function groupEndpointName(name: string): string {
  return name.replace(/\/\d+/g, '/:id').replace(/\/[0-9a-f]{8,}/gi, '/:id');
}

interface ServiceEndpointsTableProps {
  endpoints: ServiceEndpoint[];
  loading: boolean;
}

export default function ServiceEndpointsTable({
  endpoints,
  loading,
}: ServiceEndpointsTableProps) {
  const navigate = useNavigate();
  const { serviceName } = useServiceDetailContext();
  const [search, setSearch] = useState('');
  const [groupByResource, setGroupByResource] = useState(false);

  const processedEndpoints = useMemo(() => {
    let list = endpoints;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (ep) =>
          ep.operationName.toLowerCase().includes(q) ||
          ep.httpMethod.toLowerCase().includes(q)
      );
    }

    // Group by resource pattern
    if (groupByResource) {
      const groups = new Map<string, ServiceEndpoint>();
      for (const ep of list) {
        const key = `${ep.httpMethod}::${groupEndpointName(ep.operationName)}`;
        const existing = groups.get(key);
        if (existing) {
          groups.set(key, {
            ...existing,
            requestCount: existing.requestCount + ep.requestCount,
            errorCount: existing.errorCount + ep.errorCount,
            errorRate:
              existing.requestCount + ep.requestCount > 0
                ? ((existing.errorCount + ep.errorCount) /
                    (existing.requestCount + ep.requestCount)) *
                  100
                : 0,
            avgLatencyMs:
              (existing.avgLatencyMs * existing.requestCount +
                ep.avgLatencyMs * ep.requestCount) /
              Math.max(existing.requestCount + ep.requestCount, 1),
            p95LatencyMs: Math.max(existing.p95LatencyMs, ep.p95LatencyMs),
            p99LatencyMs: Math.max(existing.p99LatencyMs, ep.p99LatencyMs),
          });
        } else {
          groups.set(key, {
            ...ep,
            operationName: groupEndpointName(ep.operationName),
          });
        }
      }
      list = Array.from(groups.values());
    }

    return list;
  }, [endpoints, search, groupByResource]);

  const columns: SimpleTableColumn<ServiceEndpoint>[] = useMemo(
    () => [
      {
        title: 'Endpoint',
        dataIndex: 'operationName',
        key: 'endpoint',
        ellipsis: true,
        width: '35%',
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className="flex items-center gap-2">
            <MethodBadge method={row.httpMethod} />
            <span className="truncate font-mono text-xs">{row.operationName}</span>
          </span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) =>
          a.operationName.localeCompare(b.operationName),
      },
      {
        title: 'Req/s',
        dataIndex: 'requestCount',
        key: 'reqPerSec',
        align: 'right' as const,
        width: 90,
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className="font-mono text-xs">{formatNum(row.requestCount)}</span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) => a.requestCount - b.requestCount,
        defaultSortOrder: 'descend' as const,
      },
      {
        title: 'Errors',
        dataIndex: 'errorCount',
        key: 'errors',
        align: 'right' as const,
        width: 80,
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className="font-mono text-xs">{formatNum(row.errorCount)}</span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) => a.errorCount - b.errorCount,
      },
      {
        title: 'Error %',
        dataIndex: 'errorRate',
        key: 'errorRate',
        align: 'right' as const,
        width: 80,
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className={`font-mono text-xs ${errorRateBadgeColor(row.errorRate)}`}>
            {row.errorRate.toFixed(2)}%
          </span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) => a.errorRate - b.errorRate,
      },
      {
        title: 'Avg',
        dataIndex: 'avgLatencyMs',
        key: 'avgLatency',
        align: 'right' as const,
        width: 90,
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className="font-mono text-xs">{formatMs(row.avgLatencyMs)}</span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) => a.avgLatencyMs - b.avgLatencyMs,
      },
      {
        title: 'P95',
        dataIndex: 'p95LatencyMs',
        key: 'p95',
        align: 'right' as const,
        width: 90,
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className="font-mono text-xs">{formatMs(row.p95LatencyMs)}</span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) => a.p95LatencyMs - b.p95LatencyMs,
      },
      {
        title: 'P99',
        dataIndex: 'p99LatencyMs',
        key: 'p99',
        align: 'right' as const,
        width: 90,
        render: (_: unknown, row: ServiceEndpoint) => (
          <span className="font-mono text-xs">{formatMs(row.p99LatencyMs)}</span>
        ),
        sorter: (a: ServiceEndpoint, b: ServiceEndpoint) => a.p99LatencyMs - b.p99LatencyMs,
      },
    ],
    []
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search endpoints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary)]"
        />
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={groupByResource}
            onChange={(e) => setGroupByResource(e.target.checked)}
            className="accent-[var(--color-primary)]"
          />
          Group by resource
        </label>
      </div>
      <DataTable
        data={{
          columns,
          rows: processedEndpoints,
          loading,
          rowKey: (row: ServiceEndpoint) => `${row.httpMethod}::${row.operationName}`,
        }}
        pagination={{ showPagination: processedEndpoints.length > 20, pageSize: 20 }}
        config={{
          onRow: (row: ServiceEndpoint) => ({
            onClick: () =>
              navigate(
                `/services/${encodeURIComponent(serviceName)}/endpoints/${encodeURIComponent(row.operationName)}`
              ),
            style: { cursor: 'pointer' },
          }),
        }}
      />
    </div>
  );
}
