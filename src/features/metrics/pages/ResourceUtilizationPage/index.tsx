import { Surface } from '@/components/ui';
import { Cpu, HardDrive, Network, Database } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader, StatCard, DataTable } from '@shared/components/ui';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { metricsService } from '@shared/api/metricsService';
import type {
  MetricNumericValue,
  ResourceUsageByInstanceRowDto,
  ResourceUsageByServiceRowDto,
  ResourceUsageTimeSeriesPointDto,
} from '@shared/api/schemas/metricsSchemas';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

const pct = (value: unknown) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

type ResourceUtilizationTimeSeriesRow = {
  readonly timestamp: string;
  readonly pod: string;
  avg_cpu_util: number | null;
  avg_memory_util: number | null;
};

/**
 *
 */
export default function ResourceUtilizationPage() {
  const { config } = useDashboardConfig('resource-utilization');
  const { data, isLoading } = useTimeRangeQuery(
    'resource-utilization-insights',
    async (teamId, start, end) => {
      const [
        avgCpu,
        avgMemory,
        avgNetwork,
        avgConnPool,
        cpuUsagePercentage,
        memoryUsagePercentage,
        byService,
        byInstance,
      ] = await Promise.all([
        metricsService.getAvgCPU(teamId, start, end),
        metricsService.getAvgMemory(teamId, start, end),
        metricsService.getAvgNetwork(teamId, start, end),
        metricsService.getAvgConnPool(teamId, start, end),
        metricsService.getCPUUsagePercentage(teamId, start, end),
        metricsService.getMemoryUsagePercentage(teamId, start, end),
        metricsService.getResourceUsageByService(teamId, start, end),
        metricsService.getResourceUsageByInstance(teamId, start, end),
      ]);

      const timeseriesMap = new Map<string, ResourceUtilizationTimeSeriesRow>();
      const getOrCreateBucket = (ts: string, pod: string): ResourceUtilizationTimeSeriesRow => {
        const key = `${ts}-${pod}`;
        if (!timeseriesMap.has(key)) {
          timeseriesMap.set(key, { timestamp: ts, pod, avg_cpu_util: null, avg_memory_util: null });
        }
        return timeseriesMap.get(key)!;
      };

      cpuUsagePercentage.forEach((bucket: ResourceUsageTimeSeriesPointDto) => {
        const row = getOrCreateBucket(bucket.timestamp, bucket.pod);
        row.avg_cpu_util = bucket.value;
      });

      memoryUsagePercentage.forEach((bucket: ResourceUsageTimeSeriesPointDto) => {
        const row = getOrCreateBucket(bucket.timestamp, bucket.pod);
        row.avg_memory_util = bucket.value;
      });

      const timeseries = Array.from(timeseriesMap.values()).sort((left, right) => left.timestamp.localeCompare(right.timestamp));

      return {
        stats: {
          cpu: avgCpu?.value || 0,
          memory: avgMemory?.value || 0,
          network: avgNetwork?.value || 0,
          connPool: avgConnPool?.value || 0,
        },
        timeseries,
        byService,
        byInstance,
      };
    },
  );

  const byService: ResourceUsageByServiceRowDto[] = data?.byService ?? [];
  const byInstance: ResourceUsageByInstanceRowDto[] = data?.byInstance ?? [];

  const stats = useMemo(() => {
    return {
      cpu: data?.stats?.cpu || 0,
      memory: data?.stats?.memory || 0,
      network: data?.stats?.network || 0,
      connPool: data?.stats?.connPool || 0,
    };
  }, [data]);

  const serviceCols = [
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'CPU %', dataIndex: 'avg_cpu_util', key: 'avg_cpu_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Memory %', dataIndex: 'avg_memory_util', key: 'avg_memory_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Disk %', dataIndex: 'avg_disk_util', key: 'avg_disk_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Network %', dataIndex: 'avg_network_util', key: 'avg_network_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Conn Pool %', dataIndex: 'avg_connection_pool_util', key: 'avg_connection_pool_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Samples', dataIndex: 'sample_count', key: 'sample_count' },
  ];

  const instanceCols = [
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { title: 'Pod', dataIndex: 'pod', key: 'pod' },
    { title: 'Container', dataIndex: 'container', key: 'container' },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'CPU %', dataIndex: 'avg_cpu_util', key: 'avg_cpu_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Memory %', dataIndex: 'avg_memory_util', key: 'avg_memory_util', render: (value: unknown) => pct(value).toFixed(2) },
    { title: 'Conn Pool %', dataIndex: 'avg_connection_pool_util', key: 'avg_connection_pool_util', render: (value: unknown) => pct(value).toFixed(2) },
  ];

  return (
    <div className="resource-utilization-page">
      <PageHeader title="Resource Utilization" icon={<Cpu size={24} />} subtitle="CPU, memory, disk, network and connection pool utilization by service/instance" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
        <StatCard
          metric={{ title: 'Avg CPU', value: `${stats.cpu.toFixed(1)}%` }}
          visuals={{ icon: <Cpu size={18} />, loading: isLoading }}
        />
        <StatCard
          metric={{ title: 'Avg Memory', value: `${stats.memory.toFixed(1)}%` }}
          visuals={{ icon: <HardDrive size={18} />, loading: isLoading }}
        />
        <StatCard
          metric={{ title: 'Avg Network', value: `${stats.network.toFixed(1)}%` }}
          visuals={{ icon: <Network size={18} />, loading: isLoading }}
        />
        <StatCard
          metric={{ title: 'Avg Conn Pool', value: `${stats.connPool.toFixed(1)}%` }}
          visuals={{ icon: <Database size={18} />, loading: isLoading }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={{
            'resource-utilization': data,
          }}
          isLoading={isLoading}
        />
      </div>

      <Surface elevation={1} padding="md" style={{ marginBottom: 16 }}>
        <h4>By Service</h4>
        <DataTable
          data={{
            columns: serviceCols,
            rows: byService.map((row, index) => ({ ...row, key: `svc-${index}` })),
            loading: isLoading,
            rowKey: "key"
          }}
        />
      </Surface>

      <Surface elevation={1} padding="md">
        <h4>By Instance</h4>
        <DataTable
          data={{
            columns: instanceCols,
            rows: byInstance.map((row, index) => ({ ...row, key: `ins-${index}` })),
            loading: isLoading,
            rowKey: "key"
          }}
        />
      </Surface>
    </div>
  );
}
