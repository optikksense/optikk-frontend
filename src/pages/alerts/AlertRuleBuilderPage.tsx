import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Bell, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button, Card, Input, Select, Switch, Tabs } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import { BacktestPanel } from "@/features/alerts/components/BacktestPanel";
import { TemplateEditor } from "@/features/alerts/components/TemplateEditor";
import { ThresholdEditor } from "@/features/alerts/components/ThresholdEditor";
import { WindowEditor } from "@/features/alerts/components/WindowEditor";
import {
  useAlertRule,
  useCreateAlertRule,
  useTestRulePayload,
  useTestSlackWebhook,
  useUpdateAlertRule,
} from "@/features/alerts/hooks/useAlerts";
import type {
  AlertConditionType,
  AlertRulePayload,
  AlertSeverity,
  AlertTargetRef,
  AlertWindow,
} from "@/features/alerts/types";
import { ROUTES } from "@/shared/constants/routes";

const DEFAULT_TEMPLATE = `[{{rule.severity}}] {{rule.name}} on {{instance.service.name}}
short={{values.short}} long={{values.long}} threshold={{threshold.critical}}
{{deploy.summary}}`;

const CONDITION_OPTIONS: Array<{ label: string; value: AlertConditionType }> = [
  { label: "SLO burn rate", value: "slo_burn_rate" },
  { label: "Error rate", value: "error_rate" },
  { label: "Metric threshold (coming soon)", value: "metric_threshold" },
  { label: "Log count (coming soon)", value: "log_count" },
  { label: "Absence / no-data (coming soon)", value: "absence" },
];

const SEVERITY_OPTIONS: Array<{ label: string; value: AlertSeverity }> = [
  { label: "P1 - Critical", value: "p1" },
  { label: "P2 - High", value: "p2" },
  { label: "P3 - Medium", value: "p3" },
  { label: "P4 - Low", value: "p4" },
  { label: "P5 - Info", value: "p5" },
];

interface BuilderSearch {
  readonly target?: string;
  readonly groupBy?: string;
  readonly condition?: AlertConditionType;
  readonly service?: string;
  readonly sloId?: string;
}

function buildDefaultPayload(prefill?: BuilderSearch): AlertRulePayload {
  const targetRef: Record<string, string | number | undefined> = {};
  if (prefill?.service) targetRef.serviceName = prefill.service;
  if (prefill?.sloId) targetRef.sloId = prefill.sloId;
  if (prefill?.target) {
    try {
      Object.assign(targetRef, JSON.parse(prefill.target) as Record<string, string>);
    } catch {
      targetRef.serviceName = prefill.target;
    }
  }
  return {
    name: "",
    description: "",
    conditionType: prefill?.condition ?? "error_rate",
    targetRef: targetRef as AlertTargetRef,
    groupBy: prefill?.groupBy ? prefill.groupBy.split(",").filter(Boolean) : [],
    windows: [
      { name: "short", secs: 300 },
      { name: "long", secs: 3600 },
    ],
    operator: "gt",
    warnThreshold: null,
    criticalThreshold: 0.05,
    recoveryThreshold: 0.02,
    forSecs: 120,
    recoverForSecs: 300,
    keepAliveSecs: 1800,
    noDataSecs: 600,
    severity: "p2",
    notifyTemplate: DEFAULT_TEMPLATE,
    maxNotifsPerHour: 4,
    slackWebhookUrl: "",
    enabled: true,
  };
}

