import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import { aiPromptsApi } from "../../api/aiPromptsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";
import { csvToList } from "../../utils/platformUtils";

export default function AiPromptsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const promptsQuery = useQuery(aiPlatformQueries.prompts());
  const prompts = promptsQuery.data ?? [];

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    modelProvider: "openai",
    modelName: "gpt-4.1-mini",
    systemPrompt: "You are a precise assistant focused on quality and safety.",
    userTemplate: "{{input}}",
    tags: "production,core",
  });

  const createPromptMutation = useMutation({
    mutationFn: () =>
      aiPromptsApi.create({
        ...form,
        tags: csvToList(form.tags),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiPlatformKeys.prompts });
      toast.success("Prompt created");
      setForm((current) => ({ ...current, name: "", slug: "", description: "" }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create prompt");
    },
  });

  return (
    <AiWorkspaceLayout
      title="Prompts"
      subtitle="Version prompt templates, inspect lineage, and launch downstream evaluations from a frontend-owned AI surface."
      icon={<ScrollText size={24} />}
      actions={<Badge variant="info">{prompts.length} prompts</Badge>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[16px] text-[var(--text-primary)]">Prompt library</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Click a prompt for a fast drawer inspection, or open the full detail page to manage versions.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() =>
                    navigate({
                      to:
                        location.pathname +
                        buildAiDrawerSearch(location.search, "prompt", prompt.id, {
                          title: prompt.name,
                          data: prompt as unknown as Record<string, unknown>,
                        }),
                    })
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[15px] text-[var(--text-primary)]">
                        {prompt.name}
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                        {prompt.modelProvider} / {prompt.modelName}
                      </div>
                    </div>
                    <Badge variant="default">v{prompt.latestVersion}</Badge>
                  </div>
                  <div className="mt-3 text-[13px] text-[var(--text-secondary)]">
                    {prompt.description || "No description yet."}
                  </div>
                </button>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="info">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Updated {formatTimestamp(prompt.updatedAt)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        navigate({
                          to: ROUTES.aiPromptDetail.replace("$promptId", encodeURIComponent(prompt.id)) as any,
                        })
                      }
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageSurface>

        <PageSurface padding="lg">
          <div className="font-semibold text-[16px] text-[var(--text-primary)]">Create prompt</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Ship a new prompt directly into the AI platform and make it available for evaluation and experiments.
          </div>
          <div className="mt-4 grid gap-3">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Prompt name" />
            <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="prompt-slug" />
            <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={form.modelProvider}
                onChange={(event) => setForm({ ...form, modelProvider: event.target.value })}
                placeholder="Provider"
              />
              <Input
                value={form.modelName}
                onChange={(event) => setForm({ ...form, modelName: event.target.value })}
                placeholder="Model"
              />
            </div>
            <textarea
              value={form.systemPrompt}
              onChange={(event) => setForm({ ...form, systemPrompt: event.target.value })}
              placeholder="System prompt"
              className="min-h-[140px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[rgba(124,127,242,0.5)]"
            />
            <textarea
              value={form.userTemplate}
              onChange={(event) => setForm({ ...form, userTemplate: event.target.value })}
              placeholder="User template"
              className="min-h-[140px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[rgba(124,127,242,0.5)]"
            />
            <Input
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              placeholder="tag1, tag2"
            />
            <Button type="button" onClick={() => createPromptMutation.mutate()} loading={createPromptMutation.isPending}>
              Create prompt
            </Button>
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
