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
          <Link to={dynamicTo(NAV.signIn.path)} className="marketing-sign-in">
            {NAV.signIn.label}
          </Link>
        </div>
      </header>

      <div className="marketing-container">
        <Outlet />
      </div>

      <footer className="marketing-footer">
        <div className="marketing-container marketing-footer-inner">
          <div className="marketing-footer-brand">
            <Logo size={18} />
            <span>{FOOTER.tagline}</span>
          </div>
          <div className="marketing-footer-groups">
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
        </div>
      </footer>
    </div>
  )
}
