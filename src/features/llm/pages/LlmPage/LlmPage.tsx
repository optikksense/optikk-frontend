import { useNavigate, useSearch } from "@tanstack/react-router";

import { PageTabs } from "@shared/components/primitives/ui/page-tabs";
import PageHeader from "@shared/components/ui/layout/PageHeader";
import { PageShell } from "@shared/components/ui/layout/PageShell";

import { DEFAULT_LLM_TAB, type LlmTab, isLlmTab } from "./llmTabs";
import DashboardTab from "./tabs/DashboardTab";
import DatasetsTab from "./tabs/DatasetsTab";
import EvaluatorsTab from "./tabs/EvaluatorsTab";
import PlaygroundTab from "./tabs/PlaygroundTab";
import PromptsTab from "./tabs/PromptsTab";
import SessionsTab from "./tabs/SessionsTab";
import TracesTab from "./tabs/TracesTab";
import UsersTab from "./tabs/UsersTab";

const TABS: Array<{ key: LlmTab; label: string }> = [
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
  const search = useSearch({ from: "/_app/llm/" });
  const navigate = useNavigate();
  const tab = search.tab ?? DEFAULT_LLM_TAB;

  const setTab = (key: string) => {
    const next = isLlmTab(key) ? key : DEFAULT_LLM_TAB;
    navigate({
      to: "/llm",
      search: (prev) => ({ ...prev, tab: next === DEFAULT_LLM_TAB ? undefined : next }),
      replace: true,
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="LLM Observability"
        subtitle="Traces, sessions, users, prompts, datasets, evaluators and a live playground"
      />
      <PageTabs items={TABS} activeKey={tab} onChange={setTab} className="mb-3" />
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
