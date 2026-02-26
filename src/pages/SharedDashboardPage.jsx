import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spin, Empty, Card } from 'antd';
import { Link2 } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { PageHeader } from '@components/common';

/**
 * SharedDashboardPage resolves a share link and redirects to the appropriate
 * dashboard page with baked-in parameters.
 */
export default function SharedDashboardPage() {
  const { shareId } = useParams();
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-dashboard', shareId],
    queryFn: () => v1Service.getDashboardShare(shareId),
    enabled: !!shareId,
    staleTime: 60_000,
  });

  // Build redirect URL with baked params
  const redirectUrl = useMemo(() => {
    if (!data?.pageId) return null;

    const pageRoutes = {
      'overview': '/overview',
      'metrics': '/metrics',
      'logs': '/logs',
      'traces': '/traces',
      'services': '/services',
      'infrastructure': '/infrastructure',
      'saturation': '/saturation',
      'ai-observability': '/ai-observability',
      'error-dashboard': '/overview',
      'slo-sli': '/overview',
      'latency-analysis': '/metrics',
      'messaging-queue': '/infrastructure',
      'resource-utilization': '/infrastructure',
      'database-cache': '/infrastructure',
    };

    const basePath = pageRoutes[data.pageId] || '/overview';
    const params = new URLSearchParams();

    // Apply time range
    if (data.params?.startTime) params.set('t_start', data.params.startTime);
    if (data.params?.endTime) params.set('t_end', data.params.endTime);

    // Apply template variables
    if (data.params?.variables) {
      for (const [key, value] of Object.entries(data.params.variables)) {
        params.set(`var_${key}`, value);
      }
    }

    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" tip="Loading shared dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 40 }}>
        <PageHeader
          title="Shared Dashboard"
          subtitle="This link may have expired or is invalid"
          icon={<Link2 size={24} />}
        />
        <Card style={{ marginTop: 16 }}>
          <Empty description={error?.message || 'Share link not found or has expired.'} />
        </Card>
      </div>
    );
  }

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  return null;
}
