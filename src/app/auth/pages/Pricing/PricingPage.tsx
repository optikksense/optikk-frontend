import { useNavigate } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import "./Pricing.css";

const PRICE_PER_GB = 0.05;
/** Illustrative blended rate for legacy SaaS APM+log bundles (not a quote). */
const ILLUSTRATIVE_LEGACY_PER_GB = 1.25;

export default function PricingPage() {
  const navigate = useNavigate();
  const [gb, setGb] = useState(400);
  const [copied, setCopied] = useState(false);

  const optikkMonthly = gb * PRICE_PER_GB;
  const legacyMonthly = gb * ILLUSTRATIVE_LEGACY_PER_GB;
  const savings = Math.max(0, legacyMonthly - optikkMonthly);

  const curl = "curl -sS https://install.optikk.io | bash -s -- --token <YOUR_TOKEN>";

  return (
    <div className="pricing-container" style={{ position: "relative", zIndex: 10 }}>
      <main className="pricing-main">
        <header className="pricing-hero">
          <h1 className="pricing-title">Ingest pricing that stays honest</h1>
          <p className="pricing-subtitle">
            $0.05 per GB from the first gigabyte. Every product surface — metrics, traces, logs, LLM
            observability, alerts, and service maps — ships on every plan. No feature tiers tied to
            ransom pricing.
          </p>
        </header>

        <div className="plan-card-wrapper">
          <div className="plan-card plan-card--glow">
            <div className="plan-badge">Optikk Cloud · OTLP</div>
            <div className="cloud-price-display">
              <span className="cloud-price-amount">0.05</span>
              <div className="cloud-price-meta">
                <span className="cloud-price-unit">USD / GB ingested</span>
                <span className="cloud-price-minimum">Billed monthly · no seat tax</span>
              </div>
            </div>
            <p className="plan-tagline">
              OpenTelemetry-native pipeline, Kafka-backed ingestion, and ClickHouse storage — the
              same architecture you can run on-prem.
            </p>
            <ul className="feature-list">
              {[
                "Unlimited users & SSO (SAML/OIDC) included",
                "Retention controls per signal type",
                "Regional deployments & encryption in transit/at rest",
                "99.9% SLA targets on managed cells",
                "Export to Parquet or your own bucket for portability",
              ].map((t) => (
                <li key={t}>
                  <Check size={18} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <div className="code-block-wrapper">
              <div className="code-block">
                <code>{curl}</code>
                <button
                  type="button"
                  className={`copy-btn${copied ? " copied" : ""}`}
                  aria-label="Copy install command"
                  onClick={async () => {
                    await navigator.clipboard.writeText(curl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            <div className="plan-cta-group">
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate({ to: "/login" })}
              >
                Create workspace
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate({ to: "/self-host" })}
              >
                Compare with self-host
              </button>
            </div>
          </div>
        </div>

        <div className="gb-calculator">
          <div className="calc-label">Estimator</div>
          <p className="calc-gb-display">Monthly ingest volume: {gb} GB</p>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={gb}
            className="gb-slider"
            aria-valuetext={`${gb} gigabytes`}
            onChange={(e) => setGb(Number(e.target.value))}
          />
          <div className="calc-output">
            <div className="calc-optikk">
              <span className="calc-optikk-label">Optikk Cloud</span>
              <span className="calc-optikk-value">
                $
                {optikkMonthly.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="calc-datadog">
              <span className="calc-datadog-label">Illustrative legacy stack</span>
              <span className="calc-datadog-value">
                ~$
                {legacyMonthly.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="calc-datadog-note">Blended $/GB estimate — not vendor pricing</span>
            </div>
            <div className="calc-save">
              <span className="calc-save-label">Delta vs illustration</span>
              <span className="calc-save-value">
                ~$
                {savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="calc-save-note">Your savings will vary with contracts</span>
            </div>
          </div>
          <p className="calc-volume-note">
            Numbers are for directional comparison only. Talk to us for committed-use discounts
            above 50 TB/mo.
          </p>
        </div>

        <section className="enterprise-section">
          <div className="section-label">Enterprise add-ons</div>
          <div className="enterprise-grid">
            {[
              {
                title: "VPC peering & private link",
                desc: "Keep ingest off the public internet with AWS/Azure/GCP private endpoints.",
              },
              {
                title: "Compliance bundles",
                desc: "HIPAA BAA, ISO/SOC reports, and customer-managed keys on request.",
              },
              {
                title: "Premium support",
                desc: "Named solutions engineer, runbooks for your clusters, and shared on-call bridge.",
              },
            ].map((card) => (
              <div key={card.title} className="enterprise-card">
                <div className="enterprise-icon" />
                <div className="enterprise-card-title">{card.title}</div>
                <p className="enterprise-card-desc">{card.desc}</p>
                <a className="enterprise-link" href="mailto:sales@optikk.io">
                  Contact sales →
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="compare-section">
          <div className="section-label">Capability matrix</div>
          <div style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th className="col-self-hosted">Self-hosted MIT core</th>
                  <th className="col-cloud">Optikk Cloud</th>
                  <th className="col-datadog">Typical SaaS bundle</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["OpenTelemetry native ingest", true, true, "partial"],
                  ["Metrics + traces + logs unified", true, true, true],
                  ["All features at minimum tier", true, true, false],
                  ["Per-GB (not per-host) metering", true, true, false],
                  ["Portable storage (S3/Parquet export)", true, true, "partial"],
                  ["No mandatory proprietary agent", true, true, false],
                ].map(([label, sh, cloud, leg]) => (
                  <tr key={String(label)}>
                    <td>{label}</td>
                    <td>
                      <span className="compare-check">✓</span>
                    </td>
                    <td>
                      <span className="compare-check">✓</span>
                    </td>
                    <td>
                      {leg === true ? (
                        <span className="compare-check">✓</span>
                      ) : leg === "partial" ? (
                        <span className="compare-partial">~</span>
                      ) : (
                        <span className="compare-x">×</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="footer-cta-section">
          <p className="footer-cta-text">Ready to route OTLP to Optikk?</p>
          <div className="footer-cta-btns">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate({ to: "/login" })}
            >
              Start sending data
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate({ to: "/architecture" })}
            >
              Read the architecture
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
