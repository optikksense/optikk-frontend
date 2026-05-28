export function LoginFooter() {
  return (
    <footer className="flex items-center justify-between font-mono text-[11.5px] text-[var(--text-muted)]">
      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-healthy)]" />
        All systems operational
      </span>
      <a
        href="#"
        className="text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)]"
      >
        v2026.5 · status →
      </a>
    </footer>
  );
}
