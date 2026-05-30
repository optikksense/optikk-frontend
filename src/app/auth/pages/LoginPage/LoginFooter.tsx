export function LoginFooter() {
  return (
    <footer className="flex items-center justify-between font-mono text-[11.5px] text-foreground-muted">
      <span className="inline-flex items-center gap-1.5 text-foreground-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-healthy" />
        All systems operational
      </span>
      <a
        href="#"
        className="text-foreground-muted no-underline hover:text-foreground-secondary"
      >
        v2026.5 · status →
      </a>
    </footer>
  );
}
