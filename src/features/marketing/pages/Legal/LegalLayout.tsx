import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";


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

const SIDEBAR_LINK_BASE =
  "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium no-underline whitespace-nowrap transition-all duration-fast ease-default";
const SIDEBAR_LINK_INACTIVE =
  "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]";
const SIDEBAR_LINK_ACTIVE =
  "text-[var(--color-primary-on-bg)] bg-[var(--color-primary)] font-semibold";

const PAGING_BTN_BASE =
  "flex flex-col gap-1 px-5 py-4 border border-[var(--border-color)] rounded-xl no-underline max-w-[260px] flex-1 transition-all duration-fast ease-default hover:border-[var(--color-primary)] hover:bg-[var(--bg-secondary)]";

function LegalSidebar({ currentKey }: { readonly currentKey: LegalKey }) {
  return (
    <nav
      className="sticky top-[100px] flex h-fit flex-col gap-2 max-md:static max-md:mb-2 max-md:flex-row max-md:overflow-x-auto max-md:border-[var(--border-color)] max-md:border-b max-md:pb-4"
      aria-label="Legal Documents"
    >
      {LEGAL_PAGES.map((page) => {
        const isActive = page.key === currentKey;
        return (
          <Link
            key={page.key}
            to={(page.to as string & {})}
            className={`${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_INACTIVE}`}
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LegalPaging({ currentKey }: { readonly currentKey: LegalKey }) {
  const currentIndex = LEGAL_PAGES.findIndex((p) => p.key === currentKey);
  const prevPage = currentIndex > 0 ? LEGAL_PAGES[currentIndex - 1] : null;
  const nextPage = currentIndex < LEGAL_PAGES.length - 1 ? LEGAL_PAGES[currentIndex + 1] : null;

  return (
    <div className="mt-14 flex items-center justify-between gap-4 border-[var(--border-color)] border-t pt-8">
      {prevPage ? (
        <Link to={(prevPage.to as string & {})} className={`${PAGING_BTN_BASE} items-start text-left`}>
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.05em]">
            Previous
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)] text-sm">
            <ArrowLeft size={16} />
            {prevPage.label}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextPage ? (
        <Link to={(nextPage.to as string & {})} className={`${PAGING_BTN_BASE} items-end text-right`}>
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.05em]">
            Next
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)] text-sm">
            {nextPage.label}
            <ArrowRight size={16} />
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
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
    <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-5 pt-12 pb-24 md:grid-cols-[240px_1fr]">
      <LegalSidebar currentKey={currentKey} />
      <article className="min-w-0">
        <header className="mb-8 border-[var(--border-color)] border-b pb-6">
          <h1 className="m-0 mb-2 font-extrabold text-[32px] text-[var(--text-primary)] tracking-[-0.02em]">
            {title}
          </h1>
          <time className="text-[13px] text-[var(--text-muted)]" dateTime={lastUpdated}>
            Last updated: {lastUpdated}
          </time>
        </header>
        <section className="text-[var(--text-secondary)] text-base leading-[1.7] [&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:font-[750] [&_h2]:text-[var(--text-primary)] [&_h2]:text-xl [&_h2]:tracking-[-0.01em] [&_li]:mb-2 [&_ol]:mb-5 [&_ol]:pl-5 [&_p]:mb-4 [&_ul]:mb-5 [&_ul]:pl-5">
          {children}
        </section>
        <LegalPaging currentKey={currentKey} />
      </article>
    </div>
  );
}
