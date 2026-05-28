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
    <footer className="flex items-center justify-between pt-4 max-[480px]:flex-col max-[480px]:items-center max-[480px]:gap-3">
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.to}
          to={dynamicTo(link.to)}
          className="text-[13px] text-[var(--text-muted)] no-underline transition-colors duration-150 hover:text-secondary-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </Link>
      ))}
    </footer>
  );
}
