import { useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { dynamicNavigateOptions } from "@/shared/utils/navigation";

function BrandMark() {
  return (
    <img
      src="/marketing/optikk-logo.png"
      alt=""
      width={32}
      height={32}
      style={{ borderRadius: 8, objectFit: "contain" }}
    />
  );
}

type NavItem =
  | { label: string; path: string; ext?: false }
  | { label: string; path: string; ext: true };

const LINKS: NavItem[] = [
  { label: "Features", path: "/features" },
  { label: "Pricing", path: "/pricing" },
  { label: "Architecture", path: "/architecture" },
  { label: "OpenTelemetry", path: "/opentelemetry" },
  { label: "Self-host", path: "/self-host" },
  { label: "Docs", path: "https://docs.optikk.io", ext: true },
];

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const go = (item: NavItem) => {
    setMobileMenuOpen(false);
    if (item.ext) {
      window.open(item.path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(dynamicNavigateOptions(item.path));
  };

  const linkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path;
  };

  return (
    <>
      <nav className={`mkt-nav${scrolled ? " mkt-nav--scrolled" : ""}`}>
        <button type="button" className="mkt-brand" onClick={() => navigate({ to: "/" })}>
          <BrandMark />
          Optikk
        </button>

        <div className="mkt-nav-links mkt-desktop-only">
          {LINKS.map((item) =>
            item.ext ? (
              <a
                key={item.label}
                href={item.path}
                target="_blank"
                rel="noreferrer"
                className="mkt-nav-link"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.path}
                type="button"
                className={`mkt-nav-link${linkActive(item.path) ? " mkt-nav-link--active" : ""}`}
                onClick={() => go(item)}
              >
                {item.label}
                {linkActive(item.path) && (
                  <motion.div layoutId="nav-indicator" className="mkt-nav-indicator" />
                )}
              </button>
            )
          )}
          <a
            href="https://github.com/optikk-org"
            target="_blank"
            rel="noreferrer"
            className="mkt-nav-link"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            GitHub
            <span className="mkt-github-badge">12.4k</span>
          </a>
        </div>

        <div
          className="mkt-desktop-only"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <button type="button" className="mkt-nav-cta" onClick={() => navigate({ to: "/login" })}>
            Get started
          </button>
        </div>

        <button
          type="button"
          className="mkt-mobile-menu-btn"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.15 } }}
            className="mkt-mobile-panel"
          >
            {LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="mkt-mobile-link"
                onClick={() => go(item)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="mkt-mobile-link"
              onClick={() => {
                setMobileMenuOpen(false);
                window.open("https://github.com/optikk-org", "_blank", "noopener,noreferrer");
              }}
            >
              GitHub <span className="mkt-github-badge">12.4k</span>
            </button>
            <button
              type="button"
              className="mkt-nav-cta"
              style={{ marginTop: 8, padding: 14 }}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate({ to: "/login" });
              }}
            >
              Get started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
