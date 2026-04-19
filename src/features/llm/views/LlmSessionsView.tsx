import { Activity, List, RotateCcw } from "lucide-react";
import { useMemo } from "react";

import { Button, Switch } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable } from "@/features/explorer-core/components";
import { cn } from "@/lib/utils";
import { ObservabilityQueryBar, PageSurface } from "@shared/components/ui";
import { ROUTES } from "@shared/constants/routes";
import type { StructuredFilter } from "@shared/hooks/useURLFilters";
import { formatNumber, formatRelativeTime, formatTimestamp } from "@shared/utils/formatters";
import { Link } from "@tanstack/react-router";

import { LLM_FILTER_FIELDS } from "../constants";
import { useLlmSessions } from "../hooks/useLlmSessions";
import type { LlmSessionRecord } from "../types";

type SessionRow = LlmSessionRecord & Record<string, unknown>;

export default function LlmSessionsView() {
  const {
    isPending: isLoading,
    isError,
    sessions,
    errorsOnly,
    pageSize,
    hasMore,
    hasPrev,
    onNext,
    onPrev,
    filters,
    setFilters,
    setErrorsOnly,
    setPageSize,
    resetCursor,
    clearAll,
  } = useLlmSessions();

  const columns = useMemo<SimpleTableColumn<SessionRow>[]>(
    () => [
      {
        title: "Session ID",
        key: "session_id",
        dataIndex: "session_id",
        ellipsis: true,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-primary)]">{String(value)}</span>
        ),
      },
      {
        title: "Generations",
        key: "generation_count",
        dataIndex: "generation_count",
        width: 110,
        render: (value) => formatNumber(Number(value)),
      },
      {
        title: "Traces",
        key: "trace_count",
        dataIndex: "trace_count",
        width: 90,
        render: (value) => formatNumber(Number(value)),
      },
      {
        title: "Last activity",
        key: "last_start",
        dataIndex: "last_start",
        width: 200,
        render: (value) => (
          <div className="space-y-0.5">
            <div className="text-[12px] text-[var(--text-primary)]">
              {formatTimestamp(String(value))}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {formatRelativeTime(String(value))}
            </div>
          </div>
        ),
      },
      {
        title: "Errors",
        key: "error_count",
        dataIndex: "error_count",
        width: 80,
        render: (value) => (
          <span className={Number(value) > 0 ? "text-[var(--color-error)]" : ""}>
            {formatNumber(Number(value))}
          </span>
        ),
      },
      {
        title: "Model",
        key: "dominant_model",
        dataIndex: "dominant_model",
        width: 160,
        ellipsis: true,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {String(value || "—")}
          </span>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 130,
        render: (_, row) => (
          <Link
            to={ROUTES.llmGenerations}
            search={{ session: row.session_id }}
            className="font-medium text-[12px] text-[var(--color-primary)] hover:underline"
          >
            Open generations
          </Link>
        ),
      },
    ],
    []
  );

  const rows = useMemo(() => sessions as SessionRow[], [sessions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <List size={16} className="text-[var(--text-muted)]" />
          Sessions
        </div>
        <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={clearAll}>
          Reset
        </Button>
      </div>

      <PageSurface padding="lg" className="relative z-[40]">
        <div className="mb-4 space-y-3">
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
            Groups GenAI spans by <span className="font-mono">gen_ai.session.id</span>, then{" "}
            <span className="font-mono">gen_ai.conversation.id</span>, then{" "}
            <span className="font-mono">session.id</span>. Spans without any of these are omitted.
          </p>
          <ObservabilityQueryBar
            fields={LLM_FILTER_FIELDS.filter((f) => f.key !== "session")}
            filters={filters}
            setFilters={(nextFilters: StructuredFilter[]) => {
              setFilters(nextFilters);
              resetCursor();
            }}
            onClearAll={clearAll}
            placeholder="Filter sessions: provider:openai AND model:gpt-4o"
            rightSlot={
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                  errorsOnly
                    ? "border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] text-[var(--color-error)]"
                    : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                )}
              >
                <Activity size={13} />
                Errors only
                <Switch
                  size="sm"
                  checked={errorsOnly}
                  onChange={(event) => {
                    setErrorsOnly(event.target.checked);
                    resetCursor();
                  }}
                />
              </div>
            }
          />
        </div>
      </PageSurface>

      {isError ? (
        <div className="rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)] text-sm">
          Failed to load sessions.
        </div>
      ) : null}

      <ExplorerResultsTable
        title="Sessions in range"
        subtitle={`${formatNumber(rows.length)} rows${hasMore ? " — more available" : ""}`}
        rows={rows}
        columns={columns}
        rowKey={(row) => row.session_id}
        isLoading={isLoading}
        pagination={{
          hasMore,
          hasPrev,
          onNext,
          onPrev,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
