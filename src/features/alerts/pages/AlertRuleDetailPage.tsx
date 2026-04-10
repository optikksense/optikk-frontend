import { useNavigate, useParams } from "@tanstack/react-router";
import { BellOff, Edit, ExternalLink, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Card } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import { BacktestPanel } from "@/features/alerts/components/BacktestPanel";
import { DeployOverlay } from "@/features/alerts/components/DeployOverlay";
import { InstanceRow } from "@/features/alerts/components/InstanceRow";
import { RuleStateChip } from "@/features/alerts/components/RuleStateChip";
import {
  useAlertRule,
  useDeleteAlertRule,
  useMuteAlertRule,
  useRuleAudit,
} from "@/features/alerts/hooks/useAlerts";
import { ROUTES } from "@/shared/constants/routes";

export default function AlertRuleDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { ruleId?: string };
  const ruleId = params.ruleId ?? "";
  const ruleQuery = useAlertRule(ruleId);
  const auditQuery = useRuleAudit(ruleId);
  const muteMut = useMuteAlertRule();
  const deleteMut = useDeleteAlertRule();

  const rule = ruleQuery.data;

  const onMute = async () => {
    if (!rule) return;
    const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    try {
      await muteMut.mutateAsync({ id: rule.id, until });
      toast.success("Rule muted for 1h");
    } catch {
      toast.error("Failed to mute rule");
    }
  };

  const onDelete = async () => {
    if (!rule) return;
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(rule.id);
      toast.success("Rule deleted");
      navigate({ to: ROUTES.alerts as never });
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  if (!rule) {
    return (
      <PageShell className="min-h-screen">
        <PageHeader title="Alert rule" />
        <Card className="mt-3 p-6 text-[12px] text-[var(--text-muted)]">
          {ruleQuery.isPending ? "Loading…" : "Rule not found."}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <RuleStateChip state={rule.ruleState} size="md" />
            {rule.name}
          </span>
        }
        subtitle={rule.description}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate({
                  to: ROUTES.alertRuleEdit.replace("$ruleId", rule.id) as never,
                })
              }
            >
              <Edit size={12} /> Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={onMute}>
              <BellOff size={12} /> Mute 1h
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              <Trash2 size={12} /> Delete
            </Button>
          </div>
        }
      />

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-3 lg:col-span-2">
          <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
            Instances ({rule.instances.length})
          </div>
          <div className="flex flex-col gap-2">
            {rule.instances.map((inst) => (
              <InstanceRow key={inst.instanceKey} instance={inst} />
            ))}
            {rule.instances.length === 0 && (
              <div className="text-[12px] text-[var(--text-muted)]">
                No instances. The rule is not firing.
              </div>
            )}
          </div>
        </Card>
        <Card className="flex flex-col gap-3 p-3">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
              Investigate
            </div>
            <div className="mt-1 flex flex-col gap-1 text-[12px]">
              {rule.targetRef.serviceName && (
                <a
                  href={`${ROUTES.service}?service=${rule.targetRef.serviceName}`}
                  className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                >
                  <ExternalLink size={12} /> Service: {rule.targetRef.serviceName}
                </a>
              )}
              <a
                href={`${ROUTES.traces}?service=${rule.targetRef.serviceName ?? ""}`}
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
              >
                <ExternalLink size={12} /> Traces
              </a>
              <a
                href={`${ROUTES.logs}?service=${rule.targetRef.serviceName ?? ""}`}
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
              >
                <ExternalLink size={12} /> Logs
              </a>
            </div>
          </div>
          <DeployOverlay deploys={[]} />
        </Card>
      </div>

      <Card className="mt-3 p-3">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Timeline
        </div>
        <div className="flex flex-col gap-1">
          {(auditQuery.data ?? []).map((evt, idx) => (
            <div
              key={`${evt.ts}-${idx}`}
              className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]"
            >
              <span className="text-[var(--text-muted)]">{evt.ts}</span>
              <span className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5 font-mono text-[11px]">
                {evt.kind}
              </span>
              {evt.fromState && <RuleStateChip state={evt.fromState} />}
              <span className="text-[var(--text-muted)]">→</span>
              {evt.toState && <RuleStateChip state={evt.toState} />}
              <span>{evt.message}</span>
            </div>
          ))}
          {(auditQuery.data ?? []).length === 0 && (
            <div className="text-[12px] text-[var(--text-muted)]">No events yet.</div>
          )}
        </div>
      </Card>

      <Card className="mt-3 p-3">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Backtest
        </div>
        <BacktestPanel ruleId={rule.id} />
      </Card>
    </PageShell>
  );
}
