import { Row, Col, Card } from 'antd';
import { Cpu, HardDrive, Network, Database } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader, StatCard, DataTable } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import './ResourceUtilizationStyle.css';

const pct = (v: any) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

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
        (v1Service as any).getAvgCPU(teamId, start, end),
        (v1Service as any).getAvgMemory(teamId, start, end),
        (v1Service as any).getAvgNetwork(teamId, start, end),
        (v1Service as any).getAvgConnPool(teamId, start, end),
        (v1Service as any).getCPUUsagePercentage(teamId, start, end),
        (v1Service as any).getMemoryUsagePercentage(teamId, start, end),
        (v1Service as any).getResourceUsageByService(teamId, start, end),
        (v1Service as any).getResourceUsageByInstance(teamId, start, end),
      ]);

      const timeseriesMap = new Map();
      const getOrCreateBucket = (ts: string, pod: string) => {
        const key = `${ts}-${pod}`;
        if (!timeseriesMap.has(key)) {
          timeseriesMap.set(key, { timestamp: ts, pod, avg_cpu_util: null, avg_memory_util: null });
        }
        return timeseriesMap.get(key);
      };

      ((cpuUsagePercentage as any[]) || []).forEach((b) => {
        const bucket = getOrCreateBucket(b.timestamp, b.pod);
        bucket.avg_cpu_util = b.value;
      });

      ((memoryUsagePercentage as any[]) || []).forEach((b) => {
        const bucket = getOrCreateBucket(b.timestamp, b.pod);
        bucket.avg_memory_util = b.value;
      });

      const timeseries = Array.from(timeseriesMap.values()).sort((a: any, b: any) => a.timestamp.localeCompare(b.timestamp));

      return {
        stats: {
          cpu: avgCpu?.value || 0,
          memory: avgMemory?.value || 0,
          network: avgNetwork?.value || 0,
          connPool: avgConnPool?.value || 0,
        },
        timeseries,
        byService: byService || [],
        byInstance: byInstance || [],
      };
    },
  );

  const byService = Array.isArray((data as any)?.byService) ? (data as any).byService : [];
  const byInstance = Array.isArray((data as any)?.byInstance) ? (data as any).byInstance : [];

  const stats = useMemo(() => {
    return {
      cpu: (data as any)?.stats?.cpu || 0,
      memory: (data as any)?.stats?.memory || 0,
      network: (data as any)?.stats?.network || 0,
      connPool: (data as any)?.stats?.connPool || 0,
    };
  }, [data]);

  const serviceCols = [
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'CPU %', dataIndex: 'avg_cpu_util', key: 'avg_cpu_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Memory %', dataIndex: 'avg_memory_util', key: 'avg_memory_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Disk %', dataIndex: 'avg_disk_util', key: 'avg_disk_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Network %', dataIndex: 'avg_network_util', key: 'avg_network_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Conn Pool %', dataIndex: 'avg_connection_pool_util', key: 'avg_connection_pool_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Samples', dataIndex: 'sample_count', key: 'sample_count' },
  ];

  const instanceCols = [
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { title: 'Pod', dataIndex: 'pod', key: 'pod' },
    { title: 'Container', dataIndex: 'container', key: 'container' },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'CPU %', dataIndex: 'avg_cpu_util', key: 'avg_cpu_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Memory %', dataIndex: 'avg_memory_util', key: 'avg_memory_util', render: (v: any) => pct(v).toFixed(2) },
    { title: 'Conn Pool %', dataIndex: 'avg_connection_pool_util', key: 'avg_connection_pool_util', render: (v: any) => pct(v).toFixed(2) },
  ];

  return (
    <div className="resource-utilization-page">
      <PageHeader title="Resource Utilization" icon={<Cpu size={24} />} subtitle="CPU, memory, disk, network and connection pool utilization by service/instance" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg CPU" value={`${stats.cpu.toFixed(1)}%`} icon={<Cpu size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg Memory" value={`${stats.memory.toFixed(1)}%`} icon={<HardDrive size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg Network" value={`${stats.network.toFixed(1)}%`} icon={<Network size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg Conn Pool" value={`${stats.connPool.toFixed(1)}%`} icon={<Database size={18} />} loading={isLoading} /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <ConfigurableDashboard
            config={config}
            dataSources={{
              'resource-utilization': data,
            }}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      <Card title="By Service" style={{ marginBottom: 16 }}>
        <DataTable columns={serviceCols} data={byService.map((r: any, i: number) => ({ ...r, key: `svc-${i}` }))} loading={isLoading} rowKey="key" />
      </Card>

      <Card title="By Instance">
        <DataTable columns={instanceCols} data={byInstance.map((r: any, i: number) => ({ ...r, key: `ins-${i}` }))} loading={isLoading} rowKey="key" />
      </Card>
    </div>
  );
}
