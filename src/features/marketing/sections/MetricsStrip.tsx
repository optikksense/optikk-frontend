export interface MetricsStripSection {
  readonly kind: "metrics-strip"
  readonly items: ReadonlyArray<{
    readonly value: string
    readonly label: string
    readonly caption?: string
  }>
}

export function MetricsStrip({ items }: MetricsStripSection) {
  return (
    <section className="marketing-section reveal">
      <div className="marketing-metrics-strip">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="marketing-metric reveal"
            data-reveal-delay={String(i * 100)}
          >
            <div className="marketing-metric-value">{item.value}</div>
            <div className="marketing-metric-label">{item.label}</div>
            {item.caption ? <div className="marketing-metric-caption">{item.caption}</div> : null}
          </div>
        ))}
      </div>
    </section>
  )
}
