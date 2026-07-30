import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import {
  type QueryPatternsPage,
  buildDatabaseQueryBody,
  queryDatabasePatterns,
} from "@/features/saturation/api/databaseQueriesExplorerApi";
import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { DatabaseExplorerNav } from "@/features/saturation/components/DatabaseExplorerNav";
import { DatabaseQueriesTable } from "@/features/saturation/pages/SaturationDatabasePage/list/DatabaseQueriesTable";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";
import { ROUTES } from "@/shared/constants/routes";
import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import { ExplorerTableFooter } from "@shared/search/components/chrome/ExplorerTableFooter";
import { SearchTranslationNotice } from "@shared/search/components/chrome/SearchTranslationNotice";
import { useCursorPager } from "@shared/search/hooks/useCursorPager";
import { useExplorerKeyboard } from "@shared/search/hooks/useExplorerKeyboard";
import { useExplorerQuery } from "@shared/search/hooks/useExplorerQuery";
import { useExplorerState } from "@shared/search/hooks/useExplorerState";

const PAGE_SIZE = 25;
const NO_INCLUDES = [] as const;

export default function SaturationDatabaseQueriesPage() {
  const navigate = useNavigate();
  const state = useExplorerState();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const query = useExplorerQuery<QueryPatternsPage>({
    scope: "database-queries",
    filters: state.filters,
    cursor: state.cursor,
    limit: PAGE_SIZE,
    include: NO_INCLUDES,
    fetcher: queryDatabasePatterns,
  });
  const rows = query.data?.rows ?? [];
  const pager = useCursorPager(state, query.data?.nextCursor);
  const warnings = buildDatabaseQueryBody({
    startTime: query.startTime,
    endTime: query.endTime,
    filters: state.filters,
    cursor: state.cursor ?? undefined,
    limit: PAGE_SIZE,
  }).warnings;

  const onOpen = (row: SlowQueryPatternRow) => {
    navigate({
      to: ROUTES.databaseQuery.replace(
        "$queryId",
        row.queryHash || queryFingerprintId(row)
      ) as never,
      search: {
        dbSystem: row.dbSystem || undefined,
        collection: row.collectionName || undefined,
        namespace: row.namespace || undefined,
        server: row.server || undefined,
      } as never,
    });
  };

  useExplorerKeyboard({ onSearchFocus: () => searchInputRef.current?.focus() });

  return (
    <ExplorerLayout
      header={
        <>
          <ExplorerHeader
            ref={searchInputRef}
            scope="database-queries"
            filters={state.filters}
            onChangeFilters={state.setFilters}
            searchPlaceholder='Search queries: dbSystem:postgresql p99Ms:>=500 "select users"'
            actions={<DatabaseExplorerNav active="queries" />}
          />
          <SearchTranslationNotice warnings={warnings} />
        </>
      }
      content={
        <div className="flex flex-col">
          {query.error ? (
            <div
              className="mb-4 flex items-center justify-between gap-3 rounded-md border border-error bg-error-subtle px-3 py-2 text-error text-sm"
              role="alert"
            >
              <span>Could not load database queries: {query.error.message}</span>
              <button
                type="button"
                className="shrink-0 font-medium text-primary hover:underline"
                onClick={() => void query.refetch()}
              >
                Retry
              </button>
            </div>
          ) : null}

          <DatabaseQueriesTable
            rows={rows}
            loading={query.isPending && !query.data}
            onOpen={onOpen}
          />
          <ExplorerTableFooter
            rowCount={rows.length}
            noun={rows.length === 1 ? "query" : "queries"}
            onNextPage={pager.onNextPage}
            onPrevPage={pager.onPrevPage}
            hasNextPage={pager.hasNextPage}
            hasPrevPage={pager.hasPrevPage}
          />
        </div>
      }
    />
  );
}
