import type { Column } from "./types";

export function CompactTable<Row extends { id: string }>({
  columns,
  emptyText,
  rows,
}: {
  columns: readonly Column<Row>[];
  emptyText: string;
  rows: readonly Row[];
}) {
  if (rows.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">{emptyText}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-[var(--border-color)] border-b text-[var(--text-muted)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-2 py-2 font-medium"
                style={{ textAlign: column.align ?? "left" }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-[var(--border-color)] border-b last:border-b-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-2 py-2 text-[var(--text-primary)]"
                  style={{ textAlign: column.align ?? "left" }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
