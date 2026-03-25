import { Brain } from 'lucide-react';

import { PageHeader, PageShell } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

export default function AiObservabilityPage() {
  return (
    <PageShell>
      <PageHeader
        title="AI Observability"
        subtitle="Performance, cost, and security visibility for LLM / AI model calls"
        icon={<Brain size={24} />}
      />
      <DashboardPage pageId="ai-observability" />
    </PageShell>
  );
}
