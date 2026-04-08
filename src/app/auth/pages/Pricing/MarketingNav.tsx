import { useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

function BrandIcon() {
  return (
    <svg aria-hidden="true">
      <rect
        x="4"
        y="15"
        width="24"
        height="13"
        rx="4"
        stroke="#6366F1"
        strokeWidth="2"
        fill="rgba(99, 102, 241, 0.15)"
      />
      <rect
        x="8"
        y="9"
        width="16"
        height="13"
        rx="4"
        stroke="#22D3EE"
        strokeWidth="2"
        fill="rgba(34, 211, 238, 0.1)"
      />
      <rect
        x="12"
        y="3"
        width="8"
        height="13"
        rx="4"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="16" cy="9.5" r="2.5" fill="#FFFFFF" />
      <circle cx="16" cy="15.5" r="2.5" fill="#22D3EE" />
      <circle cx="16" cy="21.5" r="2.5" fill="#6366F1" />
      <line
        x1="16"
        y1="9.5"
        x2="16"
        y2="21.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.6"
      />
    </svg>
  );
}

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/product" },
    { label: "OpenTelemetry", path: "/opentelemetry" },
    { label: "Self-host", path: "/self-host" },
    { label: "Docs", path: "https://docs.optikk.io", ext: true },
  ];

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(10, 11, 15, 0.8)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        }}
      >
        {/* Brand */}
        <div
          onClick={() => navigate({ to: "/" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontFamily: "'DM Serif Display', serif",
            fontSize: 22,
            color: "#F8FAFC",
            letterSpacing: "0.5px",
          }}
        >
          <BrandIcon />
          Optikk
        </div>

        {/* Desktop Links */}
        <style>{`
          @media (max-width: 900px) { .desktop-links { display: none !important; } }
          @media (min-width: 901px) { .mobile-btn { display: none !important; } }
          .nav-link { color: #94A3B8; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif; text-decoration: none; transition: color 0.2s; position: relative; cursor: pointer; }
          .nav-link:hover { color: #F8FAFC; }
          .nav-cta-btn {
            padding: 8px 20px; background: linear-gradient(90deg, #6366F1 0%, #818CF8 50%, #6366F1 100%); background-size: 200% auto;
            border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
            cursor: pointer; transition: all 0.3s;
          }
          .nav-cta-btn:hover { background-position: right center; box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
        `}</style>

        <div className="desktop-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {links.map((lx) =>
            lx.ext ? (
              <a
                key={lx.label}
                href={lx.path}
                target="_blank"
                rel="noreferrer"
                className="nav-link"
              >
                {lx.label}
              </a>
            ) : (
              <div
                key={lx.label}
                className="nav-link"
                onClick={() => navigate({ to: lx.path as any })}
              >
                {lx.label}
                {location.pathname === lx.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: "absolute",
                      bottom: -6,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "#22D3EE",
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>
            )
          )}
          <a
            href="https://github.com/optikk-org"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            GitHub
            <span
              className="font-mono"
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "2px 6px",
                borderRadius: 12,
                fontSize: 10,
                color: "#F1F5F9",
              }}
            >
              ★ 12.4k
            </span>
          </a>
        </div>

        {/* CTA */}
        <div className="desktop-links" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" className="nav-cta-btn" onClick={() => navigate({ to: "/login" })}>
            Get Started
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "#F8FAFC",
            cursor: "pointer",
            padding: 4,
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.15 } }}
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              zIndex: 99,
              background: "rgba(10, 11, 15, 0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              padding: "24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {links.map((lx) => (
              <div
                key={lx.label}
                style={{
                  color: "#F8FAFC",
                  fontSize: 18,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (lx.ext) window.open(lx.path, "_blank");
                  else navigate({ to: lx.path as any });
                }}
              >
                {lx.label}
              </div>
            ))}
            <div
              style={{
                color: "#F8FAFC",
                fontSize: 18,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={() => window.open("https://github.com/optikk-org", "_blank")}
            >
              GitHub{" "}
              <span className="font-mono" style={{ fontSize: 12, color: "#94A3B8" }}>
                ★ 12.4k
              </span>
            </div>
            <button
              type="button"
              className="nav-cta-btn"
              style={{ marginTop: 8, padding: 14 }}
              onClick={() => navigate({ to: "/login" })}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
