import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageSquarePlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge, Button, Input, Tabs } from "@shared/components/primitives/ui";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { formatNumber, formatTimestamp } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import { aiFeedbackApi } from "../api/aiFeedbackApi";
import { aiPlatformKeys, aiPlatformQueries } from "../api/aiPlatformQueryOptions";
import type { AiDrawerEntity } from "../types";
import { buildAiDrawerSearch, clearAiDrawerSearch, readAiDrawerState } from "./aiDrawerState";

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\bAi\b/g, "AI")
    .replace(/\bQps\b/g, "QPS")
    .replace(/\bPii\b/g, "PII")
    .replace(/\bUsd\b/g, "USD")
    .replace(/\bMs\b/g, "ms");
}

type DrawerSnapshot = Record<string, unknown> & {
  entity?: AiDrawerEntity;
  id?: string;
};

function toRecord(
  data: Record<string, unknown> | null,
  entity: AiDrawerEntity | null,
  id: string | null
): DrawerSnapshot {
  return {
    ...(data ?? {}),
    ...(entity ? { entity } : {}),
    ...(id ? { id } : {}),
  };
}

function getFeedbackTargetType(
  entity: AiDrawerEntity | null
): "run" | "prompt" | "dataset-item" | "eval-run" | "experiment-run" | null {
  switch (entity) {
    case "run":
    case "prompt":
    case "dataset-item":
    case "eval-run":
    case "experiment-run":
      return entity;
    default:
      return null;
  }
}

function isPresent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function renderValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "number") return Number.isFinite(value) ? formatNumber(value) : String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function filterFields(fields: Array<[string, unknown]>): Array<[string, unknown]> {
  return fields.filter(([, value]) => isPresent(value));
}

function buildFullPageLink(
  entity: AiDrawerEntity | null,
  id: string | null,
  data: Record<string, unknown> | null
): string | null {
  if (!entity || !id) return null;

  switch (entity) {
    case "run":
      return ROUTES.aiRunDetail.replace("$spanId", encodeURIComponent(id));
    case "conversation":
      return ROUTES.aiConversationDetail.replace("$conversationId", encodeURIComponent(id));
    case "prompt":
      return ROUTES.aiPromptDetail.replace("$promptId", encodeURIComponent(id));
    case "dataset":
      return ROUTES.aiDatasetDetail.replace("$datasetId", encodeURIComponent(id));
    case "eval":
      return ROUTES.aiEvalDetail.replace("$evalId", encodeURIComponent(id));
    case "experiment":
      return ROUTES.aiExperimentDetail.replace("$experimentId", encodeURIComponent(id));
    case "eval-run": {
      const evalId = typeof data?.evalId === "string" ? data.evalId : "";
      return evalId ? ROUTES.aiEvalDetail.replace("$evalId", encodeURIComponent(evalId)) : null;
    }
    case "experiment-run": {
      const experimentId = typeof data?.experimentId === "string" ? data.experimentId : "";
      return experimentId
        ? ROUTES.aiExperimentDetail.replace("$experimentId", encodeURIComponent(experimentId))
        : null;
    }
    default:
      return null;
  }
}

