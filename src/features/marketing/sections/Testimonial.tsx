export interface TestimonialSection {
  readonly kind: "testimonial"
  readonly quote: string
  readonly author: string
  readonly role?: string
  readonly company?: string
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

export function Testimonial({ quote, author, role, company }: TestimonialSection) {
  return (
    <section className="marketing-section">
      <div className="marketing-container">
        <div className="marketing-testimonial">
          <div>
            <p className="marketing-testimonial-quote">{quote}</p>
            <div className="marketing-testimonial-author">
              <span className="marketing-testimonial-avatar" aria-hidden>
                {initials(author)}
              </span>
              <div>
                <div className="marketing-testimonial-name">{author}</div>
                {(role || company) && (
                  <div className="marketing-testimonial-role">
                    {role}
                    {role && company ? " · " : ""}
                    {company}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
