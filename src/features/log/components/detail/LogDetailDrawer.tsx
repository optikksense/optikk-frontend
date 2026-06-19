import { ExternalLink, GitFork, ScrollText, Waypoints } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import {
  type DrawerAttrGroup,
  DrawerAttrTable,
  DrawerHeader,
  DrawerJson,
  DrawerSection,
  DrawerShell,
  DrawerTabs,
} from "@shared/components/ui/overlay/detail-drawer";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { formatRelativeTime } from "@shared/utils/formatters";
import { useNavigate } from "@tanstack/react-router";

import { getLogById } from "../../api/logsExplorerApi";
import { getTraceLogs } from "../../api/traceLogsApi";
import type { LogRecord } from "../../types/log";
import { serviceSwatchColor } from "../../utils/serviceHue";
import { severityStyle } from "../../utils/severity";
import { getSpanId, getTraceId } from "../../utils/traceCorrelation";

interface Props {
  readonly logId: string;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
}

type LogTab = "event" | "json" | "related";

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function buildAttrGroups(log: LogRecord, sevLabel: string, sevColor: string): DrawerAttrGroup[] {
  const traceId = getTraceId(log);
  const spanId = getSpanId(log);

  const source: DrawerAttrGroup = {
    label: "Source",
    rows: [
      ["service.name", log.service_name, "var(--accent-2)"],
      ...(log.environment ? ([["env", log.environment]] as const) : []),
      ...(log.scope_name ? ([["scope.name", log.scope_name]] as const) : []),
      ...(log.scope_version ? ([["scope.version", log.scope_version]] as const) : []),
    ],
  };

  const severity: DrawerAttrGroup = {
    label: "Severity",
    rows: [
      ["severity_text", log.severity_text ?? sevLabel, sevColor],
      ["severity_bucket", String(log.severity_bucket)],
    ],
  };

  const infra: DrawerAttrGroup = {
    label: "Infrastructure",
    rows: [
      ...(log.host ? ([["host", log.host]] as const) : []),
      ...(log.pod ? ([["pod", log.pod]] as const) : []),
      ...(log.container ? ([["container", log.container]] as const) : []),
    ],
  };

  const trace: DrawerAttrGroup = {
    label: "Trace",
    rows: traceId
      ? [
          ["trace.id", traceId, "var(--accent-2)"],
          ...(spanId ? ([["span.id", spanId]] as const) : []),
        ]
      : [["has_trace", "false", "var(--fg-3)"]],
  };

  const dynamic: [string, string][] = [
    ...Object.entries(log.attributes_string ?? {}),
    ...Object.entries(log.attributes_number ?? {}).map(
      ([k, v]) => [k, String(v)] as [string, string]
    ),
    ...Object.entries(log.attributes_bool ?? {}).map(
      ([k, v]) => [k, v ? "true" : "false"] as [string, string]
    ),
  ].sort(([a], [b]) => a.localeCompare(b));

  const attributes: DrawerAttrGroup = { label: "Attributes", rows: dynamic };

  return [source, severity, infra, trace, attributes].filter((g) => g.rows.length > 0);
}

