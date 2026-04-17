export interface CodeBlockSection {
  readonly kind: "code-block"
  readonly title?: string
  readonly language?: string
  readonly body: string
}

export function CodeBlock({ title, language, body }: CodeBlockSection) {
  return (
    <section className="marketing-section">
      {title ? <h2 className="marketing-h2">{title}</h2> : null}
      <pre
        className="marketing-code"
        aria-label={language ? `${language} code block` : "code block"}
      >
        <code>{body}</code>
      </pre>
    </section>
  )
}
