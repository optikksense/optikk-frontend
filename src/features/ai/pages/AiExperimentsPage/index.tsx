import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input, Select } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";

import { ROUTES } from "@/shared/constants/routes";

import { aiExperimentsApi } from "../../api/aiExperimentsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";

export default function AiExperimentsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const experimentsQuery = useQuery(aiPlatformQueries.experiments());
  const promptsQuery = useQuery(aiPlatformQueries.prompts());
  const datasetsQuery = useQuery(aiPlatformQueries.datasets());
  const experiments = experimentsQuery.data ?? [];
  const prompts = promptsQuery.data ?? [];
  const datasets = datasetsQuery.data ?? [];
  const promptOptions = useMemo(
    () =>
      prompts
        .filter((prompt) => Boolean(prompt.activeVersionId))
        .map((prompt) => ({
          label: `${prompt.name} (v${prompt.latestVersion})`,
          value: prompt.activeVersionId!,
        })),
    [prompts]
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    datasetId: "",
    variantALabel: "control",
    variantAPromptVersionId: "",
    variantBLabel: "candidate",
    variantBPromptVersionId: "",
  });

  const createExperimentMutation = useMutation({
    mutationFn: () =>
      aiExperimentsApi.create({
        name: form.name,
        description: form.description,
        datasetId: form.datasetId,
        variants: [
          { label: form.variantALabel, promptVersionId: form.variantAPromptVersionId, weight: 1 },
          { label: form.variantBLabel, promptVersionId: form.variantBPromptVersionId, weight: 1 },
        ].filter((variant) => Boolean(variant.promptVersionId)),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.experiments });
      toast.success("Experiment created");
      setForm((current) => ({ ...current, name: "", description: "" }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create experiment");
    },
  });

  return (
    <AiWorkspaceLayout
      title="Experiments"
      subtitle="Compare prompt variants, monitor queued runs, and promote winners with full drawer-driven inspection."
      icon={<FlaskConical size={24} />}
      actions={<Badge variant="info">{experiments.length} experiments</Badge>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <PageSurface padding="lg">
          <div className="mb-4 font-semibold text-[16px] text-[var(--text-primary)]">Experiment backlog</div>
          <div className="space-y-2">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() =>
                    navigate({
                      to:
                        location.pathname +
                        buildAiDrawerSearch(location.search, "experiment", experiment.id, {
                          title: experiment.name,
                          data: experiment as unknown as Record<string, unknown>,
                        }),
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[15px] text-[var(--text-primary)]">
                      {experiment.name}
                    </div>
                    <Badge variant={experiment.status === "running" ? "warning" : "default"}>
                      {experiment.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-[13px] text-[var(--text-secondary)]">
                    {experiment.description || "No description provided."}
                  </div>
                </button>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate({
                        to:
                          ROUTES.aiExperimentDetail.replace(
                            "$experimentId",
                            encodeURIComponent(experiment.id)
                          ) as any,
                      })
                    }
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PageSurface>

        <PageSurface padding="lg">
          <div className="font-semibold text-[16px] text-[var(--text-primary)]">Create experiment</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Pick a dataset and compare prompt variants head to head.
          </div>
          <div className="mt-4 grid gap-3">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Experiment name" />
            <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            <Select
              value={form.datasetId}
              onChange={(value: string) => setForm({ ...form, datasetId: value })}
              options={datasets.map((dataset) => ({ label: dataset.name, value: dataset.id }))}
              placeholder="Select dataset"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={form.variantALabel}
                onChange={(event) => setForm({ ...form, variantALabel: event.target.value })}
                placeholder="Variant A label"
              />
              <Select
                value={form.variantAPromptVersionId}
                onChange={(value: string) => setForm({ ...form, variantAPromptVersionId: value })}
                options={promptOptions}
                placeholder="Variant A prompt"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={form.variantBLabel}
                onChange={(event) => setForm({ ...form, variantBLabel: event.target.value })}
                placeholder="Variant B label"
              />
              <Select
                value={form.variantBPromptVersionId}
                onChange={(value: string) => setForm({ ...form, variantBPromptVersionId: value })}
                options={promptOptions}
                placeholder="Variant B prompt"
              />
            </div>
            <Button type="button" onClick={() => createExperimentMutation.mutate()} loading={createExperimentMutation.isPending}>
              Create experiment
            </Button>
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
