import { useNavigate } from "@tanstack/react-router";

import type { CreateMonitorPayload } from "../../api/monitorsApi";
import type { Channel } from "../../api/notificationsApi";
import { useChannels } from "../../hooks/useChannels";

import StepShell from "./StepShell";
import FieldRow from "./queryForms/FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

function isSelected(ids: number[], id: number): boolean {
  return ids.includes(id);
}

function toggle(ids: number[], id: number): number[] {
  return isSelected(ids, id) ? ids.filter((x) => x !== id) : [...ids, id];
}

function ChannelChip({
  channel,
  selected,
  onToggle,
}: {
  channel: Channel;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded border px-2.5 py-1 text-xs ${
        selected
          ? "border-blue-500 bg-blue-500/15 text-[var(--text-primary)]"
          : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
      }`}
    >
      <span className="font-mono">@{channel.name}</span>
    </button>
  );
}

export default function WizardNotifyStep({ draft, setDraft }: Props) {
  const navigate = useNavigate();
  const channelsQ = useChannels();
  const ids = draft.notify.channel_ids ?? [];

  return (
    <StepShell n={4} title="Configure notifications" sub="Who should be alerted, and how?">
      <FieldRow label="Send to">
        <div className="flex flex-wrap items-center gap-1.5">
          {channelsQ.isPending && !channelsQ.data ? (
            <span className="text-xs text-[var(--text-muted)]">Loading channels…</span>
          ) : (channelsQ.data ?? []).length === 0 ? (
            <span className="text-xs text-[var(--text-muted)]">
              No channels yet —{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/monitors/notifications" })}
                className="text-blue-400 underline"
              >
                add one
              </button>
              .
            </span>
          ) : (
            (channelsQ.data ?? []).map((ch) => (
              <ChannelChip
                key={ch.id}
                channel={ch}
                selected={isSelected(ids, ch.id)}
                onToggle={() =>
                  setDraft((prev) => ({
                    ...prev,
                    notify: { channel_ids: toggle(prev.notify.channel_ids ?? [], ch.id) },
                  }))
                }
              />
            ))
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/monitors/notifications" })}
            className="ml-2 text-[11px] text-blue-400 underline"
          >
            manage channels →
          </button>
        </div>
      </FieldRow>
      <FieldRow label="Message template">
        <textarea
          value={draft.message_body ?? ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, message_body: e.target.value }))
          }
          rows={4}
          placeholder="Error rate {{value}}% exceeds threshold ({{threshold}}%) for {{service.name}} {{#is_alert}}@oncall{{/is_alert}}"
          className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-2 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Renotify if unresolved">
        <div className="flex items-center gap-1.5">
          {[900, 1800, 3600, 7200, 0].map((sec) => {
            const active = (draft.renotify_every_sec ?? 0) === sec;
            const label = sec === 0 ? "never" : sec >= 3600 ? `${sec / 3600}h` : `${sec / 60}m`;
            return (
              <button
                key={sec}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    renotify_every_sec: sec === 0 ? undefined : sec,
                  }))
                }
                className={`rounded px-2 py-0.5 text-xs ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </StepShell>
  );
}
