import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import toast from "react-hot-toast";

import { Badge, Button } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";

import { aiExperimentsApi } from "../../api/aiExperimentsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";

export default function AiExperimentDetailPage(): JSX.Element {
  const { experimentId = "" } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const experimentQuery = useQuery(aiPlatformQueries.experiment(experimentId));
  const variantsQuery = useQuery(aiPlatformQueries.experimentVariants(experimentId));
  const runsQuery = useQuery(aiPlatformQueries.experimentRuns(experimentId));
  const experiment = experimentQuery.data;
  const variants = variantsQuery.data ?? [];
  const runs = runsQuery.data ?? [];

  const launchExperimentMutation = useMutation({
    mutationFn: () => aiExperimentsApi.launch(experimentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.experimentRuns(experimentId) });
      toast.success("Experiment run queued");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to queue experiment run");
    },
  });

  return (
    <AiWorkspaceLayout
      title={experiment?.name ?? "Experiment detail"}
      subtitle="Compare prompt variants, inspect winner selection, and keep the right-drawer workflow available at every step."
      icon={<FlaskConical size={24} />}
      actions={experiment ? <Badge variant="info">{experiment.status}</Badge> : null}
    >
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.2fr]">
        <div className="grid gap-4">
          <PageSurface padding="lg">
            <div className="font-semibold text-[16px] text-[var(--text-primary)]">Experiment metadata</div>
            {experiment ? (
              <div className="mt-4 grid gap-3">
                {[
                  ["Dataset", experiment.datasetId],
                  ["Created", formatTimestamp(experiment.createdAt)],
                  ["Updated", formatTimestamp(experiment.updatedAt)],
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
                <Button type="button" onClick={() => launchExperimentMutation.mutate()} loading={launchExperimentMutation.isPending}>
                  Queue experiment run
                </Button>
              </div>
            ) : null}
          </PageSurface>

          <PageSurface padding="lg">
            <div className="font-semibold text-[16px] text-[var(--text-primary)]">Variants</div>
            <div className="mt-4 space-y-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-[var(--text-primary)]">{variant.label}</div>
                    <Badge variant="default">{variant.weight}x weight</Badge>
                  </div>
                  <div className="mt-2 text-[12px] text-[var(--text-muted)]">
                    Prompt version {variant.promptVersionId}
                  </div>
                </div>
              ))}
            </div>
          </PageSurface>
        </div>

        <PageSurface padding="lg">
          <div className="mb-4 font-semibold text-[16px] text-[var(--text-primary)]">Experiment runs</div>
          <div className="space-y-3">
            {runs.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() =>
                  navigate({
                    to:
                      location.pathname +
                      buildAiDrawerSearch(location.search, "experiment-run", run.id, {
                        title: run.id,
                        data: run as unknown as Record<string, unknown>,
                      }),
                  })
                }
                className="w-full rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--text-primary)]">{run.id}</div>
                  <Badge variant={run.status === "completed" ? "success" : "warning"}>
                    {run.status}
                  </Badge>
                </div>
                <div className="mt-2 text-[12px] text-[var(--text-muted)]">
                  Winner: {run.winnerVariantId || "Pending"}
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-secondary)]">
                  {JSON.stringify(run.summary, null, 2)}
                </pre>
              </button>
            ))}
            {runs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border-color)] px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">
                Queue an experiment run to compare variants.
              </div>
            ) : null}
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
