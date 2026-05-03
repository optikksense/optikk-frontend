function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export function GitHubStarBadge({
  stars,
  url,
}: {
  readonly stars: number
  readonly url: string
}) {
  return (
    <a
      className="marketing-github-badge"
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Star on GitHub — ${stars.toLocaleString()} stars`}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
      <span>GitHub</span>
      <span className="marketing-github-badge-divider" aria-hidden />
      <span className="marketing-github-badge-stars">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 .25l2.39 4.84 5.34.78-3.86 3.77.91 5.32L8 12.45l-4.78 2.51.91-5.32L.27 5.87l5.34-.78L8 .25z" />
        </svg>
        {formatStars(stars)}
      </span>
    </a>
  )
}
