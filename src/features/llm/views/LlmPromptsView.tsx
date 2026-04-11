import { FileCode2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Card, Modal } from "@/components/ui";
import { useTeamId } from "@app/store/appStore";
import { ROUTES } from "@shared/constants/routes";
import { encodeStructuredFiltersParam } from "@shared/hooks/useURLFilters";
import { formatNumber, formatRelativeTime } from "@shared/utils/formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { type LlmHubPrompt, llmHubApi } from "../api/llmHubApi";
import { useLlmExplorer } from "../hooks/useLlmExplorer";

export default function LlmPromptsView() {
  const teamId = useTeamId();
  const queryClient = useQueryClient();
  const { isLoading: explorerLoading, facets } = useLlmExplorer();

  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<LlmHubPrompt | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBody, setEditBody] = useState("");

  const promptsQuery = useQuery({
    queryKey: ["llm", "hub", "prompts", teamId],
    queryFn: () => llmHubApi.listPrompts(),
    enabled: Boolean(teamId),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: llmHubApi.createPrompt,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "prompts"] });
      toast.success("Prompt created");
      setSlug("");
      setDisplayName("");
      setBody("");
    },
    onError: (e: Error) => toast.error(e.message || "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: { display_name?: string; body?: string } }) =>
      llmHubApi.updatePrompt(id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "prompts"] });
      toast.success("Prompt updated");
      setEditOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: llmHubApi.deletePrompt,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "prompts"] });
      toast.success("Prompt deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Delete failed"),
  });

  const facetRows = useMemo(
    () =>
      [...facets.prompt_template].sort((a, b) =>
        b.count !== a.count ? b.count - a.count : a.value.localeCompare(b.value)
      ),
    [facets.prompt_template]
  );

  const registryRows = useMemo(
    () => promptsQuery.data?.results ?? [],
    [promptsQuery.data?.results]
  );

  return (
    <div className="space-y-6">
      {!teamId ? (
        <Card
          padding="md"
          className="border border-[var(--border-color)] text-[13px] text-[var(--color-error)]"
        >
          Select a team to use the prompt registry.
        </Card>
      ) : null}

      <Card padding="lg" className="border border-[var(--border-color)]">
        <h2 className="font-semibold text-[15px] text-[var(--text-primary)]">Prompt registry</h2>
        <p className="mt-2 text-[13px] text-[var(--text-muted)] leading-relaxed">
          Team-scoped prompt templates stored on the server. Use a URL-safe slug; the body is
          free-form text (for documentation or future wiring to eval jobs).
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!teamId) {
              toast.error("Select a team first.");
              return;
            }
            createMutation.mutate({
              slug: slug.trim(),
              display_name: displayName.trim(),
              body: body.trim(),
            });
          }}
        >
          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-[140px] flex-1 flex-col gap-1">
              <span className="text-[11px] text-[var(--text-muted)]">Slug</span>
              <input
                required
                className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
                value={slug}
                onChange={(ev) => setSlug(ev.target.value)}
                placeholder="support-reply-v2"
              />
            </label>
            <label className="flex min-w-[180px] flex-1 flex-col gap-1">
              <span className="text-[11px] text-[var(--text-muted)]">Display name</span>
              <input
                required
                className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[12px] text-[var(--text-primary)]"
                value={displayName}
                onChange={(ev) => setDisplayName(ev.target.value)}
                placeholder="Support reply"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Body</span>
            <textarea
              required
              rows={5}
              className="resize-y rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-2 font-mono text-[12px] text-[var(--text-primary)]"
              value={body}
              onChange={(ev) => setBody(ev.target.value)}
              placeholder="System + user template…"
            />
          </label>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            disabled={createMutation.isPending || !teamId}
          >
            {createMutation.isPending ? "Creating…" : "Add prompt"}
          </Button>
        </form>
      </Card>

      {promptsQuery.isError ? (
        <div className="rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)] text-sm">
          Failed to load prompt registry.
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="font-medium text-[13px] text-[var(--text-primary)]">Registered prompts</div>
        {registryRows.length === 0 && !promptsQuery.isLoading ? (
          <Card
            padding="lg"
            className="border border-[var(--border-color)] text-[13px] text-[var(--text-muted)]"
          >
            No prompts yet. Create one above.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-[var(--card-radius)] border border-[var(--border-color)]">
            <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-[var(--border-color)] border-b bg-[var(--bg-tertiary)] text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
                  <th className="px-3 py-2 font-medium">Slug</th>
                  <th className="px-3 py-2 font-medium">Display name</th>
                  <th className="px-3 py-2 font-medium">Version</th>
                  <th className="px-3 py-2 font-medium">Updated</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {promptsQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-[var(--text-muted)]">
                      Loading…
                    </td>
                  </tr>
                ) : (
                  registryRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-[var(--border-color)] border-b last:border-0"
                    >
                      <td className="px-3 py-2 font-mono text-[11px] text-[var(--text-primary)]">
                        {row.slug}
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-2 text-[var(--text-primary)]">
                        {row.display_name}
                      </td>
                      <td className="px-3 py-2 font-mono text-[var(--text-secondary)]">
                        {row.version}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[var(--text-muted)]">
                        {formatRelativeTime(String(row.updated_at ?? row.created_at))}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Pencil size={14} />}
                            onClick={() => {
                              setEditing(row);
                              setEditDisplayName(row.display_name);
                              setEditBody(row.body);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            onClick={() => {
                              if (!window.confirm(`Delete prompt “${row.slug}”?`)) return;
                              deleteMutation.mutate(row.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <FileCode2 size={16} className="text-[var(--text-muted)]" />
          Telemetry: prompt templates in range
          {explorerLoading ? (
            <Badge variant="default" className="text-[10px]">
              Loading…
            </Badge>
          ) : null}
        </div>
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          Counts from <span className="font-mono">gen_ai.prompt.template.name</span> on spans
          (OpenTelemetry). Click through to Generations with that facet applied.
        </p>

        {facetRows.length === 0 && !explorerLoading ? (
          <Card
            padding="lg"
            className="border border-[var(--border-color)] text-[13px] text-[var(--text-muted)]"
          >
            No prompt template facet data in this time range.
          </Card>
        ) : (
          <div className="space-y-2">
            {facetRows.map((r) => {
              const filters = encodeStructuredFiltersParam([
                { field: "prompt", operator: "equals", value: r.value },
              ]);
              return (
                <Card
                  key={r.value}
                  padding="md"
                  className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border-color)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[12px] text-[var(--text-primary)]">
                      {r.value || "(empty)"}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {formatNumber(r.count)} generations
                    </div>
                  </div>
                  <Link
                    to={ROUTES.llmGenerations}
                    search={filters ? { filters } : {}}
                    className="shrink-0 font-medium text-[12px] text-[var(--color-primary)] hover:underline"
                  >
                    View in Generations
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        title={editing ? `Edit “${editing.slug}”` : "Edit prompt"}
        width={560}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Save size={14} />}
              disabled={!editing || updateMutation.isPending}
              onClick={() => {
                if (!editing) return;
                const patch: { display_name?: string; body?: string } = {};
                if (editDisplayName.trim() !== editing.display_name) {
                  patch.display_name = editDisplayName.trim();
                }
                if (editBody.trim() !== editing.body) {
                  patch.body = editBody.trim();
                }
                if (Object.keys(patch).length === 0) {
                  toast.success("No changes");
                  setEditOpen(false);
                  return;
                }
                updateMutation.mutate({ id: editing.id, patch });
              }}
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Display name</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[12px] text-[var(--text-primary)]"
              value={editDisplayName}
              onChange={(ev) => setEditDisplayName(ev.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Body</span>
            <textarea
              rows={8}
              className="resize-y rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-2 font-mono text-[12px] text-[var(--text-primary)]"
              value={editBody}
              onChange={(ev) => setEditBody(ev.target.value)}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
