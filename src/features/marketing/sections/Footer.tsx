import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";

import { OptikkLogo } from "@/shared/components/brand/OptikkLogo";
import { dynamicTo } from "@/shared/utils/navigation";

const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Platform", path: "/features" },
      { label: "Pricing", path: "/pricing" },
      { label: "Architecture", path: "/architecture" },
      { label: "Self-host", path: "/self-host" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "OpenTelemetry", path: "/opentelemetry" },
      { label: "Docs", path: "https://docs.optikk.dev" },
      { label: "Status", path: "https://status.optikk.dev" },
      { label: "Changelog", path: "/features#changelog" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { label: "Logs", path: "/features#logs" },
      { label: "Traces", path: "/features#traces" },
      { label: "Metrics", path: "/features#metrics" },
      { label: "AI SRE", path: "/features#ai-sre" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", path: "https://jobs.optikk.dev" },
      { label: "Security", path: "/self-host#security" },
      { label: "Privacy", path: "https://optikk.dev/privacy" },
      { label: "Contact", path: "mailto:hello@optikk.dev" },
    ],
  },
] as const;

function FooterLink({ label, path }: { readonly label: string; readonly path: string }) {
  if (path.startsWith("http") || path.startsWith("mailto:") || path.includes("#")) {
    return (
      <a
        href={path}
        target={path.startsWith("http") ? "_blank" : undefined}
        rel={path.startsWith("http") ? "noreferrer" : undefined}
      >
        {label}
      </a>
    );
  }
  return <Link to={dynamicTo(path)}>{label}</Link>;
}

export function Footer() {
  return (
    <footer className="m-footer">
      <div className="m-container m-footer-grid">
        <div className="m-footer-brand">
          <Link to={dynamicTo("/")} className="m-brand" aria-label="Optikk home">
            <OptikkLogo size={28} />
            <span>Optikk</span>
          </Link>
          <p>
            Logs, metrics, and traces on one columnar store. OpenTelemetry-native. Built on Kafka,
            ClickHouse, MySQL, and Redis — operable, not opaque.
          </p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="m-footer-heading">{group.title}</div>
            <ul className="m-footer-list">
              {group.links.map((link) => (
                <li key={link.path + link.label}>
                  <FooterLink label={link.label} path={link.path} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="m-container m-footer-bottom">
        <span>© {new Date().getFullYear()} Optikk, Inc. All rights reserved.</span>
        <div className="m-footer-socials">
          <a
            href="https://github.com/optikksense"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
          <a
            href="https://twitter.com/optikk"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <Twitter size={16} />
          </a>
          <a
            href="https://linkedin.com/company/optikk"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
