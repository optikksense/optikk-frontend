import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import { aiDatasetsApi } from "../../api/aiDatasetsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";
import { csvToList } from "../../utils/platformUtils";

export default function AiDatasetsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const datasetsQuery = useQuery(aiPlatformQueries.datasets());
  const datasets = datasetsQuery.data ?? [];
  const [form, setForm] = useState({
    name: "",
    description: "",
    tags: "regression,production",
  });

  const createDatasetMutation = useMutation({
    mutationFn: () =>
      aiDatasetsApi.create({
        name: form.name,
        description: form.description,
        tags: csvToList(form.tags),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.datasets });
      toast.success("Dataset created");
      setForm({ name: "", description: "", tags: "regression,production" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create dataset");
    },
  });

  return (
    <AiWorkspaceLayout
      title="Datasets"
      subtitle="Manage reusable replay sets for regressions, prompt quality, safety, and experiment comparisons."
      icon={<Database size={24} />}
      actions={<Badge variant="info">{datasets.length} datasets</Badge>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <PageSurface padding="lg">
          <div className="mb-4 font-semibold text-[16px] text-[var(--text-primary)]">Dataset catalog</div>
          <div className="space-y-2">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() =>
                    navigate({
                      to:
                        location.pathname +
                        buildAiDrawerSearch(location.search, "dataset", dataset.id, {
                          title: dataset.name,
                          data: dataset as unknown as Record<string, unknown>,
                        }),
                    })
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[15px] text-[var(--text-primary)]">
                        {dataset.name}
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                        {dataset.itemCount} items · updated {formatTimestamp(dataset.updatedAt)}
                      </div>
                    </div>
                    <Badge variant="default">{dataset.itemCount} items</Badge>
                  </div>
                  <div className="mt-3 text-[13px] text-[var(--text-secondary)]">
                    {dataset.description || "No description yet."}
                  </div>
                </button>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag) => (
                      <Badge key={tag} variant="info">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate({
                        to: ROUTES.aiDatasetDetail.replace("$datasetId", encodeURIComponent(dataset.id)) as any,
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
          <div className="font-semibold text-[16px] text-[var(--text-primary)]">Create dataset</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Spin up a new replay corpus for evaluations and experiment runs.
          </div>
          <div className="mt-4 grid gap-3">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Dataset name" />
            <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            <Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="tag1, tag2" />
            <Button type="button" onClick={() => createDatasetMutation.mutate()} loading={createDatasetMutation.isPending}>
              Create dataset
            </Button>
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
