import { Gauge } from "lucide-react";

import { PageHeader, PageShell } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import DashboardPage from "@shared/components/ui/dashboard/DashboardPage";

/**
 * SaturationHubPage — groups the Database and Messaging Queue saturation tabs.
 * The Database tab is fully driven by backend JSON config (pageId=saturation, tabId=database)
 * so adding new charts only requires updating database.json — no frontend changes needed.
 */
export default function SaturationHubPage() {
  return (
    <PageShell>
      <PageHeader
        title="Saturation"
        subtitle="Track database and messaging bottlenecks with the same tab rhythm as the rest of the product."
        icon={<Gauge size={24} />}
      />
      <DashboardPage pageId="saturation" />
      <DashboardEntityDrawer />
    </PageShell>
  );
}
