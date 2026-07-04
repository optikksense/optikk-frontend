import { Github, Star } from "lucide-react";
import { OSS, formatStars } from "../constants";
import { useGitHubStars } from "../hooks/useGitHubStars";
import { GradientText } from "../motion/GradientText";
import { SectionHeader } from "./SectionHeader";

export function OpenSourceSection() {
  const { stars, totalStars } = useGitHubStars();

  return (
    <section className="m-section m-section--ink" id="open-source">
      <div className="m-container">
        <SectionHeader
          eyebrow="Open source"
          title={
            <span style={{ color: "#fff" }}>
              Apache 2.0, <GradientText>top to bottom.</GradientText>
            </span>
          }
          lede={
            <span style={{ color: "#c0cee0" }}>
              The engine, the OTel collector build, the language SDKs, and the Helm chart all live
              on GitHub. Self-host runs the same binaries Cloud does — no proprietary fork, no
              closed core.
            </span>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 18,
            marginTop: 36,
          }}
        >
          <a
            className="is-ink m-bento-card"
            href={OSS.frontend}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <span className="m-bento-icon">
              <Github size={20} />
            </span>
            <h3 className="m-h4">optikk-frontend</h3>
            <p className="m-body-sm">
              Frontend UI dashboard of Observability. Built with React 19, Vite, and TypeScript.
            </p>
            <div className="m-bento-link">
              <Star size={13} strokeWidth={2.4} /> {formatStars(stars["optikk-frontend"] || 0)} ·
              Apache 2.0
            </div>
          </a>
          <a
            className="is-ink m-bento-card"
            href={OSS.backend}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <span className="m-bento-icon">
              <Github size={20} />
            </span>
            <h3 className="m-h4">optikk-backend</h3>
            <p className="m-body-sm">
              Go core backend engine. Handles high-throughput ingestion, storage, and AI-assisted
              query resolution.
            </p>
            <div className="m-bento-link">
              <Star size={13} strokeWidth={2.4} /> {formatStars(stars["optikk-backend"] || 0)} ·
              Apache 2.0
            </div>
          </a>
          <a
            className="is-ink m-bento-card"
            href={OSS.scheduler}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <span className="m-bento-icon">
              <Github size={20} />
            </span>
            <h3 className="m-h4">scheduler</h3>
            <p className="m-body-sm">
              Distributed Go scheduling engine for alerting pipelines and tasks orchestration.
            </p>
            <div className="m-bento-link">
              <Star size={13} strokeWidth={2.4} /> {formatStars(stars.scheduler || 0)} · Apache
              2.0
            </div>
          </a>
          <a
            className="is-ink m-bento-card"
            href={OSS.otelDemo}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <span className="m-bento-icon">
              <Github size={20} />
            </span>
            <h3 className="m-h4">opentelemetry-demo</h3>
            <p className="m-body-sm">
              Astronomy Shop microservices demonstration instrumented with OpenTelemetry.
            </p>
            <div className="m-bento-link">
              <Star size={13} strokeWidth={2.4} /> {formatStars(stars["opentelemetry-demo"] || 0)}{" "}
              · Apache 2.0
            </div>
          </a>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 28,
            justifyContent: "center",
          }}
        >
          <a
            className="m-btn m-btn-primary"
            href={OSS.frontend}
            target="_blank"
            rel="noreferrer"
            style={{ background: "#fff", color: "var(--m-ink)", borderColor: "#fff" }}
          >
            <Star size={16} strokeWidth={2.4} />
            Star on GitHub · {formatStars(totalStars)}
          </a>
          <a
            className="m-btn m-btn-secondary"
            href={OSS.org}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "transparent",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            All repos
          </a>
        </div>
      </div>
    </section>
  );
}
