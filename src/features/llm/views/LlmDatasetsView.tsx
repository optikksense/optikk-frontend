import { Database, Download, List } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Card } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable } from "@/features/explorer-core/components";
import { cn } from "@/lib/utils";
import { useTeamId } from "@app/store/appStore";
import { ROUTES } from "@shared/constants/routes";
import { formatNumber, formatRelativeTime, formatTimestamp } from "@shared/utils/formatters";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { Link } from "@tanstack/react-router";

import { type LlmHubDataset, llmHubApi } from "../api/llmHubApi";

type DatasetRow = LlmHubDataset & Record<string, unknown>;

function downloadDatasetJson(detail: { name: string; payload_json: string }) {
  const blob = new Blob([detail.payload_json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = detail.name.replace(/[^\w.-]+/g, "_").slice(0, 64);
  a.download = `llm-dataset-${safe}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LlmDatasetsView() {
  const teamId = useTeamId();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const datasetsQuery = useStandardQuery({
    queryKey: ["llm", "hub", "datasets", teamId],
    queryFn: () => llmHubApi.listDatasets(200),
    enabled: Boolean(teamId),
    staleTime: 15_000,
  });

  const rows = useMemo(
    () => (datasetsQuery.data?.results ?? []) as DatasetRow[],
    [datasetsQuery.data?.results]
  );

  const columns = useMemo<SimpleTableColumn<DatasetRow>[]>(
    () => [
      {
        title: "Name",
        key: "name",
        dataIndex: "name",
        ellipsis: true,
        render: (value) => (
          <span className="font-medium text-[12px] text-[var(--text-primary)]">
            {String(value)}
          </span>
        ),
      },
      {
        title: "Rows",
        key: "row_count",
        dataIndex: "row_count",
        width: 80,
        render: (value) => (
          <span className="font-mono text-[12px] text-[var(--text-secondary)]">
            {formatNumber(Number(value))}
          </span>
        ),
      },
      {
        title: "Window (ms)",
        key: "window",
        width: 200,
        render: (_, row) => (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {row.start_time_ms} → {row.end_time_ms}
          </span>
        ),
      },
      {
        title: "Created",
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
        title: "",
        key: "actions",
        width: 120,
        render: (_, row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Download size={14} />}
            disabled={downloadingId === row.id}
            onClick={async () => {
              setDownloadingId(row.id);
              try {
                const detail = await llmHubApi.getDataset(row.id);
                downloadDatasetJson(detail);
                toast.success("Download started");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Download failed");
              } finally {
                setDownloadingId(null);
              }
            }}
          >
            JSON
          </Button>
        ),
      },
    ],
    [downloadingId]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <List size={16} className="text-[var(--text-muted)]" />
          Datasets
        </div>
        <Link
          to={ROUTES.llmGenerations}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[var(--card-radius)] border border-[var(--border-color)]",
            "bg-[var(--bg-tertiary)] px-3 font-medium text-[12px] text-[var(--text-primary)] shadow-[var(--shadow-sm)]",
            "hover:bg-[var(--bg-hover)]"
          )}
        >
          <Database size={14} />
          Save from Generations
        </Link>
      </div>

      <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
        Saved snapshots of generation rows (without per-row estimated cost) plus the explorer query
        string and time bounds. Use{" "}
        <span className="font-medium text-[var(--text-secondary)]">Save as dataset</span> on the
        Generations tab to create a new entry.
      </p>

      {!teamId ? (
        <Card
          padding="md"
          className="border border-[var(--border-color)] text-[13px] text-[var(--color-error)]"
        >
          Select a team to list datasets.
        </Card>
      ) : null}

      {datasetsQuery.isError ? (
        <div className="rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)] text-sm">
          Failed to load datasets.
        </div>
      ) : null}

      <ExplorerResultsTable
        title="Team datasets"
        subtitle={
          datasetsQuery.isLoading
            ? "Loading…"
            : `${formatNumber(rows.length)} datasets · download raw JSON payload`
        }
        rows={rows}
        columns={columns}
        rowKey={(row) => String(row.id)}
        isLoading={datasetsQuery.isLoading}
        page={1}
        pageSize={Math.max(rows.length, 1)}
        total={rows.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        showPagination={false}
      />

      {rows.length === 0 && !datasetsQuery.isLoading ? (
        <Card
          padding="lg"
          className="border border-[var(--border-color)] text-[13px] text-[var(--text-muted)]"
        >
          No datasets yet. Open{" "}
          <Link to={ROUTES.llmGenerations} className="text-[var(--color-primary)] hover:underline">
            Generations
          </Link>
          , tune filters, then use <Badge variant="default">Save as dataset</Badge>.
        </Card>
      ) : null}
    </div>
  );
}
