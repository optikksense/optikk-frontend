import { useNavigate } from "@tanstack/react-router";
import { Bell, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, Card, Tabs } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import { RuleStateChip } from "@/features/alerts/components/RuleStateChip";
import { useAlertIncidents, useAlertRules, useSilences } from "@/features/alerts/hooks/useAlerts";
import { ROUTES } from "@/shared/constants/routes";

const TAB_RULES = "rules";
const TAB_INCIDENTS = "incidents";
const TAB_SILENCES = "silences";
const TAB_AUDIT = "audit";

export default function AlertsHubPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(TAB_RULES);
  const rulesQuery = useAlertRules();
  const incidentsQuery = useAlertIncidents({ refetchInterval: 15_000 });
  const silencesQuery = useSilences();

  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data]);
  const incidents = useMemo(() => incidentsQuery.data ?? [], [incidentsQuery.data]);
  const silences = useMemo(() => silencesQuery.data ?? [], [silencesQuery.data]);

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title="Alerts & Monitors"
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
      <Tabs
        activeKey={tab}
        onChange={setTab}
        className="mt-1"
        items={[
          { key: TAB_RULES, label: `Rules (${rules.length})` },
          { key: TAB_INCIDENTS, label: `Incidents (${incidents.length})` },
          { key: TAB_SILENCES, label: `Silences (${silences.length})` },
          { key: TAB_AUDIT, label: "Audit" },
        ]}
      />

      {tab === TAB_RULES && (
        <Card className="mt-3">
          <div className="divide-y divide-[var(--border-color)]">
            {rules.length === 0 && (
              <div className="p-6 text-[12px] text-[var(--text-muted)]">
                No rules yet. Click "New rule" to create one — or use "Create alert from this view"
                on an SLO/service/metrics panel.
              </div>
            )}
            {rules.map((rule) => (
              <button
                key={rule.id}
                type="button"
                className="flex w-full flex-wrap items-center gap-3 p-3 text-left hover:bg-white/[0.03]"
                onClick={() =>
                  navigate({
                    to: ROUTES.alertRuleDetail.replace("$ruleId", rule.id) as never,
                  })
                }
              >
                <RuleStateChip state={rule.ruleState} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-[13px] text-[var(--text-primary)]">
                    {rule.name}
                  </span>
                  <span className="truncate text-[11px] text-[var(--text-muted)]">
                    {rule.conditionType} · {rule.groupBy.join(", ") || "no group"}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span>severity: {rule.severity}</span>
                  <span>last eval: {rule.lastEvalAt ?? "—"}</span>
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
                Nothing firing. Everything is green.
              </div>
            )}
            {incidents.map((inc) => (
              <button
                key={`${inc.alertId}:${inc.instanceKey}`}
                type="button"
                className="flex w-full flex-wrap items-center gap-3 p-3 text-left hover:bg-white/[0.03]"
                onClick={() =>
                  navigate({
                    to: ROUTES.alertRuleDetail.replace("$ruleId", inc.alertId) as never,
                  })
                }
              >
                <RuleStateChip state={inc.state} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-[13px]">{inc.ruleName}</span>
                  <span className="truncate text-[11px] text-[var(--text-muted)]">
                    {Object.entries(inc.groupValues)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(" · ")}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span>severity: {inc.severity}</span>
                  <span>fired: {inc.firedAt}</span>
                  {inc.deployRefs && inc.deployRefs.length > 0 && (
                    <span className="text-[var(--color-primary)]">
                      deploy: {inc.deployRefs[0]?.deployId}
                    </span>
                  )}
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
              {silences.map((s, idx) => (
                <div
                  key={`${s.startsAt}-${idx}`}
                  className="flex items-center justify-between rounded-[var(--card-radius)] border border-[var(--border-color)] p-2 text-[12px]"
                >
                  <span>
                    {s.startsAt} → {s.endsAt}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {s.matchTags
                      ? Object.entries(s.matchTags)
                          .map(([k, v]) => `${k}:${v}`)
                          .join(" ")
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === TAB_AUDIT && (
        <Card className="mt-3 p-3 text-[12px] text-[var(--text-muted)]">
          Audit log streams from <code>alert_events</code>. Open a rule to see its timeline.
        </Card>
      )}
    </PageShell>
  );
}
