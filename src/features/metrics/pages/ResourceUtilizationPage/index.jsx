import { useMemo } from 'react';
import { Row, Col, Card } from 'antd';
import { Cpu, HardDrive, Network, Database } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard, DataTable } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { v1Service } from '@services/v1Service';
import './ResourceUtilizationStyle.css';

const pct = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

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
        byInstance
      ] = await Promise.all([
        v1Service.getAvgCPU(teamId, start, end),
        v1Service.getAvgMemory(teamId, start, end),
        v1Service.getAvgNetwork(teamId, start, end),
        v1Service.getAvgConnPool(teamId, start, end),
        v1Service.getCPUUsagePercentage(teamId, start, end),
        v1Service.getMemoryUsagePercentage(teamId, start, end),
        v1Service.getResourceUsageByService(teamId, start, end),
        v1Service.getResourceUsageByInstance(teamId, start, end)
      ]);

      const timeseriesMap = new Map();
      const getOrCreateBucket = (ts, pod) => {
        const key = `${ts}-${pod}`;
        if (!timeseriesMap.has(key)) {
          timeseriesMap.set(key, { timestamp: ts, pod, avg_cpu_util: null, avg_memory_util: null });
        }
        return timeseriesMap.get(key);
      };

      (cpuUsagePercentage || []).forEach(b => {
        const bucket = getOrCreateBucket(b.timestamp, b.pod);
        bucket.avg_cpu_util = b.value;
      });

      (memoryUsagePercentage || []).forEach(b => {
        const bucket = getOrCreateBucket(b.timestamp, b.pod);
        bucket.avg_memory_util = b.value;
      });

      const timeseries = Array.from(timeseriesMap.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      return {
        stats: {
          cpu: avgCpu?.value || 0,
          memory: avgMemory?.value || 0,
          network: avgNetwork?.value || 0,
          connPool: avgConnPool?.value || 0,
        },
        timeseries,
        byService: byService || [],
        byInstance: byInstance || []
      };
    }
  );

  const byService = Array.isArray(data?.byService) ? data.byService : [];
  const byInstance = Array.isArray(data?.byInstance) ? data.byInstance : [];

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
    { title: 'CPU %', dataIndex: 'avg_cpu_util', key: 'avg_cpu_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Memory %', dataIndex: 'avg_memory_util', key: 'avg_memory_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Disk %', dataIndex: 'avg_disk_util', key: 'avg_disk_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Network %', dataIndex: 'avg_network_util', key: 'avg_network_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Conn Pool %', dataIndex: 'avg_connection_pool_util', key: 'avg_connection_pool_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Samples', dataIndex: 'sample_count', key: 'sample_count' },
  ];

  const instanceCols = [
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { title: 'Pod', dataIndex: 'pod', key: 'pod' },
    { title: 'Container', dataIndex: 'container', key: 'container' },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'CPU %', dataIndex: 'avg_cpu_util', key: 'avg_cpu_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Memory %', dataIndex: 'avg_memory_util', key: 'avg_memory_util', render: (v) => pct(v).toFixed(2) },
    { title: 'Conn Pool %', dataIndex: 'avg_connection_pool_util', key: 'avg_connection_pool_util', render: (v) => pct(v).toFixed(2) },
  ];

  return (
    <div>
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
        <DataTable columns={serviceCols} data={byService.map((r, i) => ({ ...r, key: `svc-${i}` }))} loading={isLoading} rowKey="key" />
      </Card>

      <Card title="By Instance">
        <DataTable columns={instanceCols} data={byInstance.map((r, i) => ({ ...r, key: `ins-${i}` }))} loading={isLoading} rowKey="key" />
      </Card>
    </div>
  );
}
