import { Link } from "@tanstack/react-router";
import { Check, Cloud, ServerCog, ShieldCheck } from "lucide-react";

import { dynamicTo } from "@/shared/utils/navigation";

import { GradientText } from "../../motion/GradientText";
import { Reveal } from "../../motion/Reveal";
import { Stagger, StaggerItem } from "../../motion/Stagger";
import { CTA } from "../../sections/CTA";
import { CodeBlock } from "../../sections/CodeBlock";
import { FAQ } from "../../sections/FAQ";
import { FeatureGrid } from "../../sections/FeatureGrid";
import { Hero } from "../../sections/Hero";
import { SectionHeader } from "../../sections/SectionHeader";

const MODES = [
  {
    icon: Cloud,
    name: "Optikk Cloud",
    pitch: "Fully managed. SOC 2 Type II. EU / US / APAC.",
    features: [
      "5-min onboarding",
      "Auto-scaling ingest + query",
      "99.95% SLA",
      "Pager rotation handled",
    ],
    cta: { label: "Start free", path: "/login" },
  },
  {
    icon: ServerCog,
    name: "Bring Your Own Cloud",
    pitch: "Data plane in your VPC. Control plane in ours. Same SLA.",
    features: [
      "Your Kafka, your ClickHouse, your KMS keys",
      "No telemetry leaves your VPC",
      "Engineer-attached for first 30 days",
      "EU / US data residency",
    ],
    cta: { label: "Get a demo", path: "mailto:hello@optikk.dev?subject=BYOC" },
    featured: true,
  },
  {
    icon: ShieldCheck,
    name: "Self-host (air-gapped)",
    pitch: "Helm chart on your Kubernetes. Fully offline supported.",
    features: [
      "Air-gapped binaries available",
      "Customer-owned upgrade cadence",
      "FedRAMP-aligned controls",
      "License keys, no phone-home",
    ],
    cta: { label: "Talk to engineering", path: "mailto:hello@optikk.dev?subject=Self-host" },
  },
];

const ENTERPRISE = [
  {
    icon: ShieldCheck,
    title: "Data residency, real",
    body: "Pick a region; pick a Kafka cluster and a ClickHouse cluster. Telemetry never leaves the boundary. Audited via deployment manifest.",
  },
  {
    icon: ServerCog,
    title: "Identity that fits IT",
    body: "SAML SSO, SCIM provisioning, SCIM deprovisioning, IDP group → role mapping. On every plan.",
  },
  {
    icon: Cloud,
    title: "Retention without anxiety",
    body: "Tier hot data in ClickHouse, warm in compressed parts, cold in object-storage archive. 7-year compliance retention supported.",
  },
  {
    icon: ShieldCheck,
    title: "Support that owns outcomes",
    body: "Named SRE for first 90 days. 15-minute response on P1. Optional white-glove on-call coverage.",
  },
];

const FAQS = [
  {
    question: "What's the difference between BYOC and self-host?",
    answer:
      "BYOC = Optikk's control plane manages a data plane that runs in your VPC. Self-host = you operate both. BYOC is more like SaaS-with-data-residency; self-host is more like Postgres-you-host. Air-gapped customers pick self-host.",
  },
  {
    question: "How big does the Kubernetes cluster need to be?",
    answer:
      "For up to 10 TB/day of telemetry: a 12-node Kubernetes cluster (8 vCPU / 32 GiB nodes) with a 6-broker Kafka, a 6-shard ClickHouse, a managed or self-run MySQL, and a 3-node Redis. The Helm chart bundles all of it; we provide sizing worksheets for higher scales.",
  },
  {
    question: "Do you support FedRAMP / HIPAA?",
    answer:
      "We support customers in HIPAA contexts via BAA on Cloud and BYOC. FedRAMP authorization is in progress for 2026; the self-host distribution ships the same control set today.",
  },
  {
    question: "Is the self-host edition crippled vs Cloud?",
    answer:
      "No. Same engine, same UI, same AI SRE. The only difference is who owns the operational toil. Pricing also matches — we don't charge a self-host premium.",
  },
];

