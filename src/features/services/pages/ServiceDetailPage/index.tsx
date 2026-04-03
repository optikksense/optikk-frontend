import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Tabs } from '@shared/components/primitives/ui/tabs';
import {
  LayoutList,
  GitBranch,
  AlertTriangle,
  FileText,
  ArrowDownRight,
  Activity,
  Server,
  Shield,
} from 'lucide-react';

import { ServiceDetailProvider } from '../../context/ServiceDetailContext';
import ServiceDetailHeader from '../../components/detail/ServiceDetailHeader';
import ServiceGoldenSignalsBar from '../../components/detail/ServiceGoldenSignalsBar';
import ServiceChartsGrid from '../../components/detail/ServiceChartsGrid';
import ServiceEndpointsTable from '../../components/detail/ServiceEndpointsTable';
import ServiceDependencyMap from '../../components/detail/ServiceDependencyMap';
import ServiceErrorTracking from '../../components/detail/ServiceErrorTracking';
import ServiceDownstreamPanel from '../../components/detail/ServiceDownstreamPanel';
import ServiceSpanAnalysis from '../../components/detail/ServiceSpanAnalysis';
import ServiceInfrastructure from '../../components/detail/ServiceInfrastructure';
import ServiceSLO from '../../components/detail/ServiceSLO';

import { useServiceOverviewStats } from '../../hooks/useServiceOverviewStats';
import { useServiceTimeSeries } from '../../hooks/useServiceTimeSeries';
import { useServiceEndpoints } from '../../hooks/useServiceEndpoints';
import { useServiceErrors } from '../../hooks/useServiceErrors';
import { useServiceDependencies } from '../../hooks/useServiceDependencies';
import { useServicePreviousPeriod } from '../../hooks/useServicePreviousPeriod';
import { useServiceSpanAnalysis } from '../../hooks/useServiceSpanAnalysis';
import { useServiceInfrastructure } from '../../hooks/useServiceInfrastructure';

type TabKey =
  | 'endpoints'
  | 'dependencies'
  | 'errors'
  | 'downstream'
  | 'spans'
  | 'infrastructure'
  | 'slo'
  | 'logs';

const TAB_ITEMS = [
  { key: 'endpoints', label: 'Endpoints', icon: <LayoutList size={14} /> },
  { key: 'dependencies', label: 'Dependencies', icon: <GitBranch size={14} /> },
  { key: 'errors', label: 'Errors', icon: <AlertTriangle size={14} /> },
  { key: 'downstream', label: 'Downstream', icon: <ArrowDownRight size={14} /> },
  { key: 'spans', label: 'Span Analysis', icon: <Activity size={14} /> },
  { key: 'infrastructure', label: 'Infrastructure', icon: <Server size={14} /> },
  { key: 'slo', label: 'SLO / Apdex', icon: <Shield size={14} /> },
  { key: 'logs', label: 'Logs', icon: <FileText size={14} /> },
];

function ServiceDetailContent({ serviceName }: { serviceName: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>('endpoints');

  const { stats, isLoading: statsLoading } = useServiceOverviewStats(serviceName);
  const {
    timeSeries,
    requestSparkline,
    errorRateSparkline,
    avgLatencySparkline,
    isLoading: tsLoading,
  } = useServiceTimeSeries(serviceName);
  const { endpoints, isLoading: endpointsLoading } = useServiceEndpoints(serviceName);
  const { errorGroups, isLoading: errorsLoading } = useServiceErrors(
    serviceName,
    activeTab === 'errors'
  );
  const {
    upstream,
    downstream,
    isLoading: depsLoading,
  } = useServiceDependencies(
    serviceName,
    activeTab === 'dependencies' || activeTab === 'downstream'
  );
  const { prevStats } = useServicePreviousPeriod(serviceName);
  const { spans, isLoading: spansLoading } = useServiceSpanAnalysis(
    serviceName,
    activeTab === 'spans'
  );
  const { infra, isLoading: infraLoading } = useServiceInfrastructure(
    serviceName,
    activeTab === 'infrastructure'
  );

  return (
    <div className="flex flex-col gap-6 px-6 pb-8">
      {/* Header */}
      <ServiceDetailHeader serviceName={serviceName} stats={stats} />

      {/* Golden Signals Bar */}
      <ServiceGoldenSignalsBar
        stats={stats}
        prevStats={prevStats}
        requestSparkline={requestSparkline}
        errorRateSparkline={errorRateSparkline}
        avgLatencySparkline={avgLatencySparkline}
        loading={statsLoading || tsLoading}
      />

      {/* SLO / Apdex — always visible above charts */}
      <ServiceSLO
        stats={stats}
        timeSeries={timeSeries}
        errorRateSparkline={errorRateSparkline}
        loading={statsLoading || tsLoading}
      />

      {/* Synchronized Chart Grid */}
      <ServiceChartsGrid timeSeries={timeSeries} loading={tsLoading} />

      {/* Tabs */}
      <div>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={TAB_ITEMS}
          variant="page"
          size="md"
        />

        <div className="mt-4">
          {activeTab === 'endpoints' && (
            <ServiceEndpointsTable endpoints={endpoints} loading={endpointsLoading} />
          )}

          {activeTab === 'dependencies' && (
            <ServiceDependencyMap
              serviceName={serviceName}
              upstream={upstream}
              downstream={downstream}
              loading={depsLoading}
            />
          )}

          {activeTab === 'errors' && (
            <ServiceErrorTracking errorGroups={errorGroups} loading={errorsLoading} />
          )}

          {activeTab === 'downstream' && (
            <ServiceDownstreamPanel downstream={downstream} loading={depsLoading} />
          )}

          {activeTab === 'spans' && (
            <ServiceSpanAnalysis spans={spans} loading={spansLoading} />
          )}

          {activeTab === 'infrastructure' && (
            <ServiceInfrastructure infra={infra} loading={infraLoading} />
          )}

          {activeTab === 'slo' && (
            <ServiceSLO
              stats={stats}
              timeSeries={timeSeries}
              errorRateSparkline={errorRateSparkline}
              loading={statsLoading || tsLoading}
            />
          )}

          {activeTab === 'logs' && (
            <div className="py-8 text-center text-sm text-[var(--text-muted)]">
              Logs integration coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { serviceName } = useParams<{ serviceName: string }>();

  if (!serviceName) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)]">
        No service name provided
      </div>
    );
  }

  return (
    <ServiceDetailProvider serviceName={serviceName}>
      <ServiceDetailContent serviceName={serviceName} />
    </ServiceDetailProvider>
  );
}
