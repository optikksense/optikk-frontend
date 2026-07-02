import { useCallback, useState } from "react";

import { PageTabs } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import AppsTab from "./components/AppsTab";
import ComingSoonTab from "./components/ComingSoonTab";
import CostTab from "./components/CostTab";
import TracesTab from "./components/TracesTab";

type TabKey = "apps" | "traces" | "evals" | "patterns" | "security" | "cost";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "apps", label: "Applications" },
  { key: "traces", label: "Traces" },
  { key: "evals", label: "Evaluations" },
  { key: "patterns", label: "Patterns" },
  { key: "security", label: "Security" },
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
      {tab === "evals" && (
        <ComingSoonTab
          title="Evaluations"
          description="Online eval suites (factuality, refusal, tone, tool correctness) will score sampled LLM responses. No evaluators are configured yet."
        />
      )}
      {tab === "patterns" && (
        <ComingSoonTab
          title="Prompt patterns"
          description="Automatic clustering of user prompts into named topics with per-cluster volume, latency and quality."
        />
      )}
      {tab === "security" && (
        <ComingSoonTab
          title="Security"
          description="Prompt-injection detection, PII redaction events and tool allow-list violations from your LLM traffic."
        />
      )}
      {tab === "cost" && <CostTab />}
    </PageShell>
  );
}
