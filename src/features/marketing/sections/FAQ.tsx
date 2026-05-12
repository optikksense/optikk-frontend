export interface FaqSection {
  readonly kind: "faq"
  readonly title?: string
  readonly items: ReadonlyArray<{ readonly q: string; readonly a: string }>
}

export function FAQ({ title, items }: FaqSection) {
  return (
    <section className="marketing-section reveal">
      {title ? (
        <div className="marketing-section-header">
          <h2 className="marketing-h2">{title}</h2>
        </div>
      ) : null}
      <div className="mt-5 space-y-3">
        {items.map((item, i) => (
          <details
            key={item.q}
            className="marketing-faq-item reveal"
            data-reveal-delay={String(i * 60)}
          >
            <summary className="marketing-faq-summary">
              <span className="marketing-faq-toggle" aria-hidden>+</span>
              {item.q}
            </summary>
            <p className="marketing-faq-answer">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
