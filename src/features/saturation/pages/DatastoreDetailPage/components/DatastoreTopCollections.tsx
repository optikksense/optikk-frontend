import { memo } from "react";

import { formatDuration, formatNumber } from "@shared/utils/formatters";

import type { DatastoreOverview } from "../../../api/saturationApi";

type Collection = NonNullable<DatastoreOverview["top_collections"]>[number];

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-2)] px-4 py-3">
      <div className="font-medium text-[var(--text-primary)]">{collection.collection_name}</div>
      <div className="mt-2 text-[12px] text-[var(--text-secondary)]">
        {formatDuration(collection.p99_ms)} p99 • {formatNumber(collection.ops_per_sec)} ops/s
      </div>
    </div>
  );
}

function DatastoreTopCollectionsComponent({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) return null;
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.collection_name} collection={collection} />
      ))}
    </div>
  );
}

export const DatastoreTopCollections = memo(DatastoreTopCollectionsComponent);
