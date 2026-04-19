import { ClipboardList, ExternalLink, List, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Card } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable } from "@/features/explorer-core/components";
import { useCursorPagination } from "@/features/explorer-core/hooks/useCursorPagination";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useTeamId, useTimeRange } from "@app/store/appStore";
import { traceDetailHref } from "@shared/observability/deepLinks";
import { formatNumber, formatRelativeTime, formatTimestamp } from "@shared/utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { Link, useNavigate } from "@tanstack/react-router";

import { type LlmHubScore, llmHubApi } from "../api/llmHubApi";

type ScoreRow = LlmHubScore & Record<string, unknown>;

export default function LlmScoresView() {
  const navigate = useNavigate();
  const teamId = useTeamId();
  const timeRange = useTimeRange();
  const queryClient = useQueryClient();

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const [nameFilter, setNameFilter] = useState("");
  const [traceFilter, setTraceFilter] = useState("");
  const { cursor, goNext, goPrev, reset: resetCursor, hasPrev } = useCursorPagination();
  const [pageSize, setPageSize] = useState(25);

  const [formName, setFormName] = useState("quality");
  const [formValue, setFormValue] = useState("1");
  const [formTraceId, setFormTraceId] = useState("");
  const [formSpanId, setFormSpanId] = useState("");
  const [formSource, setFormSource] = useState("manual");

  const nameQ = nameFilter.trim();
  const traceQ = traceFilter.trim();

  useEffect(() => {
    resetCursor();
  }, [nameQ, traceQ, startTime, endTime, pageSize, resetCursor]);

  const scoresQuery = useStandardQuery({
    queryKey: ["llm", "hub", "scores", teamId, startTime, endTime, nameQ, traceQ, cursor, pageSize],
    queryFn: () =>
      llmHubApi.listScores({
        startTime,
        endTime,
        limit: pageSize,
        cursor: cursor || undefined,
        name: nameQ || undefined,
        traceId: traceQ || undefined,
      }),
    enabled: Boolean(teamId),
    placeholderData: (p) => p,
  });

  const createMutation = useMutation({
    mutationFn: llmHubApi.createScore,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "scores"] });
      toast.success("Score recorded");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to create score");
    },
  });

  const columns = useMemo<SimpleTableColumn<ScoreRow>[]>(
    () => [
      {
        title: "Time",
        key: "created_at",
        dataIndex: "created_at",
        width: 168,
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
        title: "Name",
        key: "name",
        dataIndex: "name",
        width: 140,
        ellipsis: true,
        render: (value) => (
          <span className="font-medium text-[12px] text-[var(--text-primary)]">
            {String(value)}
          </span>
        ),
      },
      {
        title: "Value",
        key: "value",
        dataIndex: "value",
        width: 80,
        render: (value) => (
          <span className="font-mono text-[12px] text-[var(--text-secondary)]">
            {String(value)}
          </span>
        ),
      },
      {
        title: "Source",
        key: "source",
        dataIndex: "source",
        width: 100,
        render: (value) => (
          <Badge variant="default" className="text-[10px]">
            {String(value || "—")}
          </Badge>
        ),
      },
      {
        title: "Trace",
        key: "trace_id",
        dataIndex: "trace_id",
        ellipsis: true,
        render: (value) => {
          const tid = String(value);
          return (
            <button
              type="button"
              className="inline-flex max-w-full items-center gap-1 font-mono text-[11px] text-[var(--color-primary)] hover:underline"
              onClick={() => {
                void navigate({ to: traceDetailHref(tid) as never });
              }}
            >
              <span className="truncate">{tid}</span>
              <ExternalLink size={12} className="shrink-0 opacity-70" />
            </button>
          );
        },
      },
      {
        title: "Span",
        key: "span_id",
        dataIndex: "span_id",
        width: 120,
        ellipsis: true,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {String(value || "—")}
          </span>
        ),
      },
      {
        title: "Model",
        key: "model",
        dataIndex: "model",
        width: 130,
        ellipsis: true,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {String(value || "—")}
          </span>
        ),
      },
    ],
    [navigate]
  );

  const rows = useMemo(
    () => (scoresQuery.data?.results ?? []) as ScoreRow[],
    [scoresQuery.data?.results]
  );
  const hasMore = Boolean(scoresQuery.data?.pageInfo?.hasMore);
  const nextCursor = scoresQuery.data?.pageInfo?.nextCursor ?? "";

  const resetFilters = () => {
    setNameFilter("");
    setTraceFilter("");
    resetCursor();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <List size={16} className="text-[var(--text-muted)]" />
          Scores
        </div>
        <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={resetFilters}>
          Reset filters
        </Button>
      </div>

      <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
        List and record evaluation scores for this team. Time window matches the{" "}
        <span className="font-medium text-[var(--text-secondary)]">global time range</span> in the
        header. Open a{" "}
        <Link to="/llm/generations" className="text-[var(--color-primary)] hover:underline">
          generation
        </Link>{" "}
        to copy trace and span ids.
      </p>

      {!teamId ? (
        <Card
          padding="md"
          className="border border-[var(--border-color)] text-[13px] text-[var(--color-error)]"
        >
          Select a team to load scores.
        </Card>
      ) : null}

      <Card padding="lg" className="border border-[var(--border-color)]">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <ClipboardList size={16} className="text-[var(--text-muted)]" />
          Record a score
        </div>
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(formValue);
            if (!Number.isFinite(value)) {
              toast.error("Value must be a number.");
              return;
            }
            const traceId = formTraceId.trim();
            if (!traceId) {
              toast.error("Trace id is required.");
              return;
            }
            createMutation.mutate({
              name: formName.trim() || "score",
              value,
              trace_id: traceId,
              span_id: formSpanId.trim() || undefined,
              source: formSource.trim() || "manual",
            });
          }}
        >
          <label className="flex min-w-[120px] flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Name</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
              value={formName}
              onChange={(ev) => setFormName(ev.target.value)}
            />
          </label>
          <label className="flex w-[88px] flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Value</span>
            <input
              type="number"
              step="any"
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
              value={formValue}
              onChange={(ev) => setFormValue(ev.target.value)}
            />
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Trace id</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[11px] text-[var(--text-primary)]"
              value={formTraceId}
              onChange={(ev) => setFormTraceId(ev.target.value)}
              placeholder="32-char hex…"
            />
          </label>
          <label className="flex min-w-[140px] flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Span id (opt.)</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[11px] text-[var(--text-primary)]"
              value={formSpanId}
              onChange={(ev) => setFormSpanId(ev.target.value)}
            />
          </label>
          <label className="flex min-w-[120px] flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Source</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[12px] text-[var(--text-primary)]"
              value={formSource}
              onChange={(ev) => setFormSource(ev.target.value)}
            />
          </label>
          <Button type="submit" variant="primary" size="sm" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving…" : "Submit"}
          </Button>
        </form>
      </Card>

      <Card padding="lg" className="border border-[var(--border-color)]">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[160px] flex-1 flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Filter by score name</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[12px] text-[var(--text-primary)]"
              value={nameFilter}
              onChange={(ev) => setNameFilter(ev.target.value)}
              placeholder="e.g. quality"
            />
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Filter by trace id</span>
            <input
              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 font-mono text-[11px] text-[var(--text-primary)]"
              value={traceFilter}
              onChange={(ev) => setTraceFilter(ev.target.value)}
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          Range: {formatTimestamp(new Date(startTime).toISOString())} —{" "}
          {formatTimestamp(new Date(endTime).toISOString())}
        </p>
      </Card>

      {scoresQuery.isError ? (
        <div className="rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)] text-sm">
          Failed to load scores. Ensure the LLM hub tables exist on the API database.
        </div>
      ) : null}

      <ExplorerResultsTable
        title="Scores in range"
        subtitle={`${formatNumber(rows.length)} rows${hasMore ? " — more available" : ""}`}
        rows={rows}
        columns={columns}
        rowKey={(row) => String(row.id)}
        isLoading={scoresQuery.isLoading}
        pagination={{
          hasMore,
          hasPrev,
          onNext: () => goNext(nextCursor),
          onPrev: goPrev,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
