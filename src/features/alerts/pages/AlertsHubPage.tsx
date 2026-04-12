import { useNavigate } from "@tanstack/react-router";
import { Bell, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import { RuleStateChip } from "@/features/alerts/components/RuleStateChip";
import {
  useAlertActivity,
  useAlertIncidents,
  useAlertRules,
  useSilences,
} from "@/features/alerts/hooks/useAlerts";
import { ROUTES } from "@/shared/constants/routes";

const TAB_RULES = "rules";
const TAB_INCIDENTS = "incidents";
const TAB_SILENCES = "silences";
const TAB_ACTIVITY = "activity";

function presetLabel(kind: string): string {
  return kind.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function AlertsHubPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(TAB_RULES);
  const rulesQuery = useAlertRules();
  const incidentsQuery = useAlertIncidents({ refetchInterval: 15_000 });
  const silencesQuery = useSilences();
  const activityQuery = useAlertActivity();

  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data]);
  const incidents = useMemo(() => incidentsQuery.data ?? [], [incidentsQuery.data]);
  const silences = useMemo(() => silencesQuery.data ?? [], [silencesQuery.data]);
  const activityRows = useMemo(() => activityQuery.data ?? [], [activityQuery.data]);

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title="Alerts & Monitors"
        subtitle="Create preset-based alerts, wire them to Slack, and keep incident context close to the rule."
        icon={<Bell size={22} />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate({ to: ROUTES.alertRuleNew as never })}
          >
            <Plus size={14} /> New rule
          </Button>
        }
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { key: TAB_RULES, label: `Rules (${rules.length})` },
          { key: TAB_INCIDENTS, label: `Incidents (${incidents.length})` },
          { key: TAB_SILENCES, label: `Silences (${silences.length})` },
          { key: TAB_ACTIVITY, label: "Activity" },
        ].map((item) => {
          const active = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === TAB_RULES && (
        <Card className="mt-3">
          <div className="divide-y divide-[var(--border-color)]">
            {rules.length === 0 && (
              <div className="p-6 text-[12px] text-[var(--text-muted)]">
                No rules yet. Create one from this page or from a guided entry point in the product.
              </div>
            )}
            {rules.map((rule) => (
              <button
                key={rule.id}
                type="button"
                className="flex w-full flex-col gap-2 p-4 text-left hover:bg-white/[0.03]"
                onClick={() =>
                  navigate({
                    to: ROUTES.alertRuleDetail.replace("$ruleId", rule.id) as never,
                  })
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <RuleStateChip state={rule.rule_state} />
                  <span className="font-semibold text-[13px] text-[var(--text-primary)]">
                    {rule.name}
                  </span>
                  <Badge variant="info">{presetLabel(rule.preset_kind)}</Badge>
                  <Badge variant={rule.delivery.slack_webhook_url ? "success" : "warning"}>
                    {rule.delivery.slack_webhook_url ? "Slack ready" : "Slack missing"}
                  </Badge>
                </div>
                <div className="text-[12px] text-[var(--text-secondary)]">{rule.summary}</div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span>severity: {rule.condition.severity ?? "p2"}</span>
                  <span>last eval: {rule.last_eval_at ?? "—"}</span>
                  <span>{rule.instances.length} instances</span>
                  <span>{rule.enabled ? "enabled" : "disabled"}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === TAB_INCIDENTS && (
        <Card className="mt-3">
          <div className="divide-y divide-[var(--border-color)]">
            {incidents.length === 0 && (
              <div className="p-6 text-[12px] text-[var(--text-muted)]">
                Nothing firing. Everything looks healthy.
              </div>
            )}
            {incidents.map((incident) => (
              <button
                key={`${incident.alert_id}:${incident.instance_key}`}
                type="button"
                className="flex w-full flex-col gap-2 p-4 text-left hover:bg-white/[0.03]"
                onClick={() =>
                  navigate({
                    to: ROUTES.alertRuleDetail.replace("$ruleId", incident.alert_id) as never,
                  })
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <RuleStateChip state={incident.state} />
                  <span className="font-semibold text-[13px] text-[var(--text-primary)]">
                    {incident.rule_name}
                  </span>
                  <Badge variant="info">{presetLabel(incident.preset_kind)}</Badge>
                </div>
                <div className="text-[12px] text-[var(--text-secondary)]">{incident.summary}</div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {Object.entries(incident.group_values ?? {})
                    .map(([key, value]) => `${key}:${value}`)
                    .join(" · ") || incident.instance_key}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span>severity: {incident.severity}</span>
                  <span>fired: {incident.fired_at ?? "—"}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === TAB_SILENCES && (
        <Card className="mt-3 p-3">
          {silences.length === 0 ? (
            <div className="text-[12px] text-[var(--text-muted)]">No active silences.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {silences.map((silence) => (
                <div
                  key={silence.id ?? `${silence.starts_at}-${silence.ends_at}`}
                  className="flex flex-col gap-1 rounded-[var(--card-radius)] border border-[var(--border-color)] p-3 text-[12px]"
                >
                  <div>
                    {silence.starts_at} → {silence.ends_at}
                  </div>
                  {silence.match_tags ? (
                    <div className="font-mono text-[11px] text-[var(--text-muted)]">
                      {Object.entries(silence.match_tags)
                        .map(([key, value]) => `${key}:${value}`)
                        .join(" ")}
                    </div>
                  ) : null}
                  {silence.reason ? (
                    <div className="text-[11px] text-[var(--text-secondary)]">{silence.reason}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === TAB_ACTIVITY && (
        <Card className="mt-3 p-3">
          {activityRows.length === 0 ? (
            <div className="text-[12px] text-[var(--text-muted)]">No alert activity yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {activityRows.map((event) => (
                <button
                  key={`${event.alert_id}:${event.ts}:${event.kind}`}
                  type="button"
                  className="flex flex-col gap-1 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-left"
                  onClick={() =>
                    navigate({
                      to: ROUTES.alertRuleDetail.replace("$ruleId", event.alert_id) as never,
                    })
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {event.to_state ? <RuleStateChip state={event.to_state} /> : null}
                    <span className="font-medium text-[13px] text-[var(--text-primary)]">
                      {event.rule_name}
                    </span>
                    <Badge variant="info">{presetLabel(event.preset_kind)}</Badge>
                    <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                      {event.kind}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)]">{event.summary}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {event.message || event.instance_key || "Activity recorded"}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {event.ts}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
}
