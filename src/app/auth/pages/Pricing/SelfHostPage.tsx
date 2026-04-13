import { useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import CodeTabs from "./CodeTabs";

const COMPOSE = `curl -fsSL https://raw.githubusercontent.com/optikk-org/optikk/main/deploy/compose/docker-compose.yml -o docker-compose.yml
docker compose up -d`;

const HELM = `# Example — see charts repo for full values
helm repo add optikk https://charts.optikk.io
helm install optikk optikk/optikk \\
  --set clickhouse.enabled=true \\
  --set ingress.enabled=true`;

export default function SelfHostPage() {
  const navigate = useNavigate();

  return (
    <div className="mkt-page-wrap">
      <header className="mkt-page-hero">
        <div className="mkt-page-kicker">Deployment</div>
        <h1 className="mkt-page-title">Self-host the exact same binary we run in cloud cells</h1>
        <p className="mkt-page-lead">
          Keep data residency, satisfy regulated industries, or simply prefer capex over SaaS. The
          MIT-licensed distribution includes the UI, query layer, ingest workers, and reference Helm
          & Compose assets.
        </p>
      </header>

      <div className="selfhost-grid" style={{ marginBottom: 64 }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 32 }}>
            Compose for laptops, Helm for clusters
          </h2>
          <p className="selfhost-desc" style={{ maxWidth: "none" }}>
            Start locally with a single file, then promote the same containers to Kubernetes. Bring
            your own ClickHouse cluster if you already operate one — Optikk only needs compatible
            schemas and credentials.
          </p>
          <ul style={{ color: "#94a3b8", lineHeight: 1.7, paddingLeft: "1.1rem" }}>
            <li>Air-gapped installs with tarball artifacts</li>
            <li>OIDC/SAML via your IdP</li>
            <li>Encrypted backups to S3-compatible storage</li>
            <li>Horizontal ingest autoscaling hooks</li>
          </ul>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a
              className="btn-primary"
              href="https://github.com/optikk-org"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              GitHub <ExternalLink size={16} style={{ marginLeft: 6 }} />
            </a>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate({ to: "/pricing" })}
            >
              Cloud vs self-host pricing
            </button>
          </div>
        </div>
        <div className="component-card" style={{ padding: 16 }}>
          <CodeTabs
            tabs={[
              { id: "compose", label: "Quick start", language: "bash", code: COMPOSE },
              { id: "helm", label: "Helm", language: "bash", code: HELM },
            ]}
          />
        </div>
      </div>

      <article className="mkt-article">
        <h2>Hardware cheat sheet</h2>
        <p>
          Ingest throughput scales with vCPU on Kafka consumers and I/O bandwidth on ClickHouse. A
          mid-size team typically starts with 8 vCPU / 32 GB RAM for the all-in-one reference stack
          and splits components once sustained ingest crosses ~2 TB/mo.
        </p>
        <h3>Support offerings</h3>
        <p>
          Community Discord and GitHub issues stay free forever. Production subscriptions add SLAs,
          upgrade playbooks, and on-call bridges without changing the license.
        </p>
      </article>
    </div>
  );
}
