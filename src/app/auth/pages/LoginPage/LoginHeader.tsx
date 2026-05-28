import { Link } from "@tanstack/react-router";

import { ROUTES } from "@shared/constants/routes";

/**
 * Login page header — "Welcome back" heading with trial signup CTA.
 */
export function LoginHeader() {
  return (
    <header>
      <h1 className="m-0 mb-2 text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-foreground max-[480px]:text-[26px]">
        Welcome back
      </h1>
      <p className="m-0 text-[15px] text-[var(--text-muted)]">
        No account?{" "}
        <Link
          to={ROUTES.pricing}
          className="font-medium text-[var(--login-accent)] no-underline transition-colors duration-150 hover:text-[var(--login-accent-hover)]"
        >
          Start free trial →
        </Link>
      </p>
    </header>
  );
}
