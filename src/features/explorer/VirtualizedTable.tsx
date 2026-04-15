import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useMemo, useRef } from "react"

import { Badge } from "@/design-system/badge"
import { Card } from "@/design-system/card"

import type { ExplorerRecord } from "@/features/explorer/mock-data"

export function VirtualizedTable({ rows }: { readonly rows: ExplorerRecord[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null)
  const columns = useMemo<ColumnDef<ExplorerRecord>[]>(
    () => [
      { accessorKey: "primary", header: "Entity" },
      { accessorKey: "secondary", header: "Scope" },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <Badge tone={mapTone(String(info.getValue()))}>{String(info.getValue())}</Badge>
        ),
      },
      { accessorKey: "value", header: "Value" },
    ],
    [],
  )

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 48,
    getScrollElement: () => parentRef.current,
    overscan: 10,
  })
  const virtualRows = virtualizer.getVirtualItems()

  return (
    <Card className="space-y-3">
      <div className="text-sm font-medium">Virtualized explorer table</div>
      <div className="grid grid-cols-4 gap-3 border-b border-border pb-3 text-xs uppercase text-muted">
        {table.getFlatHeaders().map((header) => (
          <div key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ))}
      </div>
      <div ref={parentRef} className="h-[360px] overflow-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {virtualRows.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index]
            return (
              <div
                key={row.id}
                className="absolute left-0 right-0 grid grid-cols-4 gap-3 border-b border-border/40 px-1 py-3 text-sm"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

function mapTone(status: string) {
  if (status === "error") {
    return "danger"
  }
  if (status === "warning") {
    return "warning"
  }
  return "success"
}