export default function SelfHostPage() {
  return (
    <>
      <Hero
        eyebrow="Deployment options"
        title={
          <>
            Run Optikk where your data <GradientText>is supposed to live.</GradientText>
          </>
        }
        subtitle="Cloud, your VPC, or fully air-gapped. Same engine, same AI SRE, same per-GiB pricing. Pick the blast radius you can defend."
        primaryCta={{
          label: "Talk to engineering",
          path: "mailto:hello@optikk.dev",
          variant: "grad",
        }}
        secondaryCta={{ label: "Architecture", path: "/architecture", variant: "secondary" }}
      />

      <section className="m-section m-section--tight">
        <div className="m-container">
          <Stagger className="m-deploy-grid">
            {MODES.map((mode) => (
              <StaggerItem
                key={mode.name}
                as="article"
                className={`m-deploy-card${mode.featured ? " is-featured" : ""}`}
              >
                <span className="m-bento-icon">
                  <mode.icon size={20} />
                </span>
                <h3 className="m-h3">{mode.name}</h3>
                <p className="m-body">{mode.pitch}</p>
                <ul className="m-price-list" style={{ flex: 1 }}>
                  {mode.features.map((f) => (
                    <li key={f}>
                      <Check size={16} strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {mode.cta.path.startsWith("mailto:") ? (
                  <a
                    className={`m-btn ${mode.featured ? "m-btn-primary" : "m-btn-secondary"}`}
                    href={mode.cta.path}
                  >
                    {mode.cta.label}
                  </a>
                ) : (
                  <Link
                    to={dynamicTo(mode.cta.path)}
                    className={`m-btn ${mode.featured ? "m-btn-primary" : "m-btn-secondary"}`}
                  >
                    {mode.cta.label}
                  </Link>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="m-section" id="security">
        <div className="m-container">
          <SectionHeader
            eyebrow="Enterprise foundation"
            title={
              <>
                What we ship to <GradientText>every team</GradientText>, not just enterprise.
              </>
            }
            lede="No upcharge for the bits that should be defaults: SSO, residency, audit logs, retention. They're in the box from day one."
          />
          <FeatureGrid items={ENTERPRISE} />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <Reveal>
            <SectionHeader
              eyebrow="Helm chart"
              title={
                <>
                  Install in one command. <GradientText>Customize the rest in YAML.</GradientText>
                </>
              }
              lede="One Helm chart bundles Kafka, ClickHouse, MySQL, and Redis. Point it at a Kubernetes cluster and a license key — the chart handles the rest, including rolling upgrades."
              align="left"
            />
          </Reveal>
          <CodeBlock
            tabs={[
              {
                label: "helm",
                content: `helm repo add optikk https://charts.optikk.dev
helm install optikk optikk/optikk \\
  --namespace optikk --create-namespace \\
  --set license.key=$OPTIKK_LICENSE \\
  --set kafka.brokers=6 \\
  --set clickhouse.shards=6 \\
  --set mysql.replicas=2 \\
  --set redis.replicas=3 \\
  --set ai.enabled=true

# → ingest in 90s, UI in 3 min`,
              },
              {
                label: "terraform",
                content: `module "optikk" {
  source            = "optikk/optikk/aws"
  version           = "~> 1.0"
  vpc_id            = aws_vpc.main.id
  kafka_cluster_arn = aws_msk_cluster.optikk.arn
  clickhouse_subnets = aws_subnet.optikk.*.id
  mysql_endpoint    = aws_rds_cluster.optikk.endpoint
  redis_endpoint    = aws_elasticache_replication_group.optikk.primary_endpoint_address
  license           = var.optikk_license
}`,
              },
            ]}
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <SectionHeader eyebrow="Common questions" title="Self-host FAQ" align="center" />
          <FAQ items={FAQS} />
        </div>
      </section>

      <CTA
        title={
          <>
            Pick the deployment. <span style={{ color: "#fdba74" }}>We bring the engineers.</span>
          </>
        }
        subtitle="Send us your environment shape and we'll have a sizing doc back within a business day."
        primary={{ label: "hello@optikk.dev", path: "mailto:hello@optikk.dev" }}
        secondary={{ label: "Read architecture", path: "/architecture", variant: "secondary" }}
      />
    </>
  );
}
