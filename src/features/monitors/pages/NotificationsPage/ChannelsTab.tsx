import { Send } from "lucide-react";
import { useState } from "react";

import { type Channel, type ChannelType, testChannel } from "../../api/notificationsApi";
import { useChannels } from "../../hooks/useChannels";
import { useChannelMutations } from "../../hooks/useNotificationMutations";

interface ChannelForm {
  id: number | null;
  type: ChannelType;
  name: string;
  webhookUrl: string;
}

function emptyForm(): ChannelForm {
  return { id: null, type: "slack", name: "", webhookUrl: "" };
}

function formFromChannel(ch: Channel): ChannelForm {
  return {
    id: ch.id,
    type: ch.type,
    name: ch.name,
    webhookUrl: typeof ch.config.webhook_url === "string" ? ch.config.webhook_url : "",
  };
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: { message?: string } } } };
  return e?.response?.data?.error?.message ?? fallback;
}

export default function ChannelsTab() {
  const channelsQ = useChannels();
  const { create, update, remove } = useChannelMutations();
  const [form, setForm] = useState<ChannelForm>(emptyForm());
  const [status, setStatus] = useState<string | null>(null);

  const editing = form.id !== null;

  const handleSubmit = async () => {
    setStatus(null);
    const payload = {
      type: form.type,
      name: form.name,
      config: form.type === "slack" ? { webhook_url: form.webhookUrl } : {},
    };
    try {
      if (form.id !== null) {
        await update.mutateAsync({ id: form.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      setForm(emptyForm());
    } catch (err) {
      setStatus(errorMessage(err, "Failed to save channel"));
    }
  };

  const handleDelete = async (id: number) => {
    setStatus(null);
    try {
      await remove.mutateAsync(id);
      if (form.id === id) setForm(emptyForm());
    } catch (err) {
      setStatus(errorMessage(err, "Failed to delete channel"));
    }
  };

  const handleTest = async (id: number) => {
    setStatus(null);
    try {
      const res = await testChannel(id);
      setStatus(res.ok ? "Test delivery sent." : `Test failed: ${res.error_text}`);
      channelsQ.refetch();
    } catch (err) {
      setStatus(errorMessage(err, "Failed to test channel"));
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="font-medium text-sm">{editing ? "Edit channel" : "Create channel"}</div>
        <div className="mt-3 grid grid-cols-[120px_1fr_1fr_auto] items-center gap-2">
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ChannelType }))}
            className="rounded border border-border bg-card px-2 py-1.5 text-xs"
          >
            <option value="slack">Slack</option>
            <option value="webhook">Webhook (stub)</option>
            <option value="email">Email (stub)</option>
            <option value="pagerduty">PagerDuty (stub)</option>
          </select>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Channel name (e.g. #oncall-payments)"
            className="rounded border border-border bg-card px-2 py-1.5 text-xs"
          />
          <input
            value={form.webhookUrl}
            onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
            placeholder={form.type === "slack" ? "Slack webhook URL" : "(config)"}
            className="rounded border border-border bg-card px-2 py-1.5 font-mono text-xs"
            disabled={form.type !== "slack"}
          />
          <div className="flex items-center gap-1.5">
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
        {status && <div className="mt-2 text-warning text-xs">{status}</div>}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-border border-b text-[11px] text-foreground-muted uppercase tracking-wider">
            <tr>
              <th className="py-2 pl-4 text-left font-medium">Channel</th>
              <th className="py-2 text-left font-medium">Type</th>
              <th className="py-2 text-right font-medium">Used by</th>
              <th className="py-2 text-left font-medium">Last delivery</th>
              <th className="py-2 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {channelsQ.isPending && !channelsQ.data ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-foreground-muted text-xs">
                  Loading…
                </td>
              </tr>
            ) : (channelsQ.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-foreground-muted text-xs">
                  No channels yet.
                </td>
              </tr>
            ) : (
              (channelsQ.data ?? []).map((ch) => (
                <tr key={ch.id} className="border-border border-b last:border-0">
                  <td className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Send size={13} className="text-foreground-muted" />
                      <span className="font-mono text-xs">{ch.name}</span>
                    </div>
                  </td>
                  <td className="py-2 font-bold font-mono text-[10px] uppercase">{ch.type}</td>
                  <td className="py-2 text-right font-mono">{ch.used_by_count}</td>
                  <td className="py-2 font-mono text-[11px] text-foreground-muted">
                    {ch.last_delivery_at ? new Date(ch.last_delivery_at).toLocaleString() : "—"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => setForm(formFromChannel(ch))}
                      className="mr-1 rounded border border-border px-2 py-0.5 text-[11px] hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTest(ch.id)}
                      className="mr-1 rounded border border-border px-2 py-0.5 text-[11px] hover:bg-secondary"
                    >
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ch.id)}
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
