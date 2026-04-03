export interface ClusterGroup {
  name: string;
  services: string[];
}

/**
 * Auto-detect clusters from service names by common prefix.
 * e.g. "payment-api", "payment-worker" → cluster "payment"
 */
export function detectClusters(serviceNames: string[]): ClusterGroup[] {
  if (serviceNames.length < 3) return [];

  // Find common prefixes (split by - or .)
  const prefixCounts = new Map<string, string[]>();
  for (const name of serviceNames) {
    const parts = name.split(/[-._]/);
    if (parts.length >= 2) {
      const prefix = parts[0];
      if (!prefixCounts.has(prefix)) prefixCounts.set(prefix, []);
      prefixCounts.get(prefix)!.push(name);
    }
  }

  // Only keep groups with 2+ services
  const clusters: ClusterGroup[] = [];
  for (const [prefix, services] of prefixCounts) {
    if (services.length >= 2) {
      clusters.push({ name: prefix, services });
    }
  }

  return clusters.sort((a, b) => b.services.length - a.services.length);
}

export function inferServiceType(name: string): string {
  const lower = name.toLowerCase();
  if (/postgres|mysql|maria|mongo|clickhouse|sqlite|cockroach|database/.test(lower)) return 'database';
  if (/redis|memcache|elasticache|valkey|cache/.test(lower)) return 'cache';
  if (/kafka|rabbit|nats|sqs|pulsar|amqp|queue/.test(lower)) return 'queue';
  if (/grpc/.test(lower)) return 'grpc';
  if (/\.com|\.io|\.net|\.org|external|third.?party|api\./.test(lower)) return 'external';
  return 'application';
}
