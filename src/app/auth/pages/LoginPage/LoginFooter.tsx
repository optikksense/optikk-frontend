import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicTo } from "@/shared/utils/navigation";

const FOOTER_LINKS = [
  { label: "Privacy Policy", to: ROUTES.privacy },
  { label: "Terms of Service", to: ROUTES.terms },
  { label: "Security", to: ROUTES.security },
] as const;

/**
 * Login page footer — legal and security links.
 */
export function LoginFooter() {
  return (
    <footer className="login-footer">
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.to}
          to={dynamicTo(link.to)}
          className="login-footer-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </Link>
      ))}
    </footer>
  );
}
