import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import { PageShell } from "@shared/components/ui";

import { createMonitor } from "../../api/monitorsApi";

import WizardConditionsStep from "./WizardConditionsStep";
import WizardDefineStep from "./WizardDefineStep";
import WizardNotifyStep from "./WizardNotifyStep";
import WizardQueryStep from "./WizardQueryStep";
import WizardTypeStep from "./WizardTypeStep";
import { useWizardState } from "./useWizardState";

export default function NewMonitorPage() {
  const navigate = useNavigate();
  const { draft, setDraft, setType } = useWizardState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const created = await createMonitor(draft);
      navigate({ to: `/monitors/${created.id}` });
    } catch (err) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message ?? "Failed to save monitor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => navigate({ to: "/monitors" })}
          className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={12} />
          Monitors
        </button>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="font-medium text-[var(--text-primary)]">New monitor</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">New monitor</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Create an alert rule · saved monitors are evaluated continuously and notify configured
          channels.
        </p>
      </div>

      <WizardTypeStep value={draft.type} onChange={setType} />
      <WizardQueryStep draft={draft} setDraft={setDraft} />
      <WizardConditionsStep draft={draft} setDraft={setDraft} />
      <WizardNotifyStep draft={draft} setDraft={setDraft} />
      <WizardDefineStep draft={draft} setDraft={setDraft} />

      <div className="sticky bottom-0 -mx-6 -mb-10 mt-4 flex items-center gap-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-3">
        <div className="text-xs text-[var(--text-muted)]">
          Monitor will be evaluated every{" "}
          <span className="font-mono">{draft.eval_every_sec}s</span>
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/monitors" })}
            className="rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Check size={13} />
            {saving ? "Saving…" : "Save monitor"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
