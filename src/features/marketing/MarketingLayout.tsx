import { Link, Outlet } from "@tanstack/react-router"

import { dynamicTo } from "@/shared/utils/navigation"

import content from "./content.json"
import "./marketing.css"
import { Logo } from "./svg/Logo"

const NAV = content.nav
const FOOTER = content.footer

export default function MarketingLayout() {
  return (
    <div className="marketing-root">
      <div className="marketing-backdrop" aria-hidden />
      <header className="marketing-nav">
        <div className="marketing-container marketing-nav-inner">
          <Link to={dynamicTo("/")} className="marketing-brand">
            <Logo />
            <span>{NAV.brand}</span>
          </Link>
          <nav aria-label="Marketing" className="marketing-nav-links">
            {NAV.links.map((link) => (
              <Link key={link.path} to={dynamicTo(link.path)} className="marketing-nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="https://github.com/optikksense"
              target="_blank"
              rel="noreferrer"
              className="marketing-nav-link"
              aria-label="GitHub"
              style={{ display: "inline-flex" }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            <Link to={dynamicTo(NAV.signIn.path)} className="marketing-sign-in">
              {NAV.signIn.label}
            </Link>
          </div>
        </div>
      </header>

      <div className="marketing-container">
        <Outlet />
      </div>

      <footer className="marketing-footer">
        <div className="marketing-container marketing-footer-inner">
          <div className="marketing-footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Logo size={20} />
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
                Optikk
              </span>
            </div>
            <span>{FOOTER.tagline}</span>
          </div>
          {FOOTER.groups.map((group) => (
            <div key={group.title}>
              <div className="marketing-footer-heading">{group.title}</div>
              <ul className="marketing-footer-list">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link to={dynamicTo(link.path)} className="marketing-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="marketing-container"
          style={{
            paddingBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: 24,
          }}
        >
          <span>© {new Date().getFullYear()} Optikk. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <a
              href="https://github.com/optikksense"
              target="_blank"
              rel="noreferrer"
              className="marketing-footer-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
