import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { ROUTES } from "@shared/constants/routes";

import { LoginBrandPanel } from "../pages/LoginPage/LoginBrandPanel";

interface AuthPageShellProps {
  readonly title: string;
  readonly subtitle: string;
  readonly prompt: string;
  readonly actionLabel: string;
  readonly actionTo: typeof ROUTES.login | typeof ROUTES.signup;
  readonly children: ReactNode;
}

export function AuthPageShell({
  title,
  subtitle,
  prompt,
  actionLabel,
  actionTo,
  children,
}: AuthPageShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface-canvas text-foreground lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <main className="grid grid-rows-[auto_1fr_auto] px-12 py-7 max-md:px-6 max-md:py-5">
        <div className="flex items-center justify-end gap-2.5 text-[12.5px] text-foreground-muted">
          <span>{prompt}</span>
          <Link
            to={actionTo}
            className="font-semibold text-[var(--login-link)] no-underline hover:underline"
          >
            {actionLabel} →
          </Link>
        </div>
        <div className="mx-auto w-full max-w-[380px] self-center py-7">
          <header>
            <h2 className="m-0 mb-1.5 font-bold text-2xl text-foreground tracking-[-0.015em]">
              {title}
            </h2>
            <p className="m-0 mb-[22px] text-[13.5px] text-foreground-muted">{subtitle}</p>
          </header>
          {children}
        </div>
        <footer className="flex items-center justify-between font-mono text-[11.5px] text-foreground-muted">
          <span className="inline-flex items-center gap-1.5 text-foreground-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-healthy" />
            All systems operational
          </span>
          <a
            href="#status"
            className="text-foreground-muted no-underline hover:text-foreground-secondary"
          >
            v2026.5 · status →
          </a>
        </footer>
      </main>
    </div>
  );
}
