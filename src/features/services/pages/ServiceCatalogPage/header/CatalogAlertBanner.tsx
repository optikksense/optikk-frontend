import { ArrowRight } from "lucide-react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

import { fmtPct } from "../../ServiceDetailPage/formatters";
import type { CatalogRow } from "../catalog/buildCatalogRows";

interface CatalogAlertBannerProps {
  readonly rows: ReadonlyArray<CatalogRow>;
}

interface BannerData {
  readonly tone: "error" | "warn";
  readonly errorCount: number;
  readonly warnCount: number;
  readonly topRow: CatalogRow;
}

function pickTopRow(errorRows: CatalogRow[], warnRows: CatalogRow[]): CatalogRow | null {
  if (errorRows.length > 0) {
    return [...errorRows].sort((a, b) => b.errorRate - a.errorRate)[0] ?? null;
  }
  if (warnRows.length > 0) {
    return [...warnRows].sort((a, b) => b.p99Ms - a.p99Ms)[0] ?? null;
  }
  return null;
}

function deriveBanner(rows: ReadonlyArray<CatalogRow>): BannerData | null {
  const errorRows = rows.filter((r) => r.status === "error");
  const warnRows = rows.filter((r) => r.status === "warn");
  const topRow = pickTopRow(errorRows, warnRows);
  if (!topRow) return null;
  return {
    tone: errorRows.length > 0 ? "error" : "warn",
    errorCount: errorRows.length,
    warnCount: warnRows.length,
    topRow,
  };
}

const TONE_STYLES = {
  error: {
    surface: "bg-[var(--color-error-subtle)]",
    text: "text-[var(--color-error)]",
    dot: "bg-[var(--color-error)]",
  },
  warn: {
    surface: "bg-[var(--color-warning-subtle)]",
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
  },
} as const;

function topRowReason(row: CatalogRow): string {
  if (row.status === "error") {
    return `error rate ${fmtPct(row.errorRate, row.errorRate < 0.001 ? 3 : 2)}`;
  }
  return `p99 ${Math.round(row.p99Ms)}ms`;
}

export function CatalogAlertBanner({ rows }: CatalogAlertBannerProps) {
  const [params, setParams] = useSearchParams();
  const banner = deriveBanner(rows);
  if (!banner) return null;
  const styles = TONE_STYLES[banner.tone];
  const totalUnhealthy = banner.errorCount + banner.warnCount;
  const onViewAll = () => {
    const updated = new URLSearchParams(params);
    updated.set("status", "unhealthy");
    setParams(updated);
  };
  return (
    <div className={`flex items-center gap-3 rounded-md ${styles.surface} px-4 py-2.5`}>
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
      <div className="flex min-w-0 flex-1 items-center gap-3 text-[12px]">
        {banner.errorCount > 0 && (
          <span className={`font-semibold ${styles.text}`}>{banner.errorCount} error</span>
        )}
        {banner.warnCount > 0 && (
          <span className="font-semibold text-[var(--color-warning)]">
            {banner.warnCount} warn
          </span>
        )}
        <span className="text-[var(--text-muted)]">—</span>
        <span className="truncate text-[var(--text-primary)]">
          <span className="font-semibold">{banner.topRow.serviceName}</span>
          <span className="ml-2 text-[var(--text-muted)]">{topRowReason(banner.topRow)}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onViewAll}
        className="inline-flex shrink-0 items-center gap-1 text-[11.5px] text-[var(--color-primary)] hover:underline"
      >
        View all {totalUnhealthy}
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
