import { Link } from "@tanstack/react-router";

import { ROUTES } from "@shared/constants/routes";

import { LoginBrandPanel } from "./LoginBrandPanel";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface-canvas text-foreground lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <main className="grid grid-rows-[auto_1fr_auto] px-12 py-7 max-md:px-6 max-md:py-5">
        <TopBar />
        <div className="mx-auto w-full max-w-[380px] self-center py-7">
          <Heading />
          <LoginForm />
          <SignupCta />
        </div>
        <Footer />
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-end gap-2.5 text-[12.5px] text-foreground-muted">
      <span>New to Optikk?</span>
      <Link
        to={ROUTES.signup}
        className="font-semibold text-[var(--login-link)] no-underline hover:underline"
      >
        Create account →
      </Link>
    </div>
  );
}

function SignupCta() {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 text-[11.5px] text-foreground-muted">
        <span className="h-px flex-1 bg-border" />
        <span>New to Optikk?</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <Link
        to={ROUTES.signup}
        data-testid="login-create-account"
        className="mt-4 flex h-[42px] w-full items-center justify-center rounded-md border border-border bg-card font-semibold text-[13.5px] text-foreground no-underline transition-colors duration-150 hover:border-foreground-muted hover:bg-surface-inset"
      >
        Create an account
      </Link>
    </div>
  );
}

function Heading() {
  return (
    <header>
      <h2 className="m-0 mb-1.5 font-bold text-2xl text-foreground tracking-[-0.015em]">
        Sign in to Optikk
      </h2>
      <p className="m-0 mb-[22px] text-[13.5px] text-foreground-muted">
        Welcome back. Pick up where your tenant left off.
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between font-mono text-[11.5px] text-foreground-muted">
      <span className="inline-flex items-center gap-1.5 text-foreground-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-healthy" />
        All systems operational
      </span>
      <a href="#" className="text-foreground-muted no-underline hover:text-foreground-secondary">
        v2026.5 · status →
      </a>
    </footer>
  );
}
