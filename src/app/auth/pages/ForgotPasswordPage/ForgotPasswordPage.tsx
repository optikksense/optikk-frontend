import { Link } from "@tanstack/react-router";

import { ROUTES } from "@shared/constants/routes";

import { LoginBrandPanel } from "../LoginPage/LoginBrandPanel";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface-canvas text-foreground lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <main className="grid grid-rows-[auto_1fr_auto] px-12 py-7 max-md:px-6 max-md:py-5">
        <TopBar />
        <div className="mx-auto w-full max-w-[380px] self-center py-7">
          <Heading />
          <ForgotPasswordForm />
        </div>
        <Footer />
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-end gap-2.5 text-[12.5px] text-foreground-muted">
      <span>Remembered your password?</span>
      <Link
        to={ROUTES.login}
        className="font-semibold text-[var(--login-link)] no-underline hover:underline"
      >
        Sign in →
      </Link>
    </div>
  );
}

function Heading() {
  return (
    <header>
      <h2 className="m-0 mb-1.5 font-bold text-2xl text-foreground tracking-[-0.015em]">
        Reset your password
      </h2>
      <p className="m-0 mb-[22px] text-[13.5px] text-foreground-muted">
        Enter your email address and we'll send you a link to reset your password.
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
      <a
        href="#status"
        className="text-foreground-muted no-underline hover:text-foreground-secondary"
      >
        v2026.5 · status →
      </a>
    </footer>
  );
}
