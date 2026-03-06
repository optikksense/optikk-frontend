import { Alert, Col, Row } from 'antd';
import { AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useMemo, useState } from 'react';

import { FilterBar, PageHeader } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { SloComplianceTable, SloHealthGauges } from '@features/overview/components';

import { overviewService } from '@services/overviewService';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

const n = (v: any) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

const AVAILABILITY_TARGET = 99.9;
const P95_TARGET_MS = 300;

/**
 *
 */
export default function SloSliDashboardPage() {
  const [selectedService, setSelectedService] = useState('');
  const { config } = useDashboardConfig('slo-sli');

  const { data: servicesData } = useTimeRangeQuery(
    'overview-services-slo',
    (teamId, start, end) => overviewService.getServices(teamId, start, end),
  );

  const services = servicesData || [];
  const serviceOptions = [
    { label: 'All Services', value: '' },
    ...(Array.isArray(services) ? services : []).map((s: any) => ({
      label: s.service_name || s.serviceName || s.name,
      value: s.service_name || s.serviceName || s.name,
    })),
  ];

  const { data, isLoading } = useTimeRangeQuery(
    'overview-slo-sli',
    (teamId, start, end) => overviewService.getSloSli(teamId, start, end, selectedService || undefined, '5m'),
    { extraKeys: [selectedService] },
  );

  const status: any = (data as any)?.status || {};
  const timeseries = useMemo(() =>
    Array.isArray((data as any)?.timeseries) ? (data as any).timeseries : []
    , [data]);

  const availabilityPct = n(status.availabilityPercent);
  const p95Ms = n(status.p95LatencyMs);
  const errorBudget = n(status.errorBudgetRemainingPercent);
  const isCompliant = availabilityPct >= AVAILABILITY_TARGET && p95Ms <= P95_TARGET_MS;

  const breachedCount = timeseries.filter((row: any) => n(row.availability_percent) < AVAILABILITY_TARGET).length;
  const compliancePct = timeseries.length > 0
    ? ((timeseries.length - breachedCount) / timeseries.length * 100).toFixed(1)
    : '100.0';

  return (
    <div>
      <PageHeader
        title="SLO / SLI Dashboard"
        icon={<Target size={24} />}
        subtitle="Service Level Objectives — availability targets, error budgets, and historical compliance"
      />

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'service',
            placeholder: 'All Services',
            options: serviceOptions,
            value: selectedService || undefined,
            onChange: (value: any) => setSelectedService(String(value || '')),
            width: 200,
          },
        ]}
      />

      {/* Compliance banner */}
      {!isLoading && timeseries.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type={isCompliant ? 'success' : 'error'}
            showIcon
            icon={isCompliant ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            message={
              isCompliant
                ? `All SLOs are being met — ${compliancePct}% of windows compliant`
                : `SLO breach detected — ${breachedCount} window${breachedCount !== 1 ? 's' : ''} below ${AVAILABILITY_TARGET}% availability`
            }
            style={{ borderRadius: 8 }}
          />
        </div>
      )}

      <SloHealthGauges
        isLoading={isLoading}
        availabilityPct={availabilityPct}
        p95Ms={p95Ms}
        errorBudget={errorBudget}
        isCompliant={isCompliant}
        compliancePct={compliancePct}
        timeseriesLength={timeseries.length}
        breachedCount={breachedCount}
        totalRequests={n((data as any)?.summary?.total_requests)}
        averageLatencyMs={n((data as any)?.summary?.avg_latency_ms)}
        availabilityTarget={AVAILABILITY_TARGET}
        p95TargetMs={P95_TARGET_MS}
      />

      {/* Trend Charts — driven by YAML backend config */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <ConfigurableDashboard
            config={config}
            dataSources={{
              'slo-sli-insights': data,
            }}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      <SloComplianceTable
        timeseries={timeseries}
        isLoading={isLoading}
        availabilityTarget={AVAILABILITY_TARGET}
        p95TargetMs={P95_TARGET_MS}
      />
    </div>
  );
}
