export interface FaqSection {
  readonly kind: "faq"
  readonly title?: string
  readonly items: ReadonlyArray<{ readonly q: string; readonly a: string }>
}

export function FAQ({ title, items }: FaqSection) {
  return (
    <section className="marketing-section">
      {title ? <h2 className="marketing-h2">{title}</h2> : null}
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <details key={item.q} className="marketing-faq-item group">
            <summary className="marketing-faq-summary">
              <span className="marketing-faq-toggle group-open:rotate-45" aria-hidden>+</span>
              {item.q}
            </summary>
            <p className="marketing-faq-answer">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
