import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { OptikkLogo } from "@/shared/components/brand/OptikkLogo";
import { dynamicTo } from "@/shared/utils/navigation";

const NAV_LINKS = [
  { label: "Platform", path: "/features" },
  { label: "Pricing", path: "/pricing" },
  { label: "Architecture", path: "/architecture" },
  { label: "OpenTelemetry", path: "/opentelemetry" },
  { label: "Self-host", path: "/self-host" },
] as const;

function isAnchorLink(path: string) {
  return path.includes("#") || path.startsWith("http");
}

function NavItem({ label, path }: { readonly label: string; readonly path: string }) {
  const location = useLocation();
  const isActive = location.pathname === path;
  const className = `m-nav-link${isActive ? " is-active" : ""}`;

  if (isAnchorLink(path)) {
    return (
      <a className={className} href={path}>
        {label}
      </a>
    );
  }

  return (
    <Link className={className} to={dynamicTo(path)}>
      {label}
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`m-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="m-container m-nav-inner">
        <Link to={dynamicTo("/")} className="m-brand" aria-label="Optikk home">
          <OptikkLogo size={26} />
          <span className="m-brand-word">Optikk</span>
        </Link>

        <nav aria-label="Marketing" className="m-nav-links">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.path} label={link.label} path={link.path} />
          ))}
        </nav>

        <div className="m-nav-actions">
          <Link to={dynamicTo("/login")} className="m-btn m-btn-ghost m-btn-sm">
            Sign in
          </Link>
          <Link to={dynamicTo("/login")} className="m-btn m-btn-primary m-btn-sm">
            Start free
          </Link>
          <button
            type="button"
            className="m-nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="m-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {NAV_LINKS.map((link) =>
              isAnchorLink(link.path) ? (
                <a key={link.path} href={link.path}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.path} to={dynamicTo(link.path)}>
                  {link.label}
                </Link>
              )
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
