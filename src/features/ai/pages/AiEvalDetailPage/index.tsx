import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Select } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatNumber, formatTimestamp } from "@shared/utils/formatters";

import { aiEvalsApi } from "../../api/aiEvalsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";

export default function AiEvalDetailPage(): JSX.Element {
  const { evalId = "" } = useParams({ strict: false });
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const evalQuery = useQuery(aiPlatformQueries.eval(evalId));
  const runsQuery = useQuery(aiPlatformQueries.evalRuns(evalId));
  const promptsQuery = useQuery(aiPlatformQueries.prompts());
  const datasetsQuery = useQuery(aiPlatformQueries.datasets());
  const evalSuite = evalQuery.data;
  const runs = runsQuery.data ?? [];
  const prompts = promptsQuery.data ?? [];
  const datasets = datasetsQuery.data ?? [];

  const versionsQuery = useQuery(
    aiPlatformQueries.promptVersions(evalSuite?.promptId ?? "")
  );
  const versions = versionsQuery.data ?? [];
  const [selectedPromptVersionId, setSelectedPromptVersionId] = useState("");
  const [selectedRunId, setSelectedRunId] = useState("");

  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? runs[0];
  const scoresQuery = useQuery(
    aiPlatformQueries.evalScores(evalId, selectedRun?.id ?? "")
  );
  const scores = scoresQuery.data ?? [];

  const activePromptVersionId = useMemo(() => {
    return versions.find((version) => version.isActive)?.id ?? versions[0]?.id ?? "";
  }, [versions]);

  const launchEvalMutation = useMutation({
    mutationFn: () =>
      aiEvalsApi.launch(evalId, {
        promptVersionId: selectedPromptVersionId || activePromptVersionId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.evalRuns(evalId) });
      toast.success("Evaluation run queued");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to queue evaluation run");
    },
  });

  return (
    <AiWorkspaceLayout
      title={evalSuite?.name ?? "Evaluation detail"}
      subtitle="Launch evaluation runs, inspect scorecards, and connect prompt versions to dataset performance."
      icon={<MessageSquare size={24} />}
      actions={evalSuite ? <Badge variant="info">{evalSuite.status}</Badge> : null}
    >
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.2fr]">
        <div className="grid gap-4">
          <PageSurface padding="lg">
            <div className="font-semibold text-[16px] text-[var(--text-primary)]">Suite metadata</div>
            {evalSuite ? (
              <div className="mt-4 grid gap-3">
                {[
                  ["Prompt", prompts.find((prompt) => prompt.id === evalSuite.promptId)?.name ?? evalSuite.promptId],
                  ["Dataset", datasets.find((dataset) => dataset.id === evalSuite.datasetId)?.name ?? evalSuite.datasetId],
                  ["Judge model", evalSuite.judgeModel],
                  ["Created", formatTimestamp(evalSuite.createdAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      {label}
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-primary)]">{value}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </PageSurface>

          <PageSurface padding="lg">
            <div className="font-semibold text-[16px] text-[var(--text-primary)]">Launch run</div>
            <div className="mt-1 text-[12px] text-[var(--text-muted)]">
              Pick a prompt version and queue a new evaluation pass.
            </div>
            <div className="mt-4 grid gap-3">
              <Select
                value={selectedPromptVersionId || activePromptVersionId}
                onChange={(value: string) => setSelectedPromptVersionId(value)}
                options={versions.map((version) => ({
                  label: `v${version.versionNumber}${version.isActive ? " (active)" : ""}`,
                  value: version.id,
                }))}
                placeholder="Select prompt version"
              />
              <Button type="button" onClick={() => launchEvalMutation.mutate()} loading={launchEvalMutation.isPending}>
                Queue evaluation run
              </Button>
            </div>
          </PageSurface>
        </div>

        <div className="grid gap-4">
          <PageSurface padding="lg">
            <div className="mb-4 font-semibold text-[16px] text-[var(--text-primary)]">Evaluation runs</div>
            <div className="space-y-2">
              {runs.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  className="grid w-full grid-cols-[1.3fr_90px_90px_120px] gap-3 rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3 text-left"
                  onClick={() => {
                    setSelectedRunId(run.id);
                    navigate({
                      to:
                        location.pathname +
                        buildAiDrawerSearch(location.search, "eval-run", run.id, {
                          title: run.id,
                          data: run as unknown as Record<string, unknown>,
                        }),
                    });
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[var(--text-primary)]">{run.id}</span>
                    <span className="block text-[12px] text-[var(--text-muted)]">
                      {run.status} · {run.completedCases}/{run.totalCases} cases
                    </span>
                  </span>
                  <span className="font-mono text-[12px] text-[var(--text-primary)]">
                    {(run.passRate * 100).toFixed(1)}%
                  </span>
                  <span className="font-mono text-[12px] text-[var(--text-primary)]">
                    {run.averageScore.toFixed(2)}
                  </span>
                  <span className="text-[12px] text-[var(--text-muted)]">
                    {formatTimestamp(run.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          </PageSurface>

          <PageSurface padding="lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="font-semibold text-[16px] text-[var(--text-primary)]">Score breakdown</div>
              {selectedRun ? <Badge variant="info">{selectedRun.status}</Badge> : null}
            </div>
            <div className="space-y-2">
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-[var(--text-primary)]">{score.datasetItemId}</span>
                    <span className="font-mono text-[12px] text-[var(--text-primary)]">
                      {formatNumber(score.score)}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] text-[var(--text-secondary)]">{score.reason}</div>
                </div>
              ))}
              {scores.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border-color)] px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">
                  Queue or select a run to view score details.
                </div>
              ) : null}
            </div>
          </PageSurface>
        </div>
      </div>
    </AiWorkspaceLayout>
  );
}