export default function AlertRuleBuilderPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { ruleId?: string };
  const search = useSearch({ strict: false }) as BuilderSearch;
  const ruleId = params.ruleId;
  const existingQuery = useAlertRule(ruleId);
  const createMut = useCreateAlertRule();
  const updateMut = useUpdateAlertRule(ruleId ?? "");
  const slackTestMut = useTestSlackWebhook();
  const testPayloadMut = useTestRulePayload();

  const [payload, setPayload] = useState<AlertRulePayload>(() => buildDefaultPayload(search));
  const [initialized, setInitialized] = useState(false);
  const [tab, setTab] = useState("condition");

  const isEditing = Boolean(ruleId);
  useEffect(() => {
    if (!initialized && existingQuery.data) {
      const r = existingQuery.data;
      setPayload({
        name: r.name,
        description: r.description,
        conditionType: r.conditionType,
        targetRef: r.targetRef,
        groupBy: r.groupBy,
        windows: r.windows,
        operator: r.operator,
        warnThreshold: r.warnThreshold,
        criticalThreshold: r.criticalThreshold,
        recoveryThreshold: r.recoveryThreshold,
        forSecs: r.forSecs,
        recoverForSecs: r.recoverForSecs,
        keepAliveSecs: r.keepAliveSecs,
        noDataSecs: r.noDataSecs,
        severity: r.severity,
        notifyTemplate: r.notifyTemplate,
        maxNotifsPerHour: r.maxNotifsPerHour,
        slackWebhookUrl: r.slackWebhookUrl,
        enabled: r.enabled,
      });
      setInitialized(true);
    }
  }, [existingQuery.data, initialized]);

  const patch = (p: Partial<AlertRulePayload>) => setPayload((prev) => ({ ...prev, ...p }));

  const onSave = async () => {
    try {
      if (isEditing && ruleId) {
        await updateMut.mutateAsync(payload);
        toast.success("Rule updated");
      } else {
        const created = await createMut.mutateAsync(payload);
        toast.success("Rule created");
        navigate({
          to: ROUTES.alertRuleDetail.replace("$ruleId", created.id) as never,
        });
        return;
      }
      navigate({ to: ROUTES.alerts as never });
    } catch {
      toast.error("Failed to save rule");
    }
  };

  const onTestSlack = async () => {
    if (!payload.slackWebhookUrl) {
      toast.error("Enter a Slack webhook URL first");
      return;
    }
    try {
      const res = await slackTestMut.mutateAsync(payload.slackWebhookUrl);
      if (res.delivered) toast.success("Slack test message sent");
      else toast.error(res.error ?? "Slack test failed");
    } catch {
      toast.error("Slack test failed");
    }
  };

  const onPreview = async () => {
    try {
      await testPayloadMut.mutateAsync(payload);
      toast.success("Preview generated");
    } catch {
      toast.error("Preview failed");
    }
  };

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title={isEditing ? "Edit alert rule" : "New alert rule"}
        icon={<Bell size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onPreview}>
              <Send size={12} /> Preview
            </Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              <Save size={12} /> Save
            </Button>
          </div>
        }
      />

      <Tabs
        activeKey={tab}
        onChange={setTab}
        className="mt-1"
        items={[
          { key: "condition", label: "Condition" },
          { key: "thresholds", label: "Thresholds & timing" },
          { key: "notify", label: "Notifications" },
          { key: "backtest", label: isEditing ? "Backtest" : "Backtest (save first)" },
        ]}
      />

      {tab === "condition" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          <LabeledRow label="Rule name">
            <Input
              value={payload.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="High checkout error rate"
            />
          </LabeledRow>
          <LabeledRow label="Description">
            <Input
              value={payload.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Short description"
            />
          </LabeledRow>
          <LabeledRow label="Condition type">
            <Select
              value={payload.conditionType}
              onChange={(v) => patch({ conditionType: v as AlertConditionType })}
              options={CONDITION_OPTIONS}
              size="sm"
            />
          </LabeledRow>
          <LabeledRow label="Target (JSON)">
            <Input
              value={JSON.stringify(payload.targetRef)}
              onChange={(e) => {
                try {
                  patch({ targetRef: JSON.parse(e.target.value) as AlertTargetRef });
                } catch {
                  // ignore parse errors while typing
                }
              }}
              placeholder='{"serviceName":"checkout"}'
            />
          </LabeledRow>
          <LabeledRow label="Group by (comma-separated)">
            <Input
              value={payload.groupBy.join(",")}
              onChange={(e) =>
                patch({
                  groupBy: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="service.name,env"
            />
          </LabeledRow>
          <LabeledRow label="Windows">
            <WindowEditor
              windows={payload.windows}
              onChange={(next: AlertWindow[]) => patch({ windows: next })}
            />
          </LabeledRow>
          <LabeledRow label="Enabled">
            <Switch
              checked={payload.enabled}
              onChange={(e) => patch({ enabled: e.target.checked })}
            />
          </LabeledRow>
        </Card>
      )}

      {tab === "thresholds" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          <ThresholdEditor
            operator={payload.operator}
            warnThreshold={payload.warnThreshold ?? null}
            criticalThreshold={payload.criticalThreshold}
            recoveryThreshold={payload.recoveryThreshold ?? null}
            onChange={(p) => patch(p)}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <LabeledRow label="for (s)">
              <Input
                type="number"
                value={String(payload.forSecs)}
                onChange={(e) => patch({ forSecs: Number(e.target.value) })}
              />
            </LabeledRow>
            <LabeledRow label="recover for (s)">
              <Input
                type="number"
                value={String(payload.recoverForSecs)}
                onChange={(e) => patch({ recoverForSecs: Number(e.target.value) })}
              />
            </LabeledRow>
            <LabeledRow label="keep-alive (s)">
              <Input
                type="number"
                value={String(payload.keepAliveSecs)}
                onChange={(e) => patch({ keepAliveSecs: Number(e.target.value) })}
              />
            </LabeledRow>
            <LabeledRow label="no-data (s)">
              <Input
                type="number"
                value={String(payload.noDataSecs)}
                onChange={(e) => patch({ noDataSecs: Number(e.target.value) })}
              />
            </LabeledRow>
          </div>
          <LabeledRow label="Severity">
            <Select
              value={payload.severity}
              onChange={(v) => patch({ severity: v as AlertSeverity })}
              options={SEVERITY_OPTIONS}
              size="sm"
            />
          </LabeledRow>
        </Card>
      )}

      {tab === "notify" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          <LabeledRow label="Slack webhook URL">
            <div className="flex items-center gap-2">
              <Input
                value={payload.slackWebhookUrl}
                onChange={(e) => patch({ slackWebhookUrl: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
              />
              <Button variant="secondary" size="sm" onClick={onTestSlack}>
                Send test
              </Button>
            </div>
          </LabeledRow>
          <LabeledRow label="Max notifications / hour">
            <Input
              type="number"
              value={String(payload.maxNotifsPerHour)}
              onChange={(e) => patch({ maxNotifsPerHour: Number(e.target.value) })}
              className="w-32"
            />
          </LabeledRow>
          <TemplateEditor
            value={payload.notifyTemplate}
            onChange={(v) => patch({ notifyTemplate: v })}
          />
        </Card>
      )}

      {tab === "backtest" && isEditing && ruleId && (
        <Card className="mt-3 p-4">
          <BacktestPanel ruleId={ruleId} />
        </Card>
      )}
    </PageShell>
  );
}

function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
        {label}
      </span>
      {children}
    </label>
  );
}
