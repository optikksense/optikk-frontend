import { Plus, Save } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Card } from "@/components/ui";
import { useTeamId } from "@app/store/appStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { type LlmHubPricingOverrides, llmHubApi } from "../api/llmHubApi";
import {
  type LlmPricingOverrideRow,
  loadLlmPricingOverrides,
  saveLlmPricingOverrides,
} from "../utils/llmPricingStorage";

type Row = { id: string; modelKey: string; inputPer1K: string; outputPer1K: string };

function rowsFromOverrides(overrides: Record<string, LlmPricingOverrideRow>): Row[] {
  return Object.entries(overrides).map(([modelKey, v]) => ({
    id: crypto.randomUUID(),
    modelKey,
    inputPer1K: String(v.inputPer1K),
    outputPer1K: String(v.outputPer1K),
  }));
}

function overridesFromRows(rows: Row[]): LlmHubPricingOverrides {
  const out: LlmHubPricingOverrides = {};
  for (const r of rows) {
    const key = r.modelKey.trim().toLowerCase();
    if (!key) continue;
    const input = Number(r.inputPer1K);
    const output = Number(r.outputPer1K);
    if (!Number.isFinite(input) || !Number.isFinite(output) || input < 0 || output < 0) {
      throw new Error(`Invalid numbers for model "${r.modelKey}".`);
    }
    out[key] = { inputPer1K: input, outputPer1K: output };
  }
  return out;
}

export default function LlmSettingsView() {
  const teamId = useTeamId();
  const queryClient = useQueryClient();
  const formId = useId();
  const [rows, setRows] = useState<Row[]>([]);

  const settingsQuery = useQuery({
    queryKey: ["llm", "hub", "settings", teamId],
    queryFn: () => llmHubApi.getSettings(),
    enabled: Boolean(teamId),
    staleTime: 60_000,
  });

  const mergedOverrides = useMemo(() => {
    if (teamId == null) return {};
    const local = loadLlmPricingOverrides(teamId);
    const server = settingsQuery.data?.pricing_overrides ?? {};
    return { ...local, ...server } as Record<string, LlmPricingOverrideRow>;
  }, [teamId, settingsQuery.data?.pricing_overrides]);

  useEffect(() => {
    if (teamId == null) {
      setRows([]);
      return;
    }
    if (!settingsQuery.isSuccess) return;
    const next = rowsFromOverrides(mergedOverrides);
    setRows(next.length > 0 ? next : []);
  }, [teamId, mergedOverrides, settingsQuery.isSuccess]);

  const persist = useCallback(async () => {
    if (teamId == null) {
      toast.error("Select a team to save pricing overrides.");
      return;
    }
    let out: LlmHubPricingOverrides;
    try {
      out = overridesFromRows(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid overrides");
      return;
    }
    try {
      await llmHubApi.patchSettings(out);
      saveLlmPricingOverrides(teamId, out);
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "settings"] });
      await queryClient.invalidateQueries({ queryKey: ["llm"] });
      toast.success("Saved pricing overrides (server + this browser).");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }, [queryClient, rows, teamId]);

  return (
    <div className="space-y-4">
      <Card padding="lg" className="border border-[var(--border-color)]">
        <h2 className="font-semibold text-[15px] text-[var(--text-primary)]">
          Model pricing overrides
        </h2>
        <p className="mt-2 text-[13px] text-[var(--text-muted)] leading-relaxed">
          Per-team USD per 1K tokens. Values are saved to the API for your team and mirrored to{" "}
          <span className="font-mono">localStorage</span> so offline estimates stay aligned. Server
          values take precedence over older browser-only rows when both exist.
        </p>

        {settingsQuery.isError ? (
          <p className="mt-3 text-[13px] text-[var(--color-error)]">
            Could not load server settings. You can still edit rows; saving will retry the API.
          </p>
        ) : null}

        {teamId == null ? (
          <p className="mt-4 text-[13px] text-[var(--color-error)]">No team selected.</p>
        ) : (
          <form
            id={formId}
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void persist();
            }}
          >
            {rows.map((row, index) => (
              <div key={row.id} className="flex flex-wrap items-end gap-2">
                <label className="flex min-w-[180px] flex-1 flex-col gap-1">
                  <span className="text-[11px] text-[var(--text-muted)]">Model key</span>
                  <input
                    className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
                    value={row.modelKey}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, modelKey: v } : r))
                      );
                    }}
                    placeholder="gpt-4o"
                  />
                </label>
                <label className="flex w-[120px] flex-col gap-1">
                  <span className="text-[11px] text-[var(--text-muted)]">Input / 1K</span>
                  <input
                    type="number"
                    step="0.000001"
                    min={0}
                    className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
                    value={row.inputPer1K}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, inputPer1K: v } : r))
                      );
                    }}
                  />
                </label>
                <label className="flex w-[120px] flex-col gap-1">
                  <span className="text-[11px] text-[var(--text-muted)]">Output / 1K</span>
                  <input
                    type="number"
                    step="0.000001"
                    min={0}
                    className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
                    value={row.outputPer1K}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, outputPer1K: v } : r))
                      );
                    }}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="Remove row"
                >
                  Remove
                </Button>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() =>
                  setRows((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      modelKey: "",
                      inputPer1K: "0",
                      outputPer1K: "0",
                    },
                  ])
                }
              >
                Add row
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<Save size={14} />}
                disabled={settingsQuery.isLoading}
              >
                Save overrides
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
