import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { dynamicTo } from "@/shared/utils/navigation";

import "./LegalLayout.css";

const LEGAL_PAGES = [
  { key: "privacy", label: "Privacy Policy", to: "/privacy" },
  { key: "terms", label: "Terms of Service", to: "/terms" },
  { key: "security", label: "Security Statement", to: "/security" },
] as const;

type LegalKey = "privacy" | "terms" | "security";

interface LegalLayoutProps {
  readonly currentKey: LegalKey;
  readonly title: string;
  readonly lastUpdated: string;
  readonly children: ReactNode;
}

function LegalSidebar({ currentKey }: { readonly currentKey: LegalKey }) {
  return (
    <nav className="legal-sidebar" aria-label="Legal Documents">
      {LEGAL_PAGES.map((page) => (
        <Link
          key={page.key}
          to={dynamicTo(page.to)}
          className={`legal-sidebar-link${page.key === currentKey ? " is-active" : ""}`}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}

function LegalPaging({ currentKey }: { readonly currentKey: LegalKey }) {
  const currentIndex = LEGAL_PAGES.findIndex((p) => p.key === currentKey);
  const prevPage = currentIndex > 0 ? LEGAL_PAGES[currentIndex - 1] : null;
  const nextPage = currentIndex < LEGAL_PAGES.length - 1 ? LEGAL_PAGES[currentIndex + 1] : null;

  return (
    <div className="legal-paging">
      {prevPage ? (
        <Link to={dynamicTo(prevPage.to)} className="legal-paging-btn is-prev">
          <span className="legal-paging-label">Previous</span>
          <span className="legal-paging-title">
            <ArrowLeft size={16} />
            {prevPage.label}
          </span>
        </Link>
      ) : (
        <div className="legal-paging-placeholder" />
      )}

      {nextPage ? (
        <Link to={dynamicTo(nextPage.to)} className="legal-paging-btn is-next">
          <span className="legal-paging-label">Next</span>
          <span className="legal-paging-title">
            {nextPage.label}
            <ArrowRight size={16} />
          </span>
        </Link>
      ) : (
        <div className="legal-paging-placeholder" />
      )}
    </div>
  );
}

export function LegalLayout({ currentKey, title, lastUpdated, children }: LegalLayoutProps) {
  useEffect(() => {
    const root = document.querySelector(".marketing-root");
    if (root) {
      root.classList.add("marketing-root-themed");
    }
    return () => {
      if (root) {
        root.classList.remove("marketing-root-themed");
      }
    };
  }, []);

  return (
    <div className="legal-page-container">
      <LegalSidebar currentKey={currentKey} />
      <article className="legal-content-wrapper">
        <header className="legal-header">
          <h1 className="legal-title">{title}</h1>
          <time className="legal-meta" dateTime={lastUpdated}>
            Last updated: {lastUpdated}
          </time>
        </header>
        <section className="legal-body">{children}</section>
        <LegalPaging currentKey={currentKey} />
      </article>
    </div>
  );
}
