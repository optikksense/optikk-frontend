import { useState } from "react";

import { PageTabs } from "@shared/components/primitives/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import DashboardTab from "./tabs/DashboardTab";
import DatasetsTab from "./tabs/DatasetsTab";
import EvaluatorsTab from "./tabs/EvaluatorsTab";
import PlaygroundTab from "./tabs/PlaygroundTab";
import PromptsTab from "./tabs/PromptsTab";
import SessionsTab from "./tabs/SessionsTab";
import TracesTab from "./tabs/TracesTab";
import UsersTab from "./tabs/UsersTab";

type TabKey =
  | "dashboard"
  | "traces"
  | "sessions"
  | "users"
  | "prompts"
  | "datasets"
  | "evaluators"
  | "playground";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "traces", label: "Traces" },
  { key: "sessions", label: "Sessions" },
  { key: "users", label: "Users" },
  { key: "prompts", label: "Prompts" },
  { key: "datasets", label: "Datasets" },
  { key: "evaluators", label: "Evaluators" },
  { key: "playground", label: "Playground" },
];

export default function LlmPage() {
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <PageShell>
      <PageHeader
        title="LLM Observability"
        subtitle="Traces, sessions, users, prompts, datasets, evaluators and a live playground"
      />
      <PageTabs
        items={TABS}
        activeKey={tab}
        onChange={(key) => setTab(key as TabKey)}
        className="mb-3"
      />
      {tab === "dashboard" && <DashboardTab />}
      {tab === "traces" && <TracesTab />}
      {tab === "sessions" && <SessionsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "prompts" && <PromptsTab />}
      {tab === "datasets" && <DatasetsTab />}
      {tab === "evaluators" && <EvaluatorsTab />}
      {tab === "playground" && <PlaygroundTab />}
    </PageShell>
  );
}
