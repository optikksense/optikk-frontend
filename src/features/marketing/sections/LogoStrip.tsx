export interface LogoStripSection {
  readonly kind: "logo-strip"
  readonly label?: string
  readonly logos: ReadonlyArray<{ readonly name: string }>
}

export function LogoStrip({ label, logos }: LogoStripSection) {
  return (
    <section className="marketing-section" style={{ paddingBlock: 56 }}>
      <div className="marketing-container">
        {label ? <div className="marketing-logo-strip-label">{label}</div> : null}
        <div className="marketing-logo-strip">
          {logos.map((logo) => (
            <span key={logo.name} className="marketing-logo-strip-item">
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
