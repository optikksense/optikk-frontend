import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { BarRenderer } from "@shared/components/ui/dashboard/renderers/BarRenderer";

/**
 *
 */
export function AiBarRenderer(props: DashboardPanelRendererProps) {
  return <BarRenderer {...props} />;
}
