import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Bell, ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Card, Input, Select, Switch } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import {
  useAlertRule,
  useCreateAlertRule,
  usePreviewAlertRule,
  useTestSlackWebhook,
  useUpdateAlertRule,
} from "@/features/alerts/hooks/useAlerts";
import type {
  AlertPrefill,
  AlertPresetKind,
  AlertRuleCondition,
  AlertRulePayload,
  AlertRuleScope,
  AlertSeverity,
} from "@/features/alerts/types";
import { ROUTES } from "@/shared/constants/routes";

const STEPS = [
  { key: "type", label: "Type" },
  { key: "scope", label: "Scope" },
  { key: "condition", label: "Condition" },
  { key: "delivery", label: "Slack" },
  { key: "review", label: "Review" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const PRESET_OPTIONS: Array<{ label: string; value: AlertPresetKind }> = [
  { label: "Service error rate", value: "service_error_rate" },
  { label: "SLO burn rate", value: "slo_burn_rate" },
  { label: "HTTP check", value: "http_check" },
  { label: "AI latency", value: "ai_latency" },
  { label: "AI error rate", value: "ai_error_rate" },
  { label: "AI cost spike", value: "ai_cost_spike" },
  { label: "AI quality drop", value: "ai_quality_drop" },
];

const SEVERITY_OPTIONS: Array<{ label: string; value: AlertSeverity }> = [
  { label: "P1 - Critical", value: "p1" },
  { label: "P2 - High", value: "p2" },
  { label: "P3 - Medium", value: "p3" },
  { label: "P4 - Low", value: "p4" },
  { label: "P5 - Info", value: "p5" },
];

const SENSITIVITY_OPTIONS = [
  { label: "Fast", value: "fast" },
  { label: "Balanced", value: "balanced" },
  { label: "Slow", value: "slow" },
];

function defaultConditionForPreset(presetKind: AlertPresetKind): AlertRuleCondition {
  switch (presetKind) {
    case "service_error_rate":
      return { threshold: 5, window_minutes: 5, hold_minutes: 2, severity: "p2" };
    case "slo_burn_rate":
      return { threshold: 2, severity: "p2", sensitivity: "balanced" };
    case "http_check":
      return { threshold: 0.5, evaluation_interval_minutes: 1, severity: "p2" };
    case "ai_latency":
      return { threshold: 2500, window_minutes: 5, hold_minutes: 2, severity: "p2" };
    case "ai_error_rate":
      return { threshold: 5, window_minutes: 5, hold_minutes: 2, severity: "p2" };
    case "ai_cost_spike":
      return { threshold: 50, window_minutes: 15, hold_minutes: 5, severity: "p2" };
    case "ai_quality_drop":
      return { threshold: 0.7, window_minutes: 15, hold_minutes: 5, severity: "p2" };
  }
}

function defaultScopeForPreset(
  presetKind: AlertPresetKind,
  prefill?: AlertPrefill
): AlertRuleScope {
  switch (presetKind) {
    case "service_error_rate":
      return {
        service_name: prefill?.serviceName ?? "",
        environment: prefill?.environment ?? "",
      };
    case "slo_burn_rate":
      return {
        service_name: prefill?.serviceName ?? "",
        slo_id: prefill?.sloId ?? "",
      };
    case "http_check":
      return {
        url: prefill?.url ?? "https://",
        method: "GET",
        expect_status: 200,
        timeout_ms: 10000,
        follow_redirects: false,
      };
    case "ai_latency":
    case "ai_error_rate":
    case "ai_cost_spike":
    case "ai_quality_drop":
      return {
        service_name: prefill?.serviceName ?? "",
        provider: prefill?.provider ?? "",
        model: prefill?.model ?? "",
        prompt_template: prefill?.promptTemplate ?? "",
      };
  }
}

function buildDefaultPayload(prefill?: AlertPrefill): AlertRulePayload {
  const presetKind = prefill?.presetKind ?? "service_error_rate";
  return {
    name: "",
    description: "",
    preset_kind: presetKind,
    scope: defaultScopeForPreset(presetKind, prefill),
    condition: defaultConditionForPreset(presetKind),
    delivery: {
      slack_webhook_url: "",
      note: "",
    },
    enabled: true,
  };
}

function payloadWithPreset(
  nextPreset: AlertPresetKind,
  current: AlertRulePayload
): AlertRulePayload {
  return {
    ...current,
    preset_kind: nextPreset,
    scope: defaultScopeForPreset(nextPreset, {
      serviceName: current.scope.service_name,
      environment: current.scope.environment,
      sloId: current.scope.slo_id,
      url: current.scope.url,
      provider: current.scope.provider,
      model: current.scope.model,
      promptTemplate: current.scope.prompt_template,
    }),
    condition: defaultConditionForPreset(nextPreset),
  };
}

function titleForPreset(kind: AlertPresetKind): string {
  return PRESET_OPTIONS.find((option) => option.value === kind)?.label ?? kind;
}

export default function AlertRuleBuilderPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { ruleId?: string };
  const search = useSearch({ strict: false }) as AlertPrefill;
  const ruleId = params.ruleId;
  const existingQuery = useAlertRule(ruleId);
  const createMut = useCreateAlertRule();
  const updateMut = useUpdateAlertRule(ruleId ?? "");
  const slackTestMut = useTestSlackWebhook();
  const previewMut = usePreviewAlertRule();

  const [payload, setPayload] = useState<AlertRulePayload>(() => buildDefaultPayload(search));
  const [initialized, setInitialized] = useState(false);
  const [step, setStep] = useState<StepKey>("type");

  const isEditing = Boolean(ruleId);

  useEffect(() => {
    if (!initialized && existingQuery.data) {
      const rule = existingQuery.data;
      setPayload({
        name: rule.name,
        description: rule.description ?? "",
        preset_kind: rule.preset_kind,
        scope: rule.scope,
        condition: rule.condition,
        delivery: rule.delivery,
        enabled: rule.enabled,
      });
      setInitialized(true);
    }
  }, [existingQuery.data, initialized]);

  useEffect(() => {
    if (step === "review") {
      void previewMut.mutateAsync(payload).catch(() => undefined);
    }
  }, [payload, previewMut, step]);

  const currentStepIndex = useMemo(() => STEPS.findIndex((entry) => entry.key === step), [step]);

  const patch = (next: Partial<AlertRulePayload>) => setPayload((prev) => ({ ...prev, ...next }));
  const patchScope = (next: Partial<AlertRuleScope>) =>
    setPayload((prev) => ({ ...prev, scope: { ...prev.scope, ...next } }));
  const patchCondition = (next: Partial<AlertRuleCondition>) =>
    setPayload((prev) => ({ ...prev, condition: { ...prev.condition, ...next } }));

  const moveStep = (direction: -1 | 1) => {
    const nextIndex = Math.min(STEPS.length - 1, Math.max(0, currentStepIndex + direction));
    setStep(STEPS[nextIndex]?.key ?? "type");
  };

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
    try {
      const result = await slackTestMut.mutateAsync(payload);
      if (result.delivered) {
        toast.success("Slack test message sent");
      } else {
        toast.error(result.error ?? "Slack test failed");
      }
    } catch {
      toast.error("Slack test failed");
    }
  };

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title={isEditing ? "Edit alert rule" : "New alert rule"}
        subtitle="Define alerts through guided presets, then connect the rule to Slack."
        icon={<Bell size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setStep("review")}>
              <Send size={12} /> Review
            </Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              <Save size={12} /> Save
            </Button>
          </div>
        }
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((entry, index) => {
          const active = entry.key === step;
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => setStep(entry.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              }`}
            >
              <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
                {index + 1}
              </span>
              {entry.label}
            </button>
          );
        })}
      </div>

      {step === "type" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          <LabeledRow label="Rule name">
            <Input
              value={payload.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Checkout error rate"
            />
          </LabeledRow>
          <LabeledRow label="Description">
            <Input
              value={payload.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="What this alert is protecting"
            />
          </LabeledRow>
          <LabeledRow label="Alert type">
            <Select
              value={payload.preset_kind}
              onChange={(value) => patch(payloadWithPreset(value as AlertPresetKind, payload))}
              options={PRESET_OPTIONS}
              size="sm"
            />
          </LabeledRow>
          <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[13px] text-[var(--text-secondary)]">
            <div className="font-medium text-[var(--text-primary)]">
              {titleForPreset(payload.preset_kind)}
            </div>
            <div className="mt-1">
              {payload.preset_kind === "service_error_rate" &&
                "Alert when a service error rate crosses a clear threshold."}
              {payload.preset_kind === "slo_burn_rate" &&
                "Alert when an SLO target drifts into burn territory with preset sensitivity."}
              {payload.preset_kind === "http_check" &&
                "Alert when a health check endpoint starts failing."}
              {payload.preset_kind.startsWith("ai_") &&
                "Alert on a focused AI signal such as latency, error rate, cost, or quality."}
            </div>
          </div>
        </Card>
      )}

      {step === "scope" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          {(payload.preset_kind === "service_error_rate" ||
            payload.preset_kind === "slo_burn_rate") && (
            <>
              <LabeledRow label="Service name">
                <Input
                  value={payload.scope.service_name ?? ""}
                  onChange={(e) => patchScope({ service_name: e.target.value })}
                  placeholder="checkout"
                />
              </LabeledRow>
              {payload.preset_kind === "service_error_rate" && (
                <LabeledRow label="Environment (optional)">
                  <Input
                    value={payload.scope.environment ?? ""}
                    onChange={(e) => patchScope({ environment: e.target.value })}
                    placeholder="prod"
                  />
                </LabeledRow>
              )}
              {payload.preset_kind === "slo_burn_rate" && (
                <LabeledRow label="SLO ID">
                  <Input
                    value={payload.scope.slo_id ?? ""}
                    onChange={(e) => patchScope({ slo_id: e.target.value })}
                    placeholder="checkout-availability"
                  />
                </LabeledRow>
              )}
            </>
          )}

          {payload.preset_kind === "http_check" && (
            <>
              <LabeledRow label="URL">
                <Input
                  value={payload.scope.url ?? ""}
                  onChange={(e) => patchScope({ url: e.target.value })}
                  placeholder="https://example.com/health"
                />
              </LabeledRow>
              <LabeledRow label="Method">
                <Select
                  value={payload.scope.method ?? "GET"}
                  onChange={(value) => patchScope({ method: value })}
                  options={[
                    { label: "GET", value: "GET" },
                    { label: "HEAD", value: "HEAD" },
                  ]}
                  size="sm"
                />
              </LabeledRow>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <LabeledRow label="Expected status">
                  <Input
                    type="number"
                    value={String(payload.scope.expect_status ?? 200)}
                    onChange={(e) => patchScope({ expect_status: Number(e.target.value) || 200 })}
                  />
                </LabeledRow>
                <LabeledRow label="Timeout (ms)">
                  <Input
                    type="number"
                    value={String(payload.scope.timeout_ms ?? 10000)}
                    onChange={(e) =>
                      patchScope({ timeout_ms: Math.max(1000, Number(e.target.value) || 10000) })
                    }
                  />
                </LabeledRow>
              </div>
              <LabeledRow label="Body contains (optional)">
                <Input
                  value={payload.scope.expect_body_substring ?? ""}
                  onChange={(e) => patchScope({ expect_body_substring: e.target.value })}
                  placeholder="healthy"
                />
              </LabeledRow>
              <LabeledRow label="Follow redirects">
                <Switch
                  checked={Boolean(payload.scope.follow_redirects)}
                  onChange={(e) => patchScope({ follow_redirects: e.target.checked })}
                />
              </LabeledRow>
            </>
          )}

          {payload.preset_kind.startsWith("ai_") && (
            <>
              <LabeledRow label="Service name (optional)">
                <Input
                  value={payload.scope.service_name ?? ""}
                  onChange={(e) => patchScope({ service_name: e.target.value })}
                  placeholder="llm-gateway"
                />
              </LabeledRow>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <LabeledRow label="Provider">
                  <Input
                    value={payload.scope.provider ?? ""}
                    onChange={(e) => patchScope({ provider: e.target.value })}
                    placeholder="openai"
                  />
                </LabeledRow>
                <LabeledRow label="Model">
                  <Input
                    value={payload.scope.model ?? ""}
                    onChange={(e) => patchScope({ model: e.target.value })}
                    placeholder="gpt-4.1"
                  />
                </LabeledRow>
              </div>
              <LabeledRow label="Prompt template (optional)">
                <Input
                  value={payload.scope.prompt_template ?? ""}
                  onChange={(e) => patchScope({ prompt_template: e.target.value })}
                  placeholder="checkout-assistant"
                />
              </LabeledRow>
            </>
          )}
        </Card>
      )}

      {step === "condition" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          {payload.preset_kind === "slo_burn_rate" ? (
            <>
              <LabeledRow label="Sensitivity">
                <Select
                  value={payload.condition.sensitivity ?? "balanced"}
                  onChange={(value) =>
                    patchCondition({ sensitivity: value as "fast" | "balanced" | "slow" })
                  }
                  options={SENSITIVITY_OPTIONS}
                  size="sm"
                />
              </LabeledRow>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <LabeledRow label="Threshold">
                  <Input
                    type="number"
                    value={String(payload.condition.threshold)}
                    onChange={(e) => patchCondition({ threshold: Number(e.target.value) || 0 })}
                  />
                </LabeledRow>
                <LabeledRow
                  label={
                    payload.preset_kind === "http_check"
                      ? "Check interval (minutes)"
                      : "Window (minutes)"
                  }
                >
                  <Input
                    type="number"
                    value={String(
                      payload.preset_kind === "http_check"
                        ? (payload.condition.evaluation_interval_minutes ?? 1)
                        : (payload.condition.window_minutes ?? 5)
                    )}
                    onChange={(e) =>
                      patchCondition(
                        payload.preset_kind === "http_check"
                          ? {
                              evaluation_interval_minutes: Number(e.target.value) || 1,
                            }
                          : { window_minutes: Number(e.target.value) || 5 }
                      )
                    }
                  />
                </LabeledRow>
              </div>
              {payload.preset_kind !== "http_check" && (
                <LabeledRow label="Hold time (minutes)">
                  <Input
                    type="number"
                    value={String(payload.condition.hold_minutes ?? 2)}
                    onChange={(e) => patchCondition({ hold_minutes: Number(e.target.value) || 2 })}
                  />
                </LabeledRow>
              )}
            </>
          )}

          <LabeledRow label="Severity">
            <Select
              value={payload.condition.severity ?? "p2"}
              onChange={(value) => patchCondition({ severity: value as AlertSeverity })}
              options={SEVERITY_OPTIONS}
              size="sm"
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

      {step === "delivery" && (
        <Card className="mt-3 flex flex-col gap-4 p-4">
          <LabeledRow label="Slack webhook URL">
            <div className="flex items-center gap-2">
              <Input
                value={payload.delivery.slack_webhook_url}
                onChange={(e) =>
                  patch({
                    delivery: { ...payload.delivery, slack_webhook_url: e.target.value },
                  })
                }
                placeholder="https://hooks.slack.com/services/..."
              />
              <Button variant="secondary" size="sm" onClick={onTestSlack}>
                Send test
              </Button>
            </div>
          </LabeledRow>
          <LabeledRow label="Optional note">
            <textarea
              value={payload.delivery.note ?? ""}
              onChange={(e) =>
                patch({
                  delivery: { ...payload.delivery, note: e.target.value },
                })
              }
              placeholder="Tell responders what to check first."
              className="min-h-[96px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none"
            />
          </LabeledRow>
          {slackTestMut.data ? (
            <Card className="border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant={slackTestMut.data.delivered ? "success" : "error"}>
                  {slackTestMut.data.delivered ? "Delivered" : "Failed"}
                </Badge>
                <span className="text-[12px] text-[var(--text-secondary)]">Latest Slack test</span>
              </div>
              <div className="font-medium text-[13px] text-[var(--text-primary)]">
                {slackTestMut.data.notification.title}
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-[12px] text-[var(--text-secondary)]">
                {slackTestMut.data.notification.body}
              </pre>
            </Card>
          ) : null}
        </Card>
      )}

      {step === "review" && (
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="info">{titleForPreset(payload.preset_kind)}</Badge>
              <Badge variant={payload.enabled ? "success" : "warning"}>
                {payload.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
              Summary
            </div>
            <div className="mt-2 text-[14px] text-[var(--text-primary)]">
              {previewMut.data?.summary ?? "Loading preview…"}
            </div>
            {previewMut.data?.engine ? (
              <div className="mt-4 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[12px] text-[var(--text-secondary)]">
                <div>Engine type: {previewMut.data.engine.condition_type}</div>
                <div>Operator: {previewMut.data.engine.operator}</div>
                <div>
                  Windows:{" "}
                  {previewMut.data.engine.windows
                    .map((window) => `${window.name}:${window.secs}s`)
                    .join(", ")}
                </div>
                <div>Threshold: {previewMut.data.engine.critical_threshold}</div>
                <div>Hold: {previewMut.data.engine.for_secs}s</div>
                <div>No data: {previewMut.data.engine.no_data_secs}s</div>
              </div>
            ) : null}
          </Card>

          <Card className="p-4">
            <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
              Slack message preview
            </div>
            <div className="mt-2 font-medium text-[13px] text-[var(--text-primary)]">
              {previewMut.data?.notification.title ?? payload.name ?? "Alert preview"}
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-[12px] text-[var(--text-secondary)]">
              {previewMut.data?.notification.body ?? "Loading preview…"}
            </pre>
          </Card>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentStepIndex === 0}
          onClick={() => moveStep(-1)}
        >
          <ChevronLeft size={12} /> Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={currentStepIndex === STEPS.length - 1}
          onClick={() => moveStep(1)}
        >
          Next <ChevronRight size={12} />
        </Button>
      </div>
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
