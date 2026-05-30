import { memo } from "react";

import { formatTimestamp } from "@shared/utils/formatters";

import { SLOW_QUERY_COLUMNS } from "../../columns";
import type { useDatastoreData } from "../../hooks/useDatastoreData";
import { DatastoreTableCard } from "../DatastoreTableCard";

type Bundle = ReturnType<typeof useDatastoreData>;

function SlowQueriesTableComponent({ bundle }: { bundle: Bundle }) {
  return (
    <DatastoreTableCard
      eyebrow="Slow Queries"
      title="Highest-latency query patterns"
      rows={bundle.slowQueriesQuery.data ?? []}
      columns={SLOW_QUERY_COLUMNS}
      rowKey={(row, index) => `${row.collection_name}-${index}`}
      pageSize={10}
      scrollX={980}
      rightAdornment={
        <div className="text-[11px] text-foreground-muted">
          Updated {formatTimestamp(Date.now())}
        </div>
      }
    />
  );
}

export const SlowQueriesTable = memo(SlowQueriesTableComponent);
