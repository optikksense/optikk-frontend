import { PageShell } from "@shared/components/ui";
import { ROUTES } from "@shared/constants/routes";
import { useRouterState } from "@tanstack/react-router";

import { LlmHubShell } from "../components/LlmHubShell";
import LlmDatasetsView from "../views/LlmDatasetsView";
import LlmGenerationsView from "../views/LlmGenerationsView";
import LlmOverviewView from "../views/LlmOverviewView";
import LlmPromptsView from "../views/LlmPromptsView";
import LlmScoresView from "../views/LlmScoresView";
import LlmSessionsView from "../views/LlmSessionsView";
import LlmSettingsView from "../views/LlmSettingsView";
import LlmTracesView from "../views/LlmTracesView";

function matchSection(pathname: string): string {
  if (pathname === ROUTES.llmGenerations || pathname.startsWith(`${ROUTES.llmGenerations}/`)) {
    return "generations";
  }
  if (pathname === ROUTES.llmTraces || pathname.startsWith(`${ROUTES.llmTraces}/`)) {
    return "traces";
  }
  if (pathname === ROUTES.llmSessions || pathname.startsWith(`${ROUTES.llmSessions}/`)) {
    return "sessions";
  }
  if (pathname === ROUTES.llmScores || pathname.startsWith(`${ROUTES.llmScores}/`)) {
    return "scores";
  }
  if (pathname === ROUTES.llmPrompts || pathname.startsWith(`${ROUTES.llmPrompts}/`)) {
    return "prompts";
  }
  if (pathname === ROUTES.llmDatasets || pathname.startsWith(`${ROUTES.llmDatasets}/`)) {
    return "datasets";
  }
  if (pathname === ROUTES.llmSettings || pathname.startsWith(`${ROUTES.llmSettings}/`)) {
    return "settings";
  }
  return "overview";
}

export default function LlmHubPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const section = matchSection(pathname);

  return (
    <PageShell className="w-full max-w-none">
      <LlmHubShell>
        {section === "overview" ? <LlmOverviewView /> : null}
        {section === "generations" ? <LlmGenerationsView /> : null}
        {section === "traces" ? <LlmTracesView /> : null}
        {section === "sessions" ? <LlmSessionsView /> : null}
        {section === "scores" ? <LlmScoresView /> : null}
        {section === "prompts" ? <LlmPromptsView /> : null}
        {section === "datasets" ? <LlmDatasetsView /> : null}
        {section === "settings" ? <LlmSettingsView /> : null}
      </LlmHubShell>
    </PageShell>
  );
}
