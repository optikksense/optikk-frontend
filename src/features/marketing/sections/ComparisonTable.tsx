export interface ComparisonTableSection {
  readonly kind: "comparison"
  readonly eyebrow?: string
  readonly title?: string
  readonly body?: string
  readonly columns: ReadonlyArray<string>
  /** Index of the column to highlight (e.g. "Optikk"). */
  readonly highlight?: number
  readonly rows: ReadonlyArray<{
    readonly label: string
    readonly values: ReadonlyArray<string | boolean>
  }>
}

function renderCell(value: string | boolean) {
  if (value === true) {
    return (
      <span className="marketing-comparison-bool-yes">
        <span aria-hidden>✓</span> Yes
      </span>
    )
  }
  if (value === false) {
    return <span className="marketing-comparison-bool-no">—</span>
  }
  return value
}

export function ComparisonTable({
  eyebrow,
  title,
  body,
  columns,
  rows,
  highlight,
}: ComparisonTableSection) {
  return (
    <section className="marketing-section">
      <div className="marketing-container">
        {(eyebrow || title || body) && (
          <div className="marketing-section-header">
            {eyebrow ? <div className="marketing-eyebrow">{eyebrow}</div> : null}
            {title ? <h2 className="marketing-h2">{title}</h2> : null}
            {body ? <p className="marketing-body">{body}</p> : null}
          </div>
        )}
        <div className="marketing-comparison-wrap">
          <div className="marketing-comparison-scroll">
            <table className="marketing-comparison">
              <thead>
                <tr>
                  <th />
                  {columns.map((col, i) => (
                    <th
                      key={col}
                      className={i === highlight ? "marketing-comparison-highlight" : undefined}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td className="marketing-comparison-row-label">{row.label}</td>
                    {row.values.map((val, i) => (
                      <td
                        key={`${row.label}-${i}`}
                        className={
                          i === highlight ? "marketing-comparison-cell-highlight" : undefined
                        }
                      >
                        {renderCell(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
