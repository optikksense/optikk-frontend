import { Link } from "@tanstack/react-router";

import { ROUTES } from "@shared/constants/routes";

/**
 * Login page header — "Welcome back" heading with trial signup CTA.
 */
export function LoginHeader() {
  return (
    <header>
      <h1 className="login-heading">Welcome back</h1>
      <p className="login-subtext">
        No account?{" "}
        <Link to={ROUTES.pricing} className="login-subtext-link">
          Start free trial →
        </Link>
      </p>
    </header>
  );
}
