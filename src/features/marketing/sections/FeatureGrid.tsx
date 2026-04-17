import { Glyph, type GlyphName } from "../svg/Glyph"

export interface FeatureGridSection {
  readonly kind: "feature-grid"
  readonly title?: string
  readonly items: ReadonlyArray<{
    readonly icon?: GlyphName
    readonly title: string
    readonly body: string
  }>
}

export function FeatureGrid({ title, items }: FeatureGridSection) {
  return (
    <section className="marketing-section">
      {title ? <h2 className="marketing-h2">{title}</h2> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="marketing-card">
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