export function AiInvestigationDrawer(): JSX.Element | null {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const drawer = useMemo(() => readAiDrawerState(searchParams), [searchParams]);
  const [feedbackScore, setFeedbackScore] = useState("80");
  const [feedbackLabel, setFeedbackLabel] = useState("useful");
  const [feedbackComment, setFeedbackComment] = useState("");

  const isOpen = Boolean(drawer.entity && drawer.id);
  const fullPageLink = buildFullPageLink(drawer.entity, drawer.id, drawer.data);
  const snapshot = toRecord(drawer.data, drawer.entity, drawer.id);
  const feedbackTargetType = getFeedbackTargetType(drawer.entity);

  const feedbackQuery = useQuery(
    aiPlatformQueries.feedback(feedbackTargetType ?? undefined, drawer.id ?? undefined)
  );

  const createFeedbackMutation = useMutation({
    mutationFn: () =>
      aiFeedbackApi.create({
        targetType: feedbackTargetType ?? "run",
        targetId: drawer.id ?? "",
        runSpanId:
          drawer.entity === "run"
            ? drawer.id ?? undefined
            : typeof drawer.data?.spanId === "string"
              ? drawer.data.spanId
              : undefined,
        traceId: typeof drawer.data?.traceId === "string" ? drawer.data.traceId : undefined,
        score: Number(feedbackScore),
        label: feedbackLabel,
        comment: feedbackComment,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: aiPlatformKeys.feedback(feedbackTargetType ?? undefined, drawer.id ?? undefined),
      });
      setFeedbackComment("");
    },
  });

  const overviewFields = Object.entries(snapshot).filter(([key, value]) => {
    if (["systemPrompt", "userTemplate", "input", "metadata", "summary"].includes(key)) {
      return false;
    }
    return isPresent(value);
  });

  const promptFields = filterFields([
    ["System Prompt", snapshot.systemPrompt],
    ["User Template", snapshot.userTemplate],
    ["Input Preview", snapshot.inputPreview],
    ["Output Preview", snapshot.outputPreview],
    ["Expected Output", snapshot.expectedOutput],
    ["Generated Output", snapshot.outputText],
  ]);

  const lineageFields = filterFields([
    ["Span ID", snapshot.spanId],
    ["Trace ID", snapshot.traceId],
    ["Parent Span ID", snapshot.parentSpanId],
    ["Service", snapshot.serviceName],
    ["Operation", snapshot.operationName],
    ["Started", snapshot.startTime ? formatTimestamp(String(snapshot.startTime)) : null],
  ]);

  const costFields = filterFields([
    ["Input Tokens", snapshot.inputTokens],
    ["Output Tokens", snapshot.outputTokens],
    ["Total Tokens", snapshot.totalTokens],
    ["Total Cost USD", snapshot.totalCostUsd],
    ["Avg Cost / Query", snapshot.avgCostPerQuery],
    ["Cache Hit Rate", snapshot.cacheHitRate],
  ]);

  const safetyFields = filterFields([
    ["PII Detection Rate", snapshot.piiDetectionRate],
    ["PII Detected Count", snapshot.piiDetectedCount],
    ["Guardrail Block Rate", snapshot.guardrailBlockRate],
    ["Guardrail Blocked Count", snapshot.guardrailBlockedCount],
    ["Content Policy Rate", snapshot.contentPolicyRate],
    ["Content Policy Count", snapshot.contentPolicyCount],
  ]);

  const defaultTab =
    drawer.tab ??
    (promptFields.length > 0
      ? "prompt"
      : lineageFields.length > 0
        ? "lineage"
        : costFields.length > 0
          ? "cost"
          : safetyFields.length > 0
            ? "safety"
            : "overview");

  const drawerTabs = [
    { key: "overview", label: "Overview", show: true },
    { key: "prompt", label: "Prompt/Response", show: promptFields.length > 0 },
    { key: "lineage", label: "Trace Lineage", show: lineageFields.length > 0 },
    { key: "cost", label: "Cost/Tokens", show: costFields.length > 0 },
    { key: "safety", label: "Safety", show: safetyFields.length > 0 },
    { key: "feedback", label: "Feedback", show: true },
    { key: "json", label: "JSON", show: true },
  ].filter((tab) => tab.show);

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-16 right-0 bottom-0 z-[1100] flex w-[560px] max-w-[92vw] flex-col border-[var(--border-color)] border-l bg-[linear-gradient(180deg,rgba(9,13,26,0.98),rgba(6,10,20,0.96))] shadow-[-20px_0_50px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="flex items-start justify-between gap-3 border-[var(--border-color)] border-b px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="info">{drawer.entity}</Badge>
            {snapshot.status ? <Badge variant="default">{String(snapshot.status)}</Badge> : null}
          </div>
          <div className="mt-2 truncate font-semibold text-[18px] text-[var(--text-primary)]">
            {drawer.title ?? drawer.id}
          </div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Fast AI investigation view with drilldowns and feedback capture.
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
          onClick={() =>
            navigate({
              to: (location.pathname + clearAiDrawerSearch(location.search)) as any,
              replace: true,
            })
          }
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-[var(--border-color)] border-b px-5 py-3">
        {fullPageLink ? (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              navigate({
                to: fullPageLink as any,
              })
            }
          >
            Open full page
            <ArrowRight size={14} />
          </Button>
        ) : null}
        {drawer.entity === "model" && drawer.id ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate({
                to: ROUTES.aiRuns as any,
                search: { model: drawer.id } as any,
              })
            }
          >
            Open filtered runs
          </Button>
        ) : null}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(nextTab) => {
          setActiveTab(nextTab as string);
          if (drawer.entity && drawer.id) {
            navigate({
              to:
                location.pathname +
                buildAiDrawerSearch(location.search, drawer.entity, drawer.id, {
                  title: drawer.title ?? undefined,
                  data: drawer.data ?? undefined,
                  tab: String(nextTab),
                }),
              replace: true,
            });
          }
        }}
        items={drawerTabs.map((tab) => ({ key: tab.key, label: tab.label, children: null }))}
        size="sm"
        className="shrink-0 px-5 pt-3"
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === "overview" ? (
          <div className="grid gap-3">
            {overviewFields.map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
              >
                <div className="mb-1 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {humanizeKey(key)}
                </div>
                <div className="break-words font-mono text-[13px] text-[var(--text-primary)]">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "prompt" ? (
          <div className="grid gap-3">
            {promptFields.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
              >
                <div className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {label}
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-primary)]">
                  {renderValue(value)}
                </pre>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "lineage" ? (
          <div className="grid gap-3">
            {lineageFields.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
              >
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {label}
                </div>
                <div className="mt-1 break-words font-mono text-[13px] text-[var(--text-primary)]">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "cost" ? (
          <div className="grid grid-cols-2 gap-3">
            {costFields.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
              >
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {label}
                </div>
                <div className="mt-2 font-semibold font-mono text-[18px] text-[var(--text-primary)]">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "safety" ? (
          <div className="grid gap-3">
            {safetyFields.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3"
              >
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {label}
                </div>
                <div className="mt-2 font-semibold font-mono text-[18px] text-[var(--text-primary)]">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "feedback" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <MessageSquarePlus size={16} />
                Add feedback
              </div>
              <div className="grid gap-3">
                <Input
                  value={feedbackLabel}
                  onChange={(event) => setFeedbackLabel(event.target.value)}
                  placeholder="Label"
                />
                <Input
                  value={feedbackScore}
                  onChange={(event) => setFeedbackScore(event.target.value)}
                  placeholder="Score 0-100"
                  type="number"
                />
                <Input
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  placeholder="Comment"
                />
                <Button
                  type="button"
                  onClick={() => createFeedbackMutation.mutate()}
                  disabled={createFeedbackMutation.isPending || !drawer.id || !feedbackTargetType}
                >
                  Save feedback
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {(feedbackQuery.data ?? []).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{entry.label}</Badge>
                      <span className="font-mono text-[12px] text-[var(--text-muted)]">
                        {entry.score}/100
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {formatTimestamp(entry.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3 text-[13px] text-[var(--text-secondary)]">
                    {entry.comment || "No comment provided."}
                  </div>
                </div>
              ))}

              {!feedbackQuery.isLoading && (feedbackQuery.data ?? []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border-color)] px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">
                  No feedback yet for this entity.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {activeTab === "json" ? (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border-color)] bg-white/[0.02] p-4 font-mono text-[12px] text-[var(--text-primary)]">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
