import { Send } from "lucide-react";
import { useState } from "react";

import {
  type ChannelType,
  createChannel,
  deleteChannel,
  testChannel,
} from "../../api/notificationsApi";
import { useChannels } from "../../hooks/useChannels";

interface CreateForm {
  type: ChannelType;
  name: string;
  webhookUrl: string;
}

function emptyForm(): CreateForm {
  return { type: "slack", name: "", webhookUrl: "" };
}

export default function ChannelsTab() {
  const channelsQ = useChannels();
  const [form, setForm] = useState<CreateForm>(emptyForm());
  const [status, setStatus] = useState<string | null>(null);

  const handleCreate = async () => {
    setStatus(null);
    try {
      await createChannel({
        type: form.type,
        name: form.name,
        config: form.type === "slack" ? { webhook_url: form.webhookUrl } : {},
      });
      setForm(emptyForm());
      channelsQ.refetch();
    } catch (err) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setStatus(e?.response?.data?.error?.message ?? "Failed to create channel");
    }
  };

  const handleDelete = async (id: number) => {
    setStatus(null);
    try {
      await deleteChannel(id);
      channelsQ.refetch();
    } catch (err) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setStatus(e?.response?.data?.error?.message ?? "Failed to delete channel");
    }
  };

  const handleTest = async (id: number) => {
    setStatus(null);
    try {
      const res = await testChannel(id);
      setStatus(res.ok ? "Test delivery sent." : `Test failed: ${res.error_text}`);
      channelsQ.refetch();
    } catch (err) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setStatus(e?.response?.data?.error?.message ?? "Failed to test channel");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
        <div className="text-sm font-medium">Create channel</div>
        <div className="mt-3 grid grid-cols-[120px_1fr_1fr_auto] items-center gap-2">
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ChannelType }))}
            className="rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs"
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
            className="rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs"
          />
          <input
            value={form.webhookUrl}
            onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
            placeholder={form.type === "slack" ? "Slack webhook URL" : "(config)"}
            className="rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 font-mono text-xs"
            disabled={form.type !== "slack"}
          />
          <button
            type="button"
            onClick={handleCreate}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Create
          </button>
        </div>
        {status && <div className="mt-2 text-xs text-amber-500">{status}</div>}
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border-color)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
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
                <td colSpan={5} className="py-6 text-center text-xs text-[var(--text-muted)]">
                  Loading…
                </td>
              </tr>
            ) : (channelsQ.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No channels yet.
                </td>
              </tr>
            ) : (
              (channelsQ.data ?? []).map((ch) => (
                <tr key={ch.id} className="border-b border-[var(--border-color)] last:border-0">
                  <td className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Send size={13} className="text-[var(--text-muted)]" />
                      <span className="font-mono text-xs">{ch.name}</span>
                    </div>
                  </td>
                  <td className="py-2 font-mono text-[10px] font-bold uppercase">{ch.type}</td>
                  <td className="py-2 text-right font-mono">{ch.used_by_count}</td>
                  <td className="py-2 font-mono text-[11px] text-[var(--text-muted)]">
                    {ch.last_delivery_at
                      ? new Date(ch.last_delivery_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleTest(ch.id)}
                      className="mr-1 rounded border border-[var(--border-color)] px-2 py-0.5 text-[11px] hover:bg-[var(--bg-secondary)]"
                    >
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ch.id)}
                      className="rounded border border-[var(--border-color)] px-2 py-0.5 text-[11px] text-red-400 hover:bg-[var(--bg-secondary)]"
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
