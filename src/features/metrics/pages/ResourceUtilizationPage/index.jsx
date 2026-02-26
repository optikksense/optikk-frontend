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
    (teamId, start, end) => v1Service.getResourceUtilization(teamId, start, end)
  );

  const byService = Array.isArray(data?.byService) ? data.byService : [];
  const byInstance = Array.isArray(data?.byInstance) ? data.byInstance : [];

  const stats = useMemo(() => {
    if (!byService.length) {
      return { cpu: 0, memory: 0, disk: 0, network: 0, connPool: 0 };
    }
    const avg = (key) => byService.reduce((s, r) => s + pct(r[key]), 0) / byService.length;
    return {
      cpu: avg('avg_cpu_util'),
      memory: avg('avg_memory_util'),
      disk: avg('avg_disk_util'),
      network: avg('avg_network_util'),
      connPool: avg('avg_connection_pool_util'),
    };
  }, [byService]);

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
