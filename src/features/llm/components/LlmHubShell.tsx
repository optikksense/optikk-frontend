import { BrainCircuit } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader, PageSurface } from "@shared/components/ui";
import { ROUTES } from "@shared/constants/routes";
import { Link, useRouterState } from "@tanstack/react-router";

const NAV_ITEMS: readonly { path: (typeof ROUTES)[keyof typeof ROUTES]; label: string }[] = [
  { path: ROUTES.llmOverview, label: "Overview" },
  { path: ROUTES.llmGenerations, label: "Generations" },
  { path: ROUTES.llmTraces, label: "Traces" },
  { path: ROUTES.llmSessions, label: "Sessions" },
  { path: ROUTES.llmScores, label: "Scores" },
  { path: ROUTES.llmPrompts, label: "Prompts" },
  { path: ROUTES.llmDatasets, label: "Datasets" },
  { path: ROUTES.llmSettings, label: "Settings" },
];

interface LlmHubShellProps {
  children: React.ReactNode;
}

export function LlmHubShell({ children }: LlmHubShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PageHeader
        title="LLM"
        icon={<BrainCircuit size={22} />}
        subtitle="Latency, tokens, cost, and errors across models and providers (GenAI spans)."
      />

      <PageSurface
        padding="sm"
        className="bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))]"
      >
        <nav
          className="inline-flex max-w-full flex-wrap gap-1 rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1"
          aria-label="LLM hub sections"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors",
                  active
                    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </PageSurface>

      <div className="min-h-0 w-full min-w-0">{children}</div>
    </div>
  );
}
