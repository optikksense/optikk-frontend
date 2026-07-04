import { useState } from "react";

import type { Policy } from "../../api/notificationsApi";
import { usePolicyMutations } from "../../hooks/useNotificationMutations";
import { usePolicies } from "../../hooks/useNotifications";

interface PolicyForm {
  id: number | null;
  name: string;
  matchDsl: string;
  actionsJson: string;
  enabled: boolean;
}

function emptyForm(): PolicyForm {
  return { id: null, name: "", matchDsl: "", actionsJson: "[]", enabled: true };
}

function formFromPolicy(p: Policy): PolicyForm {
  return {
    id: p.id,
    name: p.name,
    matchDsl: p.match_dsl,
    actionsJson: JSON.stringify(p.actions, null, 2),
    enabled: p.enabled,
  };
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: { message?: string } } } };
  return e?.response?.data?.error?.message ?? fallback;
}

function parseActions(json: string): unknown[] {
  const trimmed = json.trim();
  if (trimmed === "") return [];
  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) throw new Error("Actions must be a JSON array");
  return parsed;
}

export default function PoliciesTab() {
  const q = usePolicies();
  const { create, update, remove } = usePolicyMutations();
  const policies = q.data ?? [];
  const [form, setForm] = useState<PolicyForm>(emptyForm());
  const [status, setStatus] = useState<string | null>(null);

  const editing = form.id !== null;
  const saving = create.isPending || update.isPending;

  const handleSubmit = async () => {
    setStatus(null);
    let actions: unknown[];
    try {
      actions = parseActions(form.actionsJson);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Invalid actions JSON");
      return;
    }
    const payload = {
      name: form.name,
      match_dsl: form.matchDsl,
      actions,
      enabled: form.enabled,
    };
    try {
      if (form.id !== null) {
        await update.mutateAsync({ id: form.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      setForm(emptyForm());
    } catch (err) {
      setStatus(errorMessage(err, "Failed to save policy"));
    }
  };

  const handleDelete = async (id: number) => {
    setStatus(null);
    try {
      await remove.mutateAsync(id);
      if (form.id === id) setForm(emptyForm());
    } catch (err) {
      setStatus(errorMessage(err, "Failed to delete policy"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="font-medium text-sm">{editing ? "Edit policy" : "Create policy"}</div>
        <div className="mt-3 grid gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Policy name (e.g. Page on-call for P1 payments)"
            className="rounded border border-border bg-card px-2 py-1.5 text-xs"
          />
          <input
            value={form.matchDsl}
            onChange={(e) => setForm((f) => ({ ...f, matchDsl: e.target.value }))}
            placeholder="Match DSL (e.g. priority:P1 AND tenant:payments)"
            className="rounded border border-border bg-card px-2 py-1.5 font-mono text-xs"
          />
          <textarea
            value={form.actionsJson}
            onChange={(e) => setForm((f) => ({ ...f, actionsJson: e.target.value }))}
            rows={3}
            placeholder='Actions (JSON array, e.g. [{"channel_id": 1}])'
            className="rounded border border-border bg-card px-2 py-1.5 font-mono text-xs"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-foreground-secondary text-xs">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
              Enabled
            </label>
            <div className="ml-auto flex items-center gap-1.5">
              {editing && (
                <button
                  type="button"
                  onClick={() => setForm(emptyForm())}
                  className="rounded border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="rounded bg-primary px-3 py-1.5 font-medium text-white text-xs hover:bg-primary disabled:opacity-60"
              >
                {editing ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
        {status && <div className="mt-2 text-warning text-xs">{status}</div>}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-border border-b px-4 py-3">
          <div>
            <div className="font-medium text-sm">Routing policies</div>
            <div className="text-[11px] text-foreground-muted">
              Rules evaluated top-down · first match wins.
            </div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="border-border border-b text-[11px] text-foreground-muted uppercase tracking-wider">
            <tr>
              <th className="py-2 pl-4 text-left font-medium">Policy</th>
              <th className="py-2 text-left font-medium">Match</th>
              <th className="py-2 text-right font-medium">Hits 30d</th>
              <th className="py-2 text-left font-medium">Enabled</th>
              <th className="py-2 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {q.isPending && !q.data ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-foreground-muted text-xs">
                  Loading…
                </td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-foreground-muted text-xs">
                  No policies yet.
                </td>
              </tr>
            ) : (
              policies.map((p, i) => (
                <tr key={p.id} className="border-border border-b last:border-0">
                  <td className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-foreground-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2 font-mono text-[11px] text-foreground-secondary">
                    {p.match_dsl}
                  </td>
                  <td className="py-2 text-right font-mono">{p.hits_30d}</td>
                  <td className="py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        p.enabled
                          ? "bg-success-subtle text-success"
                          : "bg-muted text-foreground-secondary"
                      }`}
                    >
                      {p.enabled ? "on" : "off"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => setForm(formFromPolicy(p))}
                      className="mr-1 rounded border border-border px-2 py-0.5 text-[11px] hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="rounded border border-border px-2 py-0.5 text-[11px] text-error hover:bg-secondary"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
