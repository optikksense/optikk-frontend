import { Check, Clock } from "lucide-react";

import { Button } from "@/components/ui";

import { useAckAlertInstance, useSnoozeAlertInstance } from "../hooks/useAlerts";
import type { AlertInstance } from "../types";
import { RuleStateChip } from "./RuleStateChip";

interface InstanceRowProps {
  readonly instance: AlertInstance;
}

export function InstanceRow({ instance }: InstanceRowProps) {
  const ackMutation = useAckAlertInstance();
  const snoozeMutation = useSnoozeAlertInstance();
  const tags = Object.entries(instance.groupValues);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2">
      <RuleStateChip state={instance.state} />
      <div className="flex min-w-0 flex-wrap items-center gap-1 text-[12px]">
        {tags.map(([k, v]) => (
          <span
            key={k}
            className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
          >
            {k}:{v}
          </span>
        ))}
        {tags.length === 0 && (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {instance.instanceKey}
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {instance.firedAt && (
          <span className="text-[11px] text-[var(--text-muted)]">Fired {instance.firedAt}</span>
        )}
        {instance.ackedBy ? (
          <span className="text-[11px] text-[var(--color-success)]">
            Acked by {instance.ackedBy}
          </span>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                ackMutation.mutate({ instanceId: instance.instanceKey, until: null })
              }
              disabled={ackMutation.isPending}
            >
              <Check size={12} /> Ack
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                snoozeMutation.mutate({ instanceId: instance.instanceKey, minutes: 30 })
              }
              disabled={snoozeMutation.isPending}
            >
              <Clock size={12} /> Snooze 30m
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
