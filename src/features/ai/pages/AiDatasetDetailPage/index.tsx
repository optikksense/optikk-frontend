import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";

import { aiDatasetsApi } from "../../api/aiDatasetsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";
import { jsonPreview, safeJsonParse } from "../../utils/platformUtils";

export default function AiDatasetDetailPage(): JSX.Element {
  const { datasetId = "" } = useParams({ strict: false });
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const datasetQuery = useQuery(aiPlatformQueries.dataset(datasetId));
  const itemsQuery = useQuery(aiPlatformQueries.datasetItems(datasetId));
  const dataset = datasetQuery.data;
  const items = itemsQuery.data ?? [];
  const [form, setForm] = useState({
    input: '{\n  "input": "Explain how cache invalidation works."\n}',
    expectedOutput: "A concise explanation of cache invalidation tradeoffs.",
    metadata: '{\n  "category": "knowledge"\n}',
  });

  const createItemMutation = useMutation({
    mutationFn: () =>
      aiDatasetsApi.createItem(datasetId, {
        input: safeJsonParse(form.input),
        expectedOutput: form.expectedOutput,
        metadata: safeJsonParse(form.metadata),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.datasetItems(datasetId) });
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.dataset(datasetId) });
      toast.success("Dataset item added");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add dataset item");
    },
  });

  return (
    <AiWorkspaceLayout
      title={dataset?.name ?? "Dataset detail"}
      subtitle="Inspect dataset records, replay individual cases, and prepare evaluation-ready corpora."
      icon={<Database size={24} />}
      actions={dataset ? <Badge variant="info">{dataset.itemCount} items</Badge> : null}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.95fr]">
        <PageSurface padding="lg">
          <div className="mb-4 font-semibold text-[16px] text-[var(--text-primary)]">Dataset items</div>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() =>
                    navigate({
                      to:
                        location.pathname +
                        buildAiDrawerSearch(location.search, "dataset-item", item.id, {
                          title: item.id,
                          data: item as unknown as Record<string, unknown>,
                        }),
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-[var(--text-primary)]">{item.id}</div>
                    <Badge variant="default">Case</Badge>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-secondary)]">
                    {jsonPreview(item.input)}
                  </pre>
                  <div className="mt-3 text-[12px] text-[var(--text-muted)]">
                    Expected: {item.expectedOutput || "No expected output provided."}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </PageSurface>

        <PageSurface padding="lg">
          <div className="font-semibold text-[16px] text-[var(--text-primary)]">Add dataset item</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Add a structured case with expected output and metadata for scoring and replay.
          </div>
          <div className="mt-4 grid gap-3">
            <textarea
              value={form.input}
              onChange={(event) => setForm({ ...form, input: event.target.value })}
              className="min-h-[160px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-3 font-mono text-[12px] text-[var(--text-primary)] outline-none"
            />
            <Input
              value={form.expectedOutput}
              onChange={(event) => setForm({ ...form, expectedOutput: event.target.value })}
              placeholder="Expected output"
            />
            <textarea
              value={form.metadata}
              onChange={(event) => setForm({ ...form, metadata: event.target.value })}
              className="min-h-[120px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-3 font-mono text-[12px] text-[var(--text-primary)] outline-none"
            />
            <Button type="button" onClick={() => createItemMutation.mutate()} loading={createItemMutation.isPending}>
              Add item
            </Button>
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
