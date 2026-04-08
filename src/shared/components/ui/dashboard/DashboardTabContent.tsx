import type { DashboardTabDocument } from "@/types/dashboardConfig";
import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@shared/components/ui/feedback";
import { useComponentDataFetcher } from "@shared/hooks/useComponentDataFetcher";

import ConfigurableDashboard from "./ConfigurableDashboard";

interface DashboardTabContentProps {
  tab: DashboardTabDocument;
  pathParams?: Record<string, string>;
}

/**
 * Renders a single tab's content by fetching each component's query contract.
 * Per-component errors are passed down so each chart card can show its own error overlay.
 */
export default function DashboardTabContent({ tab, pathParams }: DashboardTabContentProps) {
  const { data, isLoading, errors } = useComponentDataFetcher(tab.panels, pathParams);

  if (tab.panels.length === 0) {
    return (
      <div className="dashboard-tab-content page-section">
        <EmptyState
          icon={<LayoutDashboard size={40} className="text-[var(--text-muted)]" />}
          title="No dashboard panels"
          description="This dashboard tab has no panels configured."
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab-content page-section">
      <ConfigurableDashboard
        config={tab}
        dataSources={data}
        errors={errors}
        isLoading={isLoading}
      />
    </div>
  );
}
