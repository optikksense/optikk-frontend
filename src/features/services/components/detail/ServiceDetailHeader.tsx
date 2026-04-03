import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import { ROUTES } from '@/shared/constants/routes';

import { healthStatusColor, type ServiceOverviewStats } from '../../types';

interface ServiceDetailHeaderProps {
  serviceName: string;
  stats: ServiceOverviewStats | null;
}

export default function ServiceDetailHeader({ serviceName, stats }: ServiceDetailHeaderProps) {
  const navigate = useNavigate();
  const healthColor = stats ? healthStatusColor(stats.healthStatus) : 'var(--text-muted)';

  const breadcrumbs = [
    { label: 'Services', path: ROUTES.services },
    { label: serviceName },
  ];

  const titleContent = (
    <span className="flex items-center gap-2.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: healthColor }}
        title={stats?.healthStatus ?? 'unknown'}
      />
      {serviceName}
    </span>
  );

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/traces?service=${encodeURIComponent(serviceName)}`)}
      >
        <ExternalLink size={14} /> View Traces
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/logs?service=${encodeURIComponent(serviceName)}`)}
      >
        <ExternalLink size={14} /> View Logs
      </Button>
      <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.services)}>
        <ArrowLeft size={14} /> Back
      </Button>
    </div>
  );

  return <PageHeader title={titleContent} breadcrumbs={breadcrumbs} actions={actions} />;
}
