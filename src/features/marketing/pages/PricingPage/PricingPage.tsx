import {
  AlertTriangle,
  Bot,
  Cpu,
  DatabaseBackup,
  Globe,
  HardDrive,
  Lock,
  Network,
} from "lucide-react";
import { GradientText } from "../../motion/GradientText";
import { CTA } from "../../sections/CTA";
import { FAQ } from "../../sections/FAQ";
import { FeatureGrid } from "../../sections/FeatureGrid";
import { Hero } from "../../sections/Hero";
import { PricingTable } from "../../sections/PricingTable";
import { SectionHeader } from "../../sections/SectionHeader";

const TIERS = [
  {
    name: "Logs",
    price: "$0.45",
    priceUnit: "per GiB ingested",
    description: "30-day hot retention included. Compress + cold-tier any time.",
    features: [
      "Sub-second query on hot data",
      "Live tail with DSL filters",
      "Auto-cluster patterns",
      "Webhook + Slack + PagerDuty",
      "Cold tier archive (1¢/GiB/mo)",
    ],
    cta: { label: "Start free", path: "/login" },
    badge: "Most popular",
    featured: true,
  },
  {
    name: "Metrics",
    price: "$0.007",
    priceUnit: "per DPM (data point/min)",
    description: "Unlimited cardinality. PromQL native. No tag-tax surcharges.",
    features: [
      "Prometheus-compatible queries",
      "OTLP + StatsD + Prometheus ingest",
      "Recording rules + SLOs as code",
      "AI baselines + seasonal alerts",
      "13-month default retention",
    ],
    cta: { label: "Start free", path: "/login" },
  },
  {
    name: "Traces",
    price: "$0.55",
    priceUnit: "per GiB span data",
    description: "Tail-based sampling included. Compare any two traces.",
    features: [
      "Full-fidelity OTLP ingest",
      "Span diff + flamegraph",
      "10-tab span drawer",
      "Service map + dependency view",
      "Continuous profile join (preview)",
    ],
    cta: { label: "Start free", path: "/login" },
  },
];

const INCLUDED = [
  {
    icon: Bot,
    title: "AI SRE",
    body: "Investigations, runbooks, post-incident summaries. Capped per workspace, not metered per token.",
  },
  {
    icon: Network,
    title: "Context Graph",
    body: "Services, deploys, hosts, pods, users — all entities are first-class, no extra charge.",
  },
  {
    icon: HardDrive,
    title: "Operable stack",
    body: "Kafka, ClickHouse, MySQL, Redis. Tools your platform team already runs. Export raw events any time.",
  },
  {
    icon: DatabaseBackup,
    title: "Cold tier archive",
    body: "1¢ per GiB-month. Re-ingest with one click. Compliance retention up to 7 years.",
  },
  {
    icon: AlertTriangle,
    title: "Alerts + paging",
    body: "PagerDuty, Opsgenie, Slack, Teams, generic webhook. AI-routed by service ownership.",
  },
  {
    icon: Globe,
    title: "Multi-region",
    body: "EU, US, APAC residency at the same per-GiB rate. Data never crosses your chosen border.",
  },
  {
    icon: Lock,
    title: "SAML / SCIM / SSO",
    body: "On every plan, no enterprise upcharge. Mapping via IDP groups.",
  },
  {
    icon: Cpu,
    title: "Self-host parity",
    body: "Helm chart, air-gapped binaries, or BYOC. Same product, same pricing model.",
  },
];

const FAQS = [
  {
    question: "How does the per-GiB / per-DPM pricing differ from Datadog?",
    answer:
      "Datadog charges per host, per custom metric, and per indexed log — and tag cardinality drives most of the bill. Optikk charges per byte of telemetry you actually ingest. Tags, dimensions, and span attributes are free. There are no host multipliers and no seat charges.",
  },
  {
    question: "Is there really a free tier?",
    answer:
      "Yes. 5 GiB/day of logs, 50M DPM, and 5 GiB/day of trace data — forever, no credit card. You only graduate to paid when your steady-state ingest passes the free quota.",
  },
  {
    question: "What happens if I exceed my plan?",
    answer:
      "Nothing punishing. You can set a hard cap (we drop new ingest), a soft cap (we keep ingesting and email you), or simply pay the on-demand rate. No tier walls, no contract surprises.",
  },
  {
    question: "Can I self-host and pay the same rates?",
    answer:
      "Yes. The self-host plan is metered on the same per-GiB/per-DPM basis. You provide the Kubernetes cluster (Kafka, ClickHouse, MySQL, and Redis are bundled in the Helm chart); we license the engine, ship updates, and stay out of your data path.",
  },
  {
    question: "Do you offer enterprise contracts?",
    answer:
      "We do. Annual commits get a 25–35% discount, customer-side data residency guarantees, and a named SRE for the first 90 days. Talk to us via the Self-host page.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Hero
        eyebrow="Pricing"
        title={
          <>
            Pay for the rate you <GradientText>actually ingest.</GradientText>
          </>
        }
        subtitle="Three meters, no tier walls. Free up to 5 GiB/day. Self-host or SaaS at the same rate. Compute scales only when you query."
        primaryCta={{ label: "Start free", path: "/login", variant: "grad" }}
        secondaryCta={{ label: "Estimate my bill", path: "#calculator", variant: "secondary" }}
        meta={["No seat fees", "No host fees", "No custom-metric fees"]}
      />

      <section className="m-section m-section--tight">
        <div className="m-container">
          <PricingTable tiers={TIERS} />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <SectionHeader
            eyebrow="Included on every plan"
            title={
              <>
                Everything below comes free. <GradientText>No enterprise gating.</GradientText>
              </>
            }
            lede="The capabilities other vendors hide behind a sales call are part of the base product."
          />
          <FeatureGrid items={INCLUDED} />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <SectionHeader eyebrow="Common questions" title="Pricing FAQ" align="center" />
          <FAQ items={FAQS} />
        </div>
      </section>

      <CTA
        title={
          <>
            Bring your collector. <span style={{ color: "#fdba74" }}>Keep your budget.</span>
          </>
        }
        subtitle="Set up takes about 4 minutes if you already emit OpenTelemetry. We'll spot you the first 5 GiB/day."
        primary={{ label: "Start free", path: "/login" }}
        secondary={{ label: "Talk to sales", path: "/self-host", variant: "secondary" }}
      />
    </>
  );
}
