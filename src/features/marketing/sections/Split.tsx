export interface SplitSection {
  readonly kind: "split"
  readonly title: string
  readonly body?: string
  readonly highlights: ReadonlyArray<string>
}

export function Split({ title, body, highlights }: SplitSection) {
  return (
    <section className="marketing-section reveal">
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        <div>
          <h2 className="marketing-h2">{title}</h2>
          {body ? <p className="marketing-body">{body}</p> : null}
        </div>
        <ul className="space-y-3">
          {highlights.map((item, i) => (
            <li
              key={item}
              className="marketing-highlight reveal"
              data-reveal-delay={String(i * 100)}
            >
              <span className="marketing-highlight-dot" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
