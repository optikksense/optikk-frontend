import { useNavigate } from 'react-router-dom';

import { Surface, Skeleton } from '@/components/ui';

import type { ServiceDependencyDetail } from '../../types';
import { deriveHealthStatus, healthStatusColor } from '../../types';

type ServiceType = 'database' | 'cache' | 'queue' | 'http' | 'grpc' | 'external' | 'application';

const TYPE_LABELS: Record<ServiceType, string> = {
  database: 'Databases',
  cache: 'Caches',
  queue: 'Message Queues',
  http: 'HTTP Services',
  grpc: 'gRPC Services',
  external: 'External APIs',
  application: 'Applications',
};

const TYPE_COLORS: Record<ServiceType, string> = {
  database: 'bg-blue-500/20 text-blue-400',
  cache: 'bg-purple-500/20 text-purple-400',
  queue: 'bg-orange-500/20 text-orange-400',
  http: 'bg-green-500/20 text-green-400',
  grpc: 'bg-cyan-500/20 text-cyan-400',
  external: 'bg-red-500/20 text-red-400',
  application: 'bg-indigo-500/20 text-indigo-400',
};

function inferServiceType(serviceName: string): ServiceType {
  const lower = serviceName.toLowerCase();
  if (/postgres|mysql|maria|mongo|clickhouse|sqlite|cockroach/.test(lower)) return 'database';
  if (/redis|memcache|elasticache|valkey/.test(lower)) return 'cache';
  if (/kafka|rabbit|nats|sqs|pulsar|amqp/.test(lower)) return 'queue';
  if (/grpc/.test(lower)) return 'grpc';
  if (/\.com|\.io|\.net|\.org|external|third.?party/.test(lower)) return 'external';
  return 'application';
}

function formatMs(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

interface ServiceDownstreamPanelProps {
  downstream: ServiceDependencyDetail[];
  loading: boolean;
}

export default function ServiceDownstreamPanel({
  downstream,
  loading,
}: ServiceDownstreamPanelProps) {
  const navigate = useNavigate();

  if (loading) return <Skeleton count={4} />;

  if (downstream.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
        No downstream dependencies found
      </div>
    );
  }

  // Group by inferred type
  const grouped = new Map<ServiceType, ServiceDependencyDetail[]>();
  for (const dep of downstream) {
    const name = dep.target;
    const type = inferServiceType(name);
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(dep);
  }

  // Sort groups by TYPE_LABELS order
  const orderedTypes: ServiceType[] = [
    'database',
    'cache',
    'queue',
    'http',
    'grpc',
    'external',
    'application',
  ];

  return (
    <div className="space-y-4">
      {orderedTypes
        .filter((type) => grouped.has(type))
        .map((type) => {
          const deps = grouped.get(type)!;
          return (
            <div key={type}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_COLORS[type]}`}
                >
                  {TYPE_LABELS[type]}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">({deps.length})</span>
              </div>
              <div className="space-y-1.5">
                {deps.map((dep) => {
                  const health = deriveHealthStatus(dep.errorRate);
                  return (
                    <Surface
                      key={dep.target}
                      elevation={1}
                      padding="sm"
                      className="cursor-pointer transition-colors hover:border-[var(--color-primary)]"
                      onClick={() =>
                        navigate(`/services/${encodeURIComponent(dep.target)}`)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthStatusColor(health) }}
                          />
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {dep.target}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 text-xs text-[var(--text-muted)]">
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              {dep.callCount.toLocaleString()}
                            </strong>{' '}
                            calls
                          </span>
                          <span>{formatMs(dep.p95LatencyMs)} p95</span>
                          <span
                            className={
                              dep.errorRate > 5
                                ? 'text-red-400'
                                : dep.errorRate > 1
                                  ? 'text-yellow-400'
                                  : 'text-green-400'
                            }
                          >
                            {dep.errorRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </Surface>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
