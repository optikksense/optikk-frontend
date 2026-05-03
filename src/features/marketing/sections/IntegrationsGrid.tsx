import { Glyph, type GlyphName } from "../svg/Glyph"

export interface IntegrationsGridSection {
  readonly kind: "integrations"
  readonly eyebrow?: string
  readonly title?: string
  readonly body?: string
  readonly items: ReadonlyArray<{
    readonly name: string
    readonly category?: string
    readonly icon?: GlyphName
  }>
}

export function IntegrationsGrid({
  eyebrow,
  title,
  body,
  items,
}: IntegrationsGridSection) {
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
        <div className="marketing-integrations-grid">
          {items.map((item) => (
            <div key={item.name} className="marketing-integration-tile">
              <span className="marketing-integration-icon">
                <Glyph name={(item.icon ?? "workspace") as GlyphName} size={16} />
              </span>
              <div className="marketing-integration-meta">
                <div className="marketing-integration-name">{item.name}</div>
                {item.category ? (
                  <div className="marketing-integration-category">{item.category}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