function LogDetailDrawerComponent({ logId, open, onClose, onPrev, onNext }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<LogTab>("event");
  useEffect(() => {
    if (open) setTab("event");
  }, [open]);

  const q = useStandardQuery({
    queryKey: ["logs", "detail", logId],
    queryFn: () => getLogById(logId),
    enabled: Boolean(logId) && open,
    staleTime: 30_000,
  });

  const log = q.data?.log;
  const traceId = log ? getTraceId(log) : null;

  const relatedQuery = useStandardQuery({
    queryKey: ["logs", "trace", traceId],
    queryFn: () => getTraceLogs(traceId as string),
    enabled: open && tab === "related" && Boolean(traceId),
    staleTime: 30_000,
  });

  const sev = severityStyle(log?.severity_bucket);
  const attrGroups = useMemo(
    () => (log ? buildAttrGroups(log, sev.label, sev.color) : []),
    [log, sev.label, sev.color]
  );

  const relatedCount = relatedQuery.data?.logs.length;

  const footer = (
    <>
      <button
        type="button"
        disabled={!onPrev}
        onClick={onPrev}
        className="inline-flex h-[30px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-[var(--line)] bg-[var(--bg-card)] px-2.5 text-[12px] text-[var(--fg-1)] hover:bg-[var(--bg-inset)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Prev
      </button>
      <button
        type="button"
        disabled={!onNext}
        onClick={onNext}
        className="inline-flex h-[30px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-[var(--line)] bg-[var(--bg-card)] px-2.5 text-[12px] text-[var(--fg-1)] hover:bg-[var(--bg-inset)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
      {traceId && (
        <button
          type="button"
          onClick={() => navigate({ to: `/traces/${encodeURIComponent(traceId)}` })}
          className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--accent)] px-3 text-[12px] text-[var(--accent-fg,oklch(0.99_0.005_270))] hover:bg-[var(--accent-2)]"
        >
          <Waypoints size={13} /> Open trace
        </button>
      )}
    </>
  );

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      width="min(560px, calc(100vw - 24px))"
      footer={footer}
    >
      <DrawerHeader onClose={onClose}>
        {log ? (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-bold font-mono text-[11px]"
                style={{
                  color: sev.color,
                  borderColor: sev.color,
                  background: "var(--bg-card)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: sev.color }} />
                {sev.shortLabel}
              </span>
              {log.environment && (
                <span className="rounded-md border border-[var(--line)] bg-[var(--bg-inset)] px-2 py-0.5 font-mono text-[11px] text-[var(--fg-3)]">
                  {log.environment}
                </span>
              )}
            </div>
            <div className="line-clamp-2 break-words font-mono font-semibold text-[14px] text-[var(--fg-0)] leading-[1.4]">
              {log.body || "—"}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[12.5px] text-[var(--fg-3)]">
              <span>{formatTime(log.timestamp)}</span>
              <span>·</span>
              <span style={{ color: serviceSwatchColor(log.service_name) }}>
                {log.service_name}
              </span>
              {log.host && (
                <>
                  <span>·</span>
                  <span>{log.host}</span>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="font-semibold text-[14px] text-[var(--fg-0)]">Log detail</div>
        )}
      </DrawerHeader>

      <DrawerTabs
        tabs={[
          { id: "event", label: "Event" },
          { id: "json", label: "JSON" },
          { id: "related", label: "Related", badge: traceId ? (relatedCount ?? null) : null },
        ]}
        active={tab}
        onChange={(id) => setTab(id as LogTab)}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-4">
        {q.isPending ? (
          <div className="py-4 text-[13px] text-[var(--fg-3)]">Loading log…</div>
        ) : q.isError ? (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-[13px] text-[var(--err-fg)]">Could not load log</p>
            <pre className="text-[11px] text-[var(--fg-3)]">{formatErrorForDisplay(q.error)}</pre>
          </div>
        ) : !log ? (
          <div className="py-4 text-[13px] text-[var(--fg-3)]">No data</div>
        ) : (
          <>
            {tab === "event" && (
              <>
                <DrawerSection title="Message">
                  <div className="whitespace-pre-wrap break-words rounded-lg border border-[var(--line-2)] bg-[var(--bg-inset)] p-[12px_14px] font-mono text-[13px] text-[var(--fg-0)] leading-[1.55]">
                    {log.body || "—"}
                  </div>
                </DrawerSection>

                {traceId && (
                  <DrawerSection title="Correlated trace">
                    <button
                      type="button"
                      onClick={() => navigate({ to: `/traces/${encodeURIComponent(traceId)}` })}
                      className="flex w-full items-center gap-3 rounded-lg border border-[var(--accent-ln)] bg-[var(--accent-bg)] p-[11px_13px] text-left"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--bg-card)] text-[var(--accent-2)]">
                        <GitFork size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono font-semibold text-[13px] text-[var(--accent-2)]">
                          {traceId}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-[var(--fg-3)]">
                          Open the distributed trace for this log
                        </span>
                      </span>
                      <ExternalLink size={13} className="text-[var(--fg-3)]" />
                    </button>
                  </DrawerSection>
                )}

                <DrawerSection title="Attributes">
                  <DrawerAttrTable groups={attrGroups} />
                </DrawerSection>
              </>
            )}

            {tab === "json" && <DrawerJson data={log} />}

            {tab === "related" &&
              (!traceId ? (
                <div className="rounded-lg border border-[var(--line)] p-3 text-[12px] text-[var(--fg-3)]">
                  This log has no trace correlation, so there are no related logs to show.
                </div>
              ) : (
                <DrawerSection
                  title="Logs in this trace"
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(`trace_id:${traceId}`);
                        toast.success("Trace filter copied — paste into search");
                      }}
                      className="cursor-pointer border-0 bg-transparent font-mono text-[12px] text-[var(--accent-2)]"
                    >
                      copy filter
                    </button>
                  }
                >
                  {relatedQuery.isPending ? (
                    <div className="py-2 text-[12px] text-[var(--fg-3)]">Loading trace logs…</div>
                  ) : (relatedQuery.data?.logs.length ?? 0) === 0 ? (
                    <div className="py-2 text-[12px] text-[var(--fg-3)]">
                      No other logs found in this trace.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {relatedQuery.data?.logs.map((l, i) => {
                        const lsev = severityStyle(l.severity_bucket);
                        const isSelf = l.id === log.id;
                        return (
                          <div
                            key={l.id || `${l.timestamp}-${i}`}
                            className="flex items-start gap-2 rounded-md border p-[7px_9px]"
                            style={{
                              background: isSelf ? "var(--accent-bg)" : "var(--bg-card)",
                              borderColor: isSelf ? "var(--accent-ln)" : "var(--line-2)",
                            }}
                          >
                            <span
                              className="mt-0.5 h-3 w-0.5 shrink-0 rounded-full"
                              style={{ background: lsev.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-mono font-semibold text-[11px]"
                                  style={{ color: lsev.color }}
                                >
                                  {lsev.shortLabel}
                                </span>
                                <span className="font-mono text-[11px] text-[var(--fg-3)]">
                                  {formatRelativeTime(String(l.timestamp))}
                                </span>
                                {isSelf && (
                                  <span className="rounded bg-[var(--bg-inset)] px-1.5 text-[10px] text-[var(--fg-2)]">
                                    this event
                                  </span>
                                )}
                              </div>
                              <div className="truncate font-mono text-[12.5px] text-[var(--fg-0)]">
                                {l.body || "—"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </DrawerSection>
              ))}
          </>
        )}
      </div>
    </DrawerShell>
  );
}

export const LogDetailDrawer = memo(LogDetailDrawerComponent);
