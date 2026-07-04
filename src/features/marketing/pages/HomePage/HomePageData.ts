import { Workflow, Bot, Network, Layers, Shield, Github } from "lucide-react";
import { OSS } from "../../constants";

export const STACK_LOGOS = [
  { name: "OpenTelemetry" },
  { name: "Kafka" },
  { name: "ClickHouse" },
  { name: "MySQL" },
  { name: "Redis" },
  { name: "Kubernetes" },
  { name: "Prometheus" },
  { name: "AWS" },
  { name: "GCP" },
  { name: "Azure" },
];

export const PILLARS = [
  {
    icon: Workflow,
    title: "Unified storage, three signals",
    body: "Logs, metrics, and traces all land in the same high-performance columnar database. One query language, one cache, one place to look.",
    link: { label: "See architecture", path: "/architecture" },
    variant: "wide" as const,
  },
  {
    icon: Bot,
    title: "AI SRE on call",
    body: "Ask what changed, which deploy broke prod, where the latency leaked. Answers grounded in your telemetry graph.",
    link: { label: "Meet the AI SRE", path: "/features#ai-sre" },
    variant: "ink" as const,
  },
  {
    icon: Network,
    title: "Context Graph",
    body: "Services, deploys, hosts, pods, queries, and users are first-class entities — not strings to grep.",
    link: { label: "How it works", path: "/architecture" },
  },
  {
    icon: Layers,
    title: "OpenTelemetry-native",
    body: "Point your OTLP collector at us. Keep the schema you already have, drop the agent fleet you don't want.",
    link: { label: "OTel quickstart", path: "/opentelemetry" },
  },
  {
    icon: Shield,
    title: "Flexible Deployments",
    body: "Run in your private cloud, VPC, or fully air-gapped. Select the blast radius you can defend, with complete code parity.",
    link: { label: "Deployment options", path: "/self-host" },
    variant: "grad" as const,
  },
  {
    icon: Github,
    title: "Open source at the core",
    body: "Engine, scheduler, and frontend dashboard are Apache 2.0. Self-host the whole stack from public repos with a single helm command.",
    link: { label: "View on GitHub", path: OSS.org },
  },
];

export const COMPARE_ROWS = [
  {
    label: "Open source (Apache 2.0)",
    cells: [false, true, "partial", "partial"] as const,
  },
  {
    label: "Built on off-the-shelf primitives",
    cells: [false, true, "partial", "partial"] as const,
  },
  {
    label: "OTLP-native ingest",
    cells: [true, true, "partial", true] as const,
  },
  {
    label: "Logs · metrics · traces unified",
    cells: [true, true, true, true] as const,
  },
  {
    label: "AI investigations grounded in graph",
    cells: [false, true, false, "partial"] as const,
  },
  {
    label: "Self-host (full feature parity)",
    cells: [false, true, false, "partial"] as const,
  },
  {
    label: "Free tag cardinality",
    cells: [false, true, "partial", "partial"] as const,
  },
];
