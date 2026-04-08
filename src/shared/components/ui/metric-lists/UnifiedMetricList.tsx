import type { ReactNode } from "react";

interface UnifiedMetricListColumn<ItemType> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render: (item: ItemType) => ReactNode;
}

interface UnifiedMetricListProps<ItemType> {
  title?: ReactNode;
  items: ItemType[];
  columns: Array<UnifiedMetricListColumn<ItemType>>;
  rowKey: (item: ItemType, index: number) => string;
  emptyDescription?: string;
  className?: string;
}

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.items
 * @param root0.columns
 * @param root0.rowKey
 * @param root0.emptyDescription
 * @param root0.className
 */
export default function UnifiedMetricList<ItemType>({
  title,
  items,
  columns,
  rowKey,
  emptyDescription = "No data in selected time range",
  className = "",
}: UnifiedMetricListProps<ItemType>) {
  if (!items || items.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        {emptyDescription}
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <div style={{ marginBottom: 8 }}>{title}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align || "left",
                  padding: "8px 10px",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={rowKey(item, index)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    textAlign: column.align || "left",
                    padding: "8px 10px",
                    fontSize: 12,
                    borderTop: "1px solid var(--border-color)",
                  }}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
