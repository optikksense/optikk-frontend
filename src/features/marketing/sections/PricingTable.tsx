import { CTALink, type CtaLinkData } from "./CTALink"

export interface PricingTier {
  readonly name: string
  readonly price: string
  readonly priceSuffix?: string
  readonly tagline?: string
  readonly featured?: boolean
  readonly badge?: string
  readonly features: ReadonlyArray<string>
  readonly cta: CtaLinkData
}

export interface PricingTableSection {
  readonly kind: "pricing"
  readonly eyebrow?: string
  readonly title?: string
  readonly body?: string
  readonly tiers: ReadonlyArray<PricingTier>
}

export function PricingTable({ eyebrow, title, body, tiers }: PricingTableSection) {
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
        <div className="marketing-pricing-grid">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.featured
                  ? "marketing-pricing-tier marketing-pricing-tier-featured"
                  : "marketing-pricing-tier"
              }
            >
              {tier.badge ? (
                <span className="marketing-pricing-tier-badge">{tier.badge}</span>
              ) : null}
              <div className="marketing-pricing-tier-name">{tier.name}</div>
              <div className="marketing-pricing-tier-price">
                {tier.price}
                {tier.priceSuffix ? (
                  <span className="marketing-pricing-tier-price-suffix">{tier.priceSuffix}</span>
                ) : null}
              </div>
              {tier.tagline ? (
                <div className="marketing-pricing-tier-tagline">{tier.tagline}</div>
              ) : null}
              <ul className="marketing-pricing-tier-features">
                {tier.features.map((f) => (
                  <li key={f} className="marketing-pricing-tier-feature">
                    <span className="marketing-pricing-tier-feature-check" aria-hidden>
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="marketing-pricing-tier-cta">
                <CTALink cta={tier.cta} variant={tier.featured ? "primary" : "secondary"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
