export interface SplitSection {
  readonly kind: "split"
  readonly title: string
  readonly body?: string
  readonly highlights: ReadonlyArray<string>
}

export function Split({ title, body, highlights }: SplitSection) {
  return (
    <section className="marketing-section">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="marketing-h2">{title}</h2>
          {body ? <p className="marketing-body">{body}</p> : null}
        </div>
        <ul className="space-y-3">
          {highlights.map((item) => (
            <li key={item} className="marketing-highlight">
              <span className="marketing-highlight-dot" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
