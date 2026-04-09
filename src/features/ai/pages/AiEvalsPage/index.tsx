import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input, Select } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";

import { ROUTES } from "@/shared/constants/routes";

import { aiEvalsApi } from "../../api/aiEvalsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";

export default function AiEvalsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const evalsQuery = useQuery(aiPlatformQueries.evals());
  const promptsQuery = useQuery(aiPlatformQueries.prompts());
  const datasetsQuery = useQuery(aiPlatformQueries.datasets());
  const evals = evalsQuery.data ?? [];
  const prompts = promptsQuery.data ?? [];
  const datasets = datasetsQuery.data ?? [];
  const [form, setForm] = useState({
    name: "",
    description: "",
    promptId: "",
    datasetId: "",
    judgeModel: "gpt-4.1-mini",
    status: "draft",
  });

  const promptOptions = useMemo(
    () => prompts.map((prompt) => ({ label: prompt.name, value: prompt.id })),
    [prompts]
  );
  const datasetOptions = useMemo(
    () => datasets.map((dataset) => ({ label: dataset.name, value: dataset.id })),
    [datasets]
  );

  const createEvalMutation = useMutation({
    mutationFn: () =>
      aiEvalsApi.create({
        ...form,
        status: form.status as "draft" | "active" | "paused",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.evals });
      toast.success("Evaluation suite created");
      setForm((current) => ({ ...current, name: "", description: "" }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create evaluation suite");
    },
  });

  return (
    <AiWorkspaceLayout
      title="Evaluations"
      subtitle="Track evaluation suites, queue runs, and close the loop between prompts, datasets, and scoring."
      icon={<MessageSquare size={24} />}
      actions={<Badge variant="info">{evals.length} suites</Badge>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <PageSurface padding="lg">
          <div className="mb-4 font-semibold text-[16px] text-[var(--text-primary)]">Evaluation suites</div>
          <div className="space-y-2">
            {evals.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() =>
                    navigate({
                      to:
                        location.pathname +
                        buildAiDrawerSearch(location.search, "eval", entry.id, {
                          title: entry.name,
                          data: entry as unknown as Record<string, unknown>,
                        }),
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[15px] text-[var(--text-primary)]">
                      {entry.name}
                    </div>
                    <Badge variant={entry.status === "active" ? "success" : "default"}>
                      {entry.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-[13px] text-[var(--text-secondary)]">
                    {entry.description || "No description provided."}
                  </div>
                </button>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate({
                        to: ROUTES.aiEvalDetail.replace("$evalId", encodeURIComponent(entry.id)) as any,
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
          <div className="font-semibold text-[16px] text-[var(--text-primary)]">Create suite</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Bind a prompt to a dataset and define the evaluation lane used for scoring.
          </div>
          <div className="mt-4 grid gap-3">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Evaluation name" />
            <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            <Select value={form.promptId} onChange={(value: string) => setForm({ ...form, promptId: value })} options={promptOptions} placeholder="Select prompt" />
            <Select value={form.datasetId} onChange={(value: string) => setForm({ ...form, datasetId: value })} options={datasetOptions} placeholder="Select dataset" />
            <Input
              value={form.judgeModel}
              onChange={(event) => setForm({ ...form, judgeModel: event.target.value })}
              placeholder="Judge model"
            />
            <Select
              value={form.status}
              onChange={(value: string) => setForm({ ...form, status: value })}
              options={[
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
                { label: "Paused", value: "paused" },
              ]}
            />
            <Button type="button" onClick={() => createEvalMutation.mutate()} loading={createEvalMutation.isPending}>
              Create evaluation suite
            </Button>
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
