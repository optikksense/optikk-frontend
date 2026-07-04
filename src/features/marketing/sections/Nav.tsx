import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Menu, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

import { OptikkLogo } from "@/shared/components/brand/OptikkLogo";

import { OSS, formatStars } from "../constants";
import { useGitHubStars } from "../hooks/useGitHubStars";

const NAV_LINKS = [
  { label: "Platform", path: "/features" },
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
    <Link className={className} to={(path as string & {})}>
      {label}
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalStars } = useGitHubStars();

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
        <Link to={("/" as string & {})} className="m-brand" aria-label="Optikk home">
          <OptikkLogo size={26} />
          <span className="m-brand-word">Optikk</span>
        </Link>

        <nav aria-label="Marketing" className="m-nav-links">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.path} label={link.label} path={link.path} />
          ))}
        </nav>

        <div className="m-nav-actions">
          <a
            href={OSS.frontend}
            target="_blank"
            rel="noreferrer"
            className="m-nav-stars"
            aria-label={`Star Optikk on GitHub (${formatStars(totalStars)} stars)`}
          >
            <Github size={14} />
            <span>Star</span>
            <span className="m-nav-stars-sep" aria-hidden="true" />
            <Star size={12} strokeWidth={2.4} />
            <span>{formatStars(totalStars)}</span>
          </a>
          <Link to={("/login" as string & {})} className="m-btn m-btn-ghost m-btn-sm">
            Sign in
          </Link>
          <Link to={("/self-host" as string & {})} className="m-btn m-btn-primary m-btn-sm">
            Self-host
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
                <Link key={link.path} to={(link.path as string & {})}>
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
