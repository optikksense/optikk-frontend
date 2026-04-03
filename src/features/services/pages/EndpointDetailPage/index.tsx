import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button, Surface, Skeleton } from '@/components/ui';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import { ROUTES } from '@/shared/constants/routes';

import { useServiceEndpoints } from '../../hooks/useServiceEndpoints';
import { useServiceTimeSeries } from '../../hooks/useServiceTimeSeries';

function formatMs(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

export default function EndpointDetailPage() {
  const { serviceName = '', endpointName = '' } = useParams<{
    serviceName: string;
    endpointName: string;
  }>();
  const navigate = useNavigate();
  const decodedEndpoint = decodeURIComponent(endpointName);

  const { endpoints, isLoading: endpointsLoading } = useServiceEndpoints(serviceName);
  const { timeSeries, isLoading: tsLoading } = useServiceTimeSeries(serviceName);

  const endpoint = endpoints.find((ep) => ep.operationName === decodedEndpoint);

  const breadcrumbs = [
    { label: 'Services', path: ROUTES.services },
    { label: serviceName, path: `/services/${encodeURIComponent(serviceName)}` },
    { label: decodedEndpoint },
  ];

  const actions = (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => navigate(`/services/${encodeURIComponent(serviceName)}`)}
    >
      <ArrowLeft size={14} /> Back to Service
    </Button>
  );

  if (!serviceName || !endpointName) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)]">
        Missing service or endpoint name
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 pb-8">
      <PageHeader title={decodedEndpoint} breadcrumbs={breadcrumbs} actions={actions} />

      {endpointsLoading || tsLoading ? (
        <Skeleton count={6} />
      ) : !endpoint ? (
        <div className="py-12 text-center text-[var(--text-muted)]">
          Endpoint not found: {decodedEndpoint}
        </div>
      ) : (
        <>
          {/* Key metrics cards */}
          <div className="grid grid-cols-4 gap-4">
            <Surface elevation={1} padding="sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Method
              </div>
              <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {endpoint.httpMethod.toUpperCase()}
              </div>
            </Surface>
            <Surface elevation={1} padding="sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Requests
              </div>
              <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {endpoint.requestCount.toLocaleString()}
              </div>
            </Surface>
            <Surface elevation={1} padding="sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Error Rate
              </div>
              <div
                className={`mt-1 text-lg font-semibold ${
                  endpoint.errorRate > 5
                    ? 'text-red-400'
                    : endpoint.errorRate > 1
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }`}
              >
                {endpoint.errorRate.toFixed(2)}%
              </div>
            </Surface>
            <Surface elevation={1} padding="sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Latency
              </div>
              <div className="mt-1 space-y-0.5">
                <div className="text-xs text-[var(--text-muted)]">
                  Avg: <span className="font-mono text-[var(--text-primary)]">{formatMs(endpoint.avgLatencyMs)}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  P95: <span className="font-mono text-[var(--text-primary)]">{formatMs(endpoint.p95LatencyMs)}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  P99: <span className="font-mono text-[var(--text-primary)]">{formatMs(endpoint.p99LatencyMs)}</span>
                </div>
              </div>
            </Surface>
          </div>

          {/* Recent traces link */}
          <Surface elevation={1} padding="md">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              Recent Traces
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              View traces for this endpoint:
            </p>
            <a
              href={`/traces?service=${encodeURIComponent(serviceName)}&operation=${encodeURIComponent(decodedEndpoint)}`}
              className="mt-2 inline-flex items-center gap-1 rounded bg-[rgba(124,127,242,0.12)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[rgba(124,127,242,0.2)]"
            >
              View Traces →
            </a>
          </Surface>

          {/* Placeholder for future charts */}
          <Surface elevation={1} padding="md">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              Latency Distribution
            </h3>
            <div className="flex h-[200px] items-center justify-center text-sm text-[var(--text-muted)]">
              Latency histogram coming soon — requires per-endpoint backend API
            </div>
          </Surface>
        </>
      )}
    </div>
  );
}
