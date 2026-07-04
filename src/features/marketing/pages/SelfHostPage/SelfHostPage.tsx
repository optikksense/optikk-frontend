import { Link } from "@tanstack/react-router";
import { Check, Database, Layers, ServerCog, ShieldCheck, Terminal } from "lucide-react";


import { OSS } from "../../constants";
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
    icon: Terminal,
    name: "Docker Compose (Local)",
    pitch: "Perfect for local development, testing, and small telemetry volumes.",
    features: [
      "Up in 10 seconds via docker-compose",
      "Includes mock generator feeds",
      "Zero external dependencies required",
      "Ideal for laptop/sandbox environments",
    ],
    cta: { label: "View Compose config", path: OSS.frontend },
  },
  {
    icon: ServerCog,
    name: "Kubernetes (Helm)",
    pitch: "Production-scale deployment with bundled analytical infrastructure.",
    features: [
      "Bundles Kafka, ClickHouse, MySQL, Redis",
      "Stateless ingestion autoscaling",
      "Built-in data retention policies",
      "Rolling upgrades supported out-of-the-box",
    ],
    cta: { label: "Read Helm guide", path: "/architecture" },
    featured: true,
  },
  {
    icon: Layers,
    name: "Terraform (IaC)",
    pitch: "Deploy into your cloud VPC utilizing managed infrastructure services.",
    features: [
      "Integrates MSK, RDS, and ElastiCache",
      "Fully isolated private networking",
      "IAM-based access controls",
      "S3 / GCS deep-storage integration",
    ],
    cta: { label: "View TF modules", path: OSS.org },
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Data residency by default",
    body: "Run within your security boundary. S3, Kafka, ClickHouse, MySQL, and Redis remain completely within your VPC.",
  },
  {
    icon: ServerCog,
    title: "Built-in SSO",
    body: "Connect your existing identity providers using SAML SSO and IDP group mapping. Secure by default, no paywalls.",
  },
  {
    icon: Database,
    title: "Retention tiering",
    body: "Store hot data in ClickHouse, warm in compressed storage parts, and cold in S3/GCS buckets. Keep up to 7 years of history.",
  },
  {
    icon: Terminal,
    title: "AI SRE integrated",
    body: "Grounded AI diagnostic helpers ship natively in the core. Get summaries and diagnostics on your telemetry graph.",
  },
];

const FAQS = [
  {
    question: "Do you offer commercial support?",
    answer:
      "Optikk is 100% open source under the Apache 2.0 license. We do not offer paid commercial support plans or proprietary add-ons. All features, databases, and setups are fully available to the community for free.",
  },
  {
    question: "How big does the Kubernetes cluster need to be?",
    answer:
      "For up to 10 TB/day of telemetry: a 12-node Kubernetes cluster (8 vCPU / 32 GiB nodes) with a 6-broker Kafka, a 6-shard ClickHouse, a managed or self-run MySQL, and a 3-node Redis. The Helm chart bundles all of it; we provide sizing worksheets for higher scales.",
  },
  {
    question: "Do you support HIPAA / compliance?",
    answer:
      "Yes. Since you host the entire platform in your own infrastructure, all data stays within your compliance boundary. Optikk is fully compatible with HIPAA, SOC 2, and FedRAMP requirements when deployed inside your audited environment.",
  },
  {
    question: "Is there a paid enterprise edition?",
    answer:
      "No, Optikk is fully committed to open source. There are no closed-source enterprise forks or feature-gated editions. Every capability (including SAML SSO, clustering, and AI SRE) is included in the open-source repository.",
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
        subtitle="Run Optikk fully self-hosted in your Kubernetes cluster, private cloud, or air-gapped environments. Same engine, same AI SRE, complete data control."
        primaryCta={{
          label: "View on GitHub",
          path: OSS.org,
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
                {mode.cta.path.startsWith("mailto:") || mode.cta.path.startsWith("http") ? (
                  <a
                    className={`m-btn ${mode.featured ? "m-btn-primary" : "m-btn-secondary"}`}
                    href={mode.cta.path}
                    target={mode.cta.path.startsWith("http") ? "_blank" : undefined}
                    rel={mode.cta.path.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {mode.cta.label}
                  </a>
                ) : (
                  <Link
                    to={(mode.cta.path as string & {})}
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
            eyebrow="Open source foundation"
            title={
              <>
                What we build into <GradientText>the core</GradientText>, free forever.
              </>
            }
            lede="No paywalls for the bits that should be defaults: SSO, audit logs, custom retention, and high-availability setups. They're in the box from day one."
          />
          <FeatureGrid items={FEATURES} />
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
              lede="One Helm chart bundles Kafka, ClickHouse, MySQL, and Redis. Point it at a Kubernetes cluster — the chart handles the rest, including rolling upgrades."
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
            Deploy in minutes. <span style={{ color: "#fdba74" }}>Own your telemetry.</span>
          </>
        }
        subtitle="Join our community of developers self-hosting Optikk. Sizing documentation and Helm charts are available on GitHub."
        primary={{ label: "View on GitHub", path: OSS.org }}
        secondary={{ label: "Read architecture", path: "/architecture", variant: "secondary" }}
      />
    </>
  );
}
