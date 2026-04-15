import { useNavigate, useParams } from "@tanstack/react-router";
import { BellOff, Edit, ExternalLink, Send, Trash2 } from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import { BacktestPanel } from "@/features/alerts/components/BacktestPanel";
import { InstanceRow } from "@/features/alerts/components/InstanceRow";
import { RuleStateChip } from "@/features/alerts/components/RuleStateChip";
import {
  useAlertRule,
  useDeleteAlertRule,
  useMuteAlertRule,
  useRuleAudit,
  useTestSlackWebhook,
} from "@/features/alerts/hooks/useAlerts";
import { ROUTES } from "@/shared/constants/routes";

function presetLabel(kind: string): string {
  return kind.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function AlertRuleDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { ruleId?: string };
  const ruleId = params.ruleId ?? "";
  const ruleQuery = useAlertRule(ruleId);
  const auditQuery = useRuleAudit(ruleId);
  const muteMut = useMuteAlertRule();
  const deleteMut = useDeleteAlertRule();
  const slackTestMut = useTestSlackWebhook();

  const rule = ruleQuery.data;

  const auditEvents = useMemo(() => {
    const rows = [...(auditQuery.data ?? [])];
    rows.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
    return rows;
  }, [auditQuery.data]);

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

  const onTestSlack = async () => {
    if (!rule) return;
    try {
      const result = await slackTestMut.mutateAsync({
        name: rule.name,
        description: rule.description,
        preset_kind: rule.preset_kind,
        scope: rule.scope,
        condition: rule.condition,
        delivery: rule.delivery,
        enabled: rule.enabled,
      });
      if (result.delivered) toast.success("Slack test message sent");
      else toast.error(result.error ?? "Slack test failed");
    } catch {
      toast.error("Slack test failed");
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

  const serviceName = rule.scope.service_name ?? "";
  const logsHref = serviceName
    ? `${ROUTES.logs}?service=${encodeURIComponent(serviceName)}`
    : ROUTES.logs;
  const tracesHref = serviceName
    ? `${ROUTES.traces}?service=${encodeURIComponent(serviceName)}`
    : ROUTES.traces;
  const serviceHref = serviceName
    ? `${ROUTES.service}?service=${encodeURIComponent(serviceName)}`
    : ROUTES.service;

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <RuleStateChip state={rule.rule_state} size="md" />
            {rule.name}
          </span>
        }
        subtitle={rule.summary}
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
            <Button variant="secondary" size="sm" onClick={onTestSlack}>
              <Send size={12} /> Test Slack
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
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="info">{presetLabel(rule.preset_kind)}</Badge>
            <Badge variant={rule.delivery.slack_webhook_url ? "success" : "warning"}>
              {rule.delivery.slack_webhook_url ? "Slack configured" : "Slack missing"}
            </Badge>
            <Badge variant="default">{rule.condition.severity ?? "p2"}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoCard label="Description" value={rule.description || "—"} />
            <InfoCard label="Summary" value={rule.summary} />
            <InfoCard label="Service" value={rule.scope.service_name || "—"} />
            <InfoCard label="SLO / URL" value={rule.scope.slo_id || rule.scope.url || "—"} />
            <InfoCard label="Threshold" value={String(rule.condition.threshold)} />
            <InfoCard
              label="Window / Hold"
              value={`${rule.condition.window_minutes ?? rule.condition.evaluation_interval_minutes ?? "—"}m / ${rule.condition.hold_minutes ?? 0}m`}
            />
          </div>
          {rule.delivery.note ? (
            <div className="mt-4 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[12px] text-[var(--text-secondary)]">
              <div className="mb-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
                Responder note
              </div>
              {rule.delivery.note}
            </div>
          ) : null}
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
              Investigate
            </div>
            <div className="mt-2 flex flex-col gap-2 text-[12px]">
              <a
                href={serviceHref}
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
              >
                <ExternalLink size={12} /> Service
              </a>
              <a
                href={tracesHref}
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
              >
                <ExternalLink size={12} /> Traces
              </a>
              <a
                href={logsHref}
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
              >
                <ExternalLink size={12} /> Logs
              </a>
            </div>
          </div>
          <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[12px] text-[var(--text-secondary)]">
            <div className="mb-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
              Slack
            </div>
            {rule.delivery.slack_webhook_url ? "Webhook configured" : "Webhook missing"}
          </div>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Instances ({rule.instances.length})
        </div>
        <div className="flex flex-col gap-2">
          {rule.instances.map((instance) => (
            <InstanceRow key={instance.instance_key} alertId={rule.id} instance={instance} />
          ))}
          {rule.instances.length === 0 && (
            <div className="text-[12px] text-[var(--text-muted)]">No active instances.</div>
          )}
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Activity timeline
        </div>
        <div className="flex flex-col gap-1">
          {auditEvents.map((event, index) => (
            <div
              key={`${event.ts}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 text-[12px]"
            >
              <span className="font-mono text-[11px] text-[var(--text-muted)]">{event.ts}</span>
              <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 font-mono text-[11px]">
                {event.kind}
              </span>
              {event.from_state ? <RuleStateChip state={event.from_state} /> : null}
              {event.from_state || event.to_state ? (
                <span className="text-[var(--text-muted)]">→</span>
              ) : null}
              {event.to_state ? <RuleStateChip state={event.to_state} /> : null}
              <span className="text-[var(--text-secondary)]">
                {event.message || "Activity recorded"}
              </span>
            </div>
          ))}
          {auditEvents.length === 0 && (
            <div className="text-[12px] text-[var(--text-muted)]">No events yet.</div>
          )}
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Backtest
        </div>
        <BacktestPanel ruleId={rule.id} />
      </Card>
    </PageShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
        {label}
      </div>
      <div className="mt-1 text-[13px] text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
