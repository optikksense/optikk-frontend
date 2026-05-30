import { memo } from "react";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";

interface Props<RowType extends object> {
  eyebrow: string;
  title: string;
  rows: RowType[];
  columns: SimpleTableColumn<RowType>[];
  rowKey: Parameters<typeof SimpleTable<RowType>>[0]["rowKey"];
  pageSize?: number;
  scrollX?: number;
  rightAdornment?: React.ReactNode;
}

function DatastoreTableCardInner<RowType extends object>({
  eyebrow,
  title,
  rows,
  columns,
  rowKey,
  pageSize = 8,
  scrollX = 640,
  rightAdornment,
}: Props<RowType>) {
  return (
    <PageSurface padding="lg">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] text-foreground-muted uppercase tracking-[0.08em]">
            {eyebrow}
          </div>
          <div className="mt-2 font-semibold text-[18px] text-foreground">{title}</div>
        </div>
        {rightAdornment}
      </div>
      <SimpleTable
        dataSource={rows}
        columns={columns}
        rowKey={rowKey}
        pagination={{ pageSize }}
        scroll={{ x: scrollX }}
      />
    </PageSurface>
  );
}

export const DatastoreTableCard = memo(DatastoreTableCardInner) as typeof DatastoreTableCardInner;
