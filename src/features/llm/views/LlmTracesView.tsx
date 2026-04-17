import { ExternalLink, GitBranch, List } from "lucide-react";
import { useMemo } from "react";

import { Button, Card } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable } from "@/features/explorer-core/components";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useTimeRange } from "@app/store/appStore";
import { ROUTES } from "@shared/constants/routes";
import {
  buildTracesHubHref,
  genAiSystemSearchFilter,
  traceDetailHref,
} from "@shared/observability/deepLinks";
import { Link, useNavigate } from "@tanstack/react-router";

import { useLlmExplorer } from "../hooks/useLlmExplorer";

type TraceRow = {
  traceId: string;
  [key: string]: unknown;
};

export default function LlmTracesView() {
  const navigate = useNavigate();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const { generations, isPending: isLoading } = useLlmExplorer();

  const genAiTracesHref = useMemo(
    () =>
      buildTracesHubHref({
        filters: [genAiSystemSearchFilter()],
        fromMs: startTime,
        toMs: endTime,
      }),
    [startTime, endTime]
  );

  const rows = useMemo<TraceRow[]>(() => {
    const seen = new Set<string>();
    const out: TraceRow[] = [];
    for (const g of generations) {
      const id = g.trace_id;
      if (id && !seen.has(id)) {
        seen.add(id);
        out.push({ traceId: id });
      }
    }
    return out;
  }, [generations]);

  const columns = useMemo<SimpleTableColumn<TraceRow>[]>(
    () => [
      {
        title: "Trace ID",
        key: "traceId",
        dataIndex: "traceId",
        ellipsis: true,
        render: (value) => (
          <span className="font-mono text-[12px] text-[var(--text-primary)]">{String(value)}</span>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 200,
        render: (_, row) => (
          <div className="flex flex-wrap gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigate({ to: traceDetailHref(row.traceId) as never });
              }}
            >
              Open trace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<ExternalLink size={14} />}
              onClick={() => {
                void navigate({
                  to: buildTracesHubHref({
                    filters: [{ field: "trace_id", operator: "equals", value: row.traceId }],
                    fromMs: startTime,
                    toMs: endTime,
                  }) as never,
                });
              }}
            >
              In Traces
            </Button>
          </div>
        ),
      },
    ],
    [navigate, startTime, endTime]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <List size={16} className="text-[var(--text-muted)]" />
          Trace lens
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<GitBranch size={14} />}
          onClick={() => {
            void navigate({ to: genAiTracesHref as never });
          }}
        >
          All GenAI spans in Traces
        </Button>
      </div>

      <Card padding="lg" className="border border-[var(--border-color)]">
        <h2 className="font-semibold text-[14px] text-[var(--text-primary)]">
          How this view works
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-[12px] text-[var(--text-muted)] leading-relaxed">
          <li>
            <span className="font-medium text-[var(--text-secondary)]">Today:</span> unique trace
            IDs from the current{" "}
            <strong className="font-medium text-[var(--text-secondary)]">Generations</strong> result
            page (same filters and time range as the LLM hub). Paginate Generations to load more
            traces here.
          </li>
          <li>
            <span className="font-medium text-[var(--text-secondary)]">Full session grouping</span>{" "}
            is on the roadmap; use the{" "}
            <Link to={ROUTES.llmSessions} className="text-[var(--color-primary)] hover:underline">
              Sessions
            </Link>{" "}
            tab for conversation-style grouping today.
          </li>
          <li>
            On <strong className="font-medium text-[var(--text-secondary)]">Generations</strong>,
            open any row to the detail drawer —{" "}
            <strong className="font-medium text-[var(--text-secondary)]">View full trace</strong> is
            always there. Rows also have a quick{" "}
            <strong className="font-medium text-[var(--text-secondary)]">Trace</strong> action in
            the table.
          </li>
          <li>
            For ad-hoc exploration across <em>all</em> spans (not just the current generations
            page), open{" "}
            <button
              type="button"
              className="font-medium text-[var(--color-primary)] hover:underline"
              onClick={() => {
                void navigate({ to: genAiTracesHref as never });
              }}
            >
              Traces with @gen_ai.system:*
            </button>{" "}
            (uses the same global time range when linked from here).
          </li>
        </ul>
      </Card>

      <ExplorerResultsTable
        title="Traces in current Generations page"
        subtitle={`${rows.length} unique trace IDs from loaded generation rows · open Generations to change filters or page`}
        rows={rows}
        columns={columns}
        rowKey={(row) => row.traceId}
        isLoading={isLoading}
        page={1}
        pageSize={Math.max(rows.length, 1)}
        total={rows.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        showPagination={false}
      />
    </div>
  );
}
