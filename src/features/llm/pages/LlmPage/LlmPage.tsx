import { useCallback, useState } from "react";

import { PageTabs } from "@shared/components/primitives/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import AppsTab from "./components/AppsTab";
import CostTab from "./components/CostTab";
import TracesTab from "./components/TracesTab";

type TabKey = "apps" | "traces" | "cost";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "apps", label: "Applications" },
  { key: "traces", label: "Traces" },
  { key: "cost", label: "Cost" },
];

export default function LlmPage() {
  const [tab, setTab] = useState<TabKey>("apps");
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);

  // Clicking an app on the Applications tab jumps to its traces.
  const openTracesForApp = useCallback((service: string) => {
    setServiceFilter(service);
    setTab("traces");
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="LLM Observability"
        subtitle="Token usage, latency, cost and traces for services that call LLMs"
      />
      <PageTabs
        items={TABS}
        activeKey={tab}
        onChange={(key) => setTab(key as TabKey)}
        className="mb-3"
      />
      {tab === "apps" && <AppsTab onOpenTrace={openTracesForApp} />}
      {tab === "traces" && (
        <TracesTab service={serviceFilter} onClearService={() => setServiceFilter(null)} />
      )}

      {tab === "cost" && <CostTab />}
    </PageShell>
  );
}
