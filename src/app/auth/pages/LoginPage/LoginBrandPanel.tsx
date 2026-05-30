import { OptikkLogo } from "@/shared/components/brand/OptikkLogo";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" },
] as const;

const GRID_MASK = "radial-gradient(circle at 30% 50%, rgba(0,0,0,0.6), transparent 70%)";

export function LoginBrandPanel() {
  return (
    <aside className="relative grid grid-rows-[auto_1fr_auto] overflow-hidden border-r border-border bg-[image:var(--login-aside-bg)] px-12 py-9 max-lg:hidden">
      <GridOverlay />
      <Brand />
      <Pitch />
      <BrandFoot />
    </aside>
  );
}

function GridOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--login-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--login-grid-line) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        WebkitMaskImage: GRID_MASK,
        maskImage: GRID_MASK,
      }}
    />
  );
}

function Brand() {
  return (
    <div className="relative flex items-center gap-2.5 text-[16px] font-bold tracking-[-0.01em] text-foreground">
      <OptikkLogo size={28} />
      Optikk
    </div>
  );
}

function Pitch() {
  return (
    <div className="relative max-w-[440px] self-center">
      <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--login-link)]">
        Observability
      </div>
      <h1
        className="m-0 mb-3.5 text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-foreground"
        style={{ textWrap: "balance" } as React.CSSProperties}
      >
        See every signal.{" "}
        <em className="bg-[image:linear-gradient(90deg,var(--login-headline-from)_0%,var(--login-headline-to)_100%)] bg-clip-text not-italic text-transparent">
          Resolve before users notice.
        </em>
      </h1>
      <p
        className="m-0 text-sm leading-[1.55] text-foreground-secondary"
        style={{ textWrap: "pretty" } as React.CSSProperties}
      >
        Metrics, traces, logs, and LLM telemetry — unified in one workspace and tied back to the
        services and hosts that produced them.
      </p>
    </div>
  );
}

function BrandFoot() {
  return (
    <div className="relative flex items-center gap-[18px] text-xs text-foreground-muted">
      <span>© {new Date().getFullYear()} Optikk, Inc.</span>
      {FOOTER_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-foreground-secondary no-underline transition-colors hover:text-foreground"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
