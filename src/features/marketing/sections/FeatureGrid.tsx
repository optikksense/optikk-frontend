import { Glyph, type GlyphName } from "../svg/Glyph"

export interface FeatureGridSection {
  readonly kind: "feature-grid"
  readonly title?: string
  readonly body?: string
  readonly items: ReadonlyArray<{
    readonly icon?: GlyphName
    readonly title: string
    readonly body: string
  }>
}

export function FeatureGrid({ title, body, items }: FeatureGridSection) {
  return (
    <section className="marketing-section reveal">
      {(title || body) && (
        <div className="marketing-section-header">
          {title ? <h2 className="marketing-h2">{title}</h2> : null}
          {body ? <p className="marketing-body">{body}</p> : null}
        </div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="marketing-card reveal"
            data-reveal-delay={String(i * 80)}
          >
            <div className="marketing-card-icon">
              <Glyph name={(item.icon ?? "workspace") as GlyphName} size={18} />
            </div>
            <div className="marketing-card-title">{item.title}</div>
            <div className="marketing-card-body">{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
