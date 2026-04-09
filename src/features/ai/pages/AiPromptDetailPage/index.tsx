import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Input } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";

import { aiPromptsApi } from "../../api/aiPromptsApi";
import { aiPlatformKeys, aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { csvToList } from "../../utils/platformUtils";

export default function AiPromptDetailPage(): JSX.Element {
  const { promptId = "" } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const promptQuery = useQuery(aiPlatformQueries.prompt(promptId));
  const versionsQuery = useQuery(aiPlatformQueries.promptVersions(promptId));
  const prompt = promptQuery.data;
  const versions = versionsQuery.data ?? [];

  const [form, setForm] = useState({
    changelog: "",
    systemPrompt: "",
    userTemplate: "",
    variables: "input",
  });

  useEffect(() => {
    if (!prompt) return;
    setForm((current) => ({
      ...current,
      systemPrompt: prompt.systemPrompt,
      userTemplate: prompt.userTemplate,
    }));
  }, [prompt]);

  const createVersionMutation = useMutation({
    mutationFn: () =>
      aiPromptsApi.createVersion(promptId, {
        changelog: form.changelog,
        systemPrompt: form.systemPrompt,
        userTemplate: form.userTemplate,
        variables: csvToList(form.variables),
        activate: true,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: aiPlatformKeys.prompt(promptId) }),
        queryClient.invalidateQueries({ queryKey: aiPlatformKeys.promptVersions(promptId) }),
        queryClient.invalidateQueries({ queryKey: aiPlatformKeys.prompts }),
      ]);
      toast.success("Prompt version created");
      setForm((current) => ({ ...current, changelog: "" }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create version");
    },
  });

  return (
    <AiWorkspaceLayout
      title={prompt?.name ?? "Prompt detail"}
      subtitle="Inspect prompt lineage, review the current template, and cut a new version without leaving the AI workspace."
      icon={<ScrollText size={24} />}
      actions={prompt ? <Badge variant="info">v{prompt.latestVersion}</Badge> : null}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[16px] text-[var(--text-primary)]">Prompt metadata</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Core configuration for the live prompt template.
              </div>
            </div>
          </div>
          {prompt ? (
            <div className="grid gap-3">
              {[
                ["Provider", prompt.modelProvider],
                ["Model", prompt.modelName],
                ["Slug", prompt.slug],
                ["Updated", formatTimestamp(prompt.updatedAt)],
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
              <div className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Description
                </div>
                <div className="mt-1 text-[13px] text-[var(--text-primary)]">
                  {prompt.description || "No description provided."}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Current prompt
                </div>
                <div className="mt-3 grid gap-3">
                  <div>
                    <div className="mb-2 text-[12px] font-medium text-[var(--text-primary)]">System</div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-secondary)]">
                      {prompt.systemPrompt}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 text-[12px] font-medium text-[var(--text-primary)]">User template</div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-secondary)]">
                      {prompt.userTemplate}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </PageSurface>

        <div className="grid gap-4">
          <PageSurface padding="lg">
            <div className="font-semibold text-[16px] text-[var(--text-primary)]">Version history</div>
            <div className="mt-1 text-[12px] text-[var(--text-muted)]">
              Track active versions and the edits that changed prompt behavior.
            </div>
            <div className="mt-4 space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={version.isActive ? "success" : "default"}>
                        v{version.versionNumber}
                      </Badge>
                      {version.isActive ? <Badge variant="info">Active</Badge> : null}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {formatTimestamp(version.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3 text-[13px] text-[var(--text-secondary)]">
                    {version.changelog || "No changelog provided."}
                  </div>
                </div>
              ))}
            </div>
          </PageSurface>

          <PageSurface padding="lg">
            <div className="font-semibold text-[16px] text-[var(--text-primary)]">Create version</div>
            <div className="mt-1 text-[12px] text-[var(--text-muted)]">
              Branch the current prompt, document the change, and activate it for downstream evals.
            </div>
            <div className="mt-4 grid gap-3">
              <Input
                value={form.changelog}
                onChange={(event) => setForm({ ...form, changelog: event.target.value })}
                placeholder="What changed?"
              />
              <textarea
                value={form.systemPrompt}
                onChange={(event) => setForm({ ...form, systemPrompt: event.target.value })}
                className="min-h-[120px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-3 text-[13px] text-[var(--text-primary)] outline-none"
              />
              <textarea
                value={form.userTemplate}
                onChange={(event) => setForm({ ...form, userTemplate: event.target.value })}
                className="min-h-[120px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-3 text-[13px] text-[var(--text-primary)] outline-none"
              />
              <Input
                value={form.variables}
                onChange={(event) => setForm({ ...form, variables: event.target.value })}
                placeholder="input, customerTier, locale"
              />
              <Button type="button" onClick={() => createVersionMutation.mutate()} loading={createVersionMutation.isPending}>
                Create version
              </Button>
            </div>
          </PageSurface>
        </div>
      </div>
    </AiWorkspaceLayout>
  );
}
