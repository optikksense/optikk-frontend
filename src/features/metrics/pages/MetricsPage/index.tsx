import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Select, Space } from 'antd';

import { PageHeader, DashboardPage } from '@shared/components/ui';
import { overviewService } from '@shared/api/overviewService';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

/**
 * Metrics page — RED metrics tabs fully driven by backend YAML config.
 */
export default function MetricsPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  // Fetch Services List
  const { data: servicesRaw } = useTimeRangeQuery(
    'metrics-services-list',
    (teamId, start, end) => overviewService.getServices(teamId, start, end)
  );

  const services = useMemo(() => {
    const raw = Array.isArray(servicesRaw) ? servicesRaw : [];
    return Array.from(new Set(raw.map((s: any) => s.service_name || s.name).filter(Boolean)));
  }, [servicesRaw]);

  // Fetch Operations/Endpoints List for the selected service
  const { data: endpointsRaw } = useTimeRangeQuery(
    'metrics-endpoints-list',
    (teamId, start, end) => overviewService.getEndpointMetrics(teamId, start, end, selectedService ?? ''),
    { enabled: !!selectedService }
  );

  const operations = useMemo(() => {
    const raw = Array.isArray(endpointsRaw) ? endpointsRaw : [];
    return Array.from(new Set(raw.map((e: any) => e.operation_name || e.operationName).filter(Boolean)));
  }, [endpointsRaw]);

  const pathParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (selectedService) params.serviceName = selectedService;
    if (selectedOperation) params.operationName = selectedOperation;
    return params;
  }, [selectedService, selectedOperation]);

  return (
    <div className="metrics-page">
      <PageHeader
        title="Metrics"
        icon={<BarChart3 size={24} />}
        subtitle="System-wide performance metrics"
        actions={
          <Space>
            <Select
              placeholder="All Services"
              allowClear
              style={{ width: 220 }}
              value={selectedService}
              onChange={(val) => {
                setSelectedService(val);
                setSelectedOperation(null); // reset operation when service changes
              }}
              options={services.map((s) => ({ label: s as string, value: s as string }))}
            />
            <Select
              placeholder="All Operations"
              allowClear
              style={{ width: 220 }}
              value={selectedOperation}
              onChange={setSelectedOperation}
              disabled={!selectedService}
              options={operations.map((o) => ({ label: o as string, value: o as string }))}
            />
          </Space>
        }
      />
      <DashboardPage pageId="metrics" pathParams={pathParams} />
    </div>
  );
}
