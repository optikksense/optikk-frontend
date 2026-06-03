import { Link } from "@tanstack/react-router";

import { ROUTES } from "@shared/constants/routes";

export function LoginTopBar() {
  return (
    <div className="flex items-center justify-end gap-2.5 text-[12.5px] text-foreground-muted">
      <span>New to Optikk?</span>
      <Link
        to={ROUTES.selfHost}
        className="font-semibold text-[var(--login-link)] no-underline hover:underline"
      >
        Self-host now →
      </Link>
    </div>
  );
}
