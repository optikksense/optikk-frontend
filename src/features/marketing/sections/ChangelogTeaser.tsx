export interface ChangelogTeaserSection {
  readonly kind: "changelog"
  readonly eyebrow?: string
  readonly title?: string
  readonly body?: string
  readonly entries: ReadonlyArray<{
    readonly version: string
    readonly date: string
    readonly summary: string
  }>
  readonly repoUrl?: string
}

export function ChangelogTeaser({
  eyebrow,
  title,
  body,
  entries,
  repoUrl,
}: ChangelogTeaserSection) {
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
        <div className="marketing-changelog">
          {entries.map((entry) => (
            <div key={entry.version} className="marketing-changelog-entry">
              <div>
                <div className="marketing-changelog-version">{entry.version}</div>
                <div className="marketing-changelog-date">{entry.date}</div>
              </div>
              <div className="marketing-changelog-summary">{entry.summary}</div>
            </div>
          ))}
          {repoUrl ? (
            <div className="marketing-changelog-footer">
              <a href={repoUrl} target="_blank" rel="noreferrer">
                View full changelog on GitHub →
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
