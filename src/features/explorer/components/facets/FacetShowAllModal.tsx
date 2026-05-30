import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { memo, useMemo, useState } from "react";

import type { ExplorerFacetBucket } from "../../types/queries";
import { FacetBucket } from "./FacetBucket";
import { FacetSearchBox } from "./FacetSearchBox";

interface Props {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly field: string;
  readonly label: string;
  readonly buckets: readonly ExplorerFacetBucket[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly isActive?: (field: string, value: string) => "include" | "exclude" | null;
}

function filterByQuery(
  buckets: readonly ExplorerFacetBucket[],
  query: string
): readonly ExplorerFacetBucket[] {
  if (!query) return buckets;
  const needle = query.toLowerCase();
  return buckets.filter((bucket) => bucket.value.toLowerCase().includes(needle));
}

function FacetShowAllModalComponent(props: Props) {
  const { open, onOpenChange, field, label, buckets, onInclude, onExclude, isActive } = props;
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterByQuery(buckets, query), [buckets, query]);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[480px] flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-xl"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-medium text-[13px] text-foreground">
              {label}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="rounded p-1 text-foreground-muted hover:text-foreground"
            >
              <X size={14} />
            </Dialog.Close>
          </div>
          <FacetSearchBox value={query} onChange={setQuery} />
          <div className="flex flex-col gap-0.5 overflow-y-auto">
            {filtered.map((bucket) => (
              <FacetBucket
                key={bucket.value}
                field={field}
                bucket={bucket}
                onInclude={onInclude}
                onExclude={onExclude}
                active={isActive?.(field, bucket.value) ?? null}
              />
            ))}
            {filtered.length === 0 ? (
              <span className="px-2 py-4 text-center text-[12px] text-foreground-muted">
                No matches
              </span>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const FacetShowAllModal = memo(FacetShowAllModalComponent);
