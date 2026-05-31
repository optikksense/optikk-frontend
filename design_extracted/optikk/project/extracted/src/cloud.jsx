/* global React, Icon, AreaSpark, MiniSpark, Bars, PageHeader, Tabs, seededWave */
const { useState: useStateCloud, useMemo: useMemoCloud } = React;

/* =========================================================
   CLOUD — AWS / GCP / Azure integration & inventory landing
   ========================================================= */

/* ---------- abstract provider marks (NOT the trademarked logos) ---------- */
function ProviderMark({ p, size = 22 }) {
  const s = size;
  if (p === "aws") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="3.5" width="8" height="8" rx="1.5" fill="#f59e0b"/>
        <rect x="13.5" y="3.5" width="8" height="8" rx="1.5" fill="#fb923c" opacity="0.85"/>
        <rect x="8" y="12.5" width="8" height="8" rx="1.5" fill="#f97316"/>
      </svg>
    );
  }
  if (p === "gcp") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="9" r="4.5" fill="#34d399"/>
        <circle cx="15" cy="9" r="4.5" fill="#60a5fa" opacity="0.9"/>
        <circle cx="12" cy="15.5" r="4.5" fill="#fbbf24" opacity="0.95"/>
      </svg>
    );
  }
  if (p === "azure") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 19L11 4l4 8-5 7H3z" fill="#60a5fa"/>
        <path d="M21 19L13 6l-2 4 6 9h4z" fill="#22d3ee" opacity="0.85"/>
      </svg>
    );
  }
  return null;
}

const PROVIDERS = {
  aws:   { id: "aws",   name: "AWS",   accent: "#f97316", soft: "rgba(249,115,22,0.14)",   line: "rgba(249,115,22,0.32)" },
  gcp:   { id: "gcp",   name: "GCP",   accent: "#34d399", soft: "rgba(52,211,153,0.14)",   line: "rgba(52,211,153,0.32)" },
  azure: { id: "azure", name: "Azure", accent: "#22d3ee", soft: "rgba(34,211,238,0.14)",   line: "rgba(34,211,238,0.32)" },
};

/* ---------- per-cloud reference data ---------- */
const CLOUDS = {
  aws: {
    p: PROVIDERS.aws,
    summary: {
      accounts: 14, regions: 9, resources: 4128, alerts: 11, alertsErr: 2,
      cost: "$486.2k", costDelta: "+4.8%", lastSync: "31s ago", health: "warn",
      iam: "OrganizationAccountAccessRole", roleArn: "arn:aws:iam::748392···:role/OptikkObservability",
    },
    services: [
      { id: "ec2",        name: "EC2",            cat: "compute",  count: 482,  alert: 3, util: 68, seed: 21 },
      { id: "eks",        name: "EKS",            cat: "compute",  count: 18,   alert: 1, util: 74, seed: 22 },
      { id: "lambda",     name: "Lambda",         cat: "compute",  count: 942,  alert: 0, util: 41, seed: 23 },
      { id: "fargate",    name: "Fargate",        cat: "compute",  count: 86,   alert: 0, util: 52, seed: 24 },
      { id: "rds",        name: "RDS",            cat: "data",     count: 38,   alert: 2, util: 82, seed: 25 },
      { id: "dynamodb",   name: "DynamoDB",       cat: "data",     count: 64,   alert: 0, util: 38, seed: 26 },
      { id: "elasticache",name: "ElastiCache",    cat: "data",     count: 22,   alert: 1, util: 64, seed: 27 },
      { id: "s3",         name: "S3",             cat: "storage",  count: 312,  alert: 0, util: 24, seed: 28 },
      { id: "ebs",        name: "EBS",            cat: "storage",  count: 1280, alert: 0, util: 58, seed: 29 },
      { id: "alb",        name: "ALB / NLB",      cat: "network",  count: 46,   alert: 1, util: 36, seed: 30 },
      { id: "cloudfront", name: "CloudFront",     cat: "network",  count: 14,   alert: 0, util: 28, seed: 31 },
      { id: "route53",    name: "Route 53",       cat: "network",  count: 142,  alert: 0, util: 12, seed: 32 },
      { id: "sqs",        name: "SQS",            cat: "events",   count: 88,   alert: 1, util: 44, seed: 33 },
      { id: "sns",        name: "SNS",            cat: "events",   count: 44,   alert: 0, util: 18, seed: 34 },
      { id: "msk",        name: "MSK (Kafka)",    cat: "events",   count: 12,   alert: 2, util: 78, seed: 35 },
      { id: "bedrock",    name: "Bedrock",        cat: "ai",       count: 6,    alert: 0, util: 64, seed: 36 },
    ],
    resources: [
      { id: "i-0a1b2c3d", svc: "EC2",      region: "us-east-1a", env: "prod", health: "err",  metric: "CPU 94%", cost: "$1,240" },
      { id: "pg-primary-2", svc: "RDS",    region: "us-east-1a", env: "prod", health: "warn", metric: "Conns 312", cost: "$2,820" },
      { id: "eks/payments-prod", svc: "EKS", region: "us-east-1", env: "prod", health: "warn", metric: "82% saturated", cost: "$4,108" },
      { id: "msk-cluster-1", svc: "MSK",   region: "us-east-1", env: "prod", health: "err",  metric: "ISR shrunk", cost: "$3,210" },
      { id: "checkout-handler", svc: "Lambda", region: "us-east-1", env: "prod", health: "ok", metric: "p99 184ms", cost: "$612" },
      { id: "media-prod-cdn", svc: "CloudFront", region: "global", env: "prod", health: "ok", metric: "4xx 0.4%", cost: "$2,140" },
      { id: "audit-logs-bucket", svc: "S3", region: "us-east-1", env: "prod", health: "ok", metric: "12.4 TB", cost: "$346" },
      { id: "alb-checkout", svc: "ALB", region: "us-east-1", env: "prod", health: "warn", metric: "5xx 1.2%", cost: "$182" },
    ],
    activity: [
      { t: "31s ago", kind: "sync",   text: "CloudWatch metrics polled · 18 namespaces · 1,248 metrics" },
      { t: "4m ago",  kind: "discover", text: "Discovered new EKS cluster fraud-prod in us-east-1" },
      { t: "12m ago", kind: "alert",  text: "RDS pg-primary-2 free storage <10% — alert opened" },
      { t: "1h ago",  kind: "iam",    text: "Permission warning — OptikkObservability missing kms:Decrypt in 2 acc." },
      { t: "3h ago",  kind: "tag",    text: "Tag policy enforced: 12 untagged resources flagged" },
    ],
  },

  gcp: {
    p: PROVIDERS.gcp,
    summary: {
      accounts: 6, regions: 7, resources: 2186, alerts: 6, alertsErr: 1,
      cost: "$214.8k", costDelta: "+2.1%", lastSync: "42s ago", health: "warn",
      iam: "Service Account · roles/monitoring.viewer + roles/logging.viewer",
      roleArn: "optikk-obs@optikk-sre-prod.iam.gserviceaccount.com",
    },
    services: [
      { id: "gce",     name: "Compute Engine", cat: "compute", count: 264, alert: 1, util: 62, seed: 41 },
      { id: "gke",     name: "GKE",            cat: "compute", count: 14,  alert: 0, util: 71, seed: 42 },
      { id: "run",     name: "Cloud Run",      cat: "compute", count: 122, alert: 0, util: 38, seed: 43 },
      { id: "fn",      name: "Cloud Functions",cat: "compute", count: 348, alert: 1, util: 28, seed: 44 },
      { id: "sql",     name: "Cloud SQL",      cat: "data",    count: 24,  alert: 1, util: 76, seed: 45 },
      { id: "spanner", name: "Spanner",        cat: "data",    count: 4,   alert: 0, util: 58, seed: 46 },
      { id: "bigtable",name: "Bigtable",       cat: "data",    count: 6,   alert: 0, util: 41, seed: 47 },
      { id: "bq",      name: "BigQuery",       cat: "data",    count: 84,  alert: 1, util: 64, seed: 48 },
      { id: "gcs",     name: "Cloud Storage",  cat: "storage", count: 184, alert: 0, util: 22, seed: 49 },
      { id: "lb",      name: "Cloud Load Bal.",cat: "network", count: 32,  alert: 0, util: 34, seed: 50 },
      { id: "vpc",     name: "VPC",            cat: "network", count: 18,  alert: 0, util: 12, seed: 51 },
      { id: "pubsub",  name: "Pub/Sub",        cat: "events",  count: 68,  alert: 1, util: 54, seed: 52 },
      { id: "dataflow",name: "Dataflow",       cat: "events",  count: 12,  alert: 0, util: 42, seed: 53 },
      { id: "vertex",  name: "Vertex AI",      cat: "ai",      count: 8,   alert: 1, util: 71, seed: 54 },
      { id: "memstore",name: "Memorystore",    cat: "data",    count: 10,  alert: 0, util: 48, seed: 55 },
    ],
    resources: [
      { id: "gke-search-prod",   svc: "GKE",       region: "us-central1", env: "prod", health: "warn", metric: "Node pool 78%", cost: "$3,420" },
      { id: "sql-orders-primary",svc: "Cloud SQL", region: "us-central1", env: "prod", health: "err",  metric: "Replica lag 14s", cost: "$2,180" },
      { id: "bq-events-daily",   svc: "BigQuery",  region: "US",          env: "prod", health: "warn", metric: "Slot 92%", cost: "$1,840" },
      { id: "ps-billing-events", svc: "Pub/Sub",   region: "us-central1", env: "prod", health: "warn", metric: "Backlog 84k", cost: "$84" },
      { id: "vertex-recs-endpoint", svc: "Vertex AI", region: "us-central1", env: "prod", health: "warn", metric: "p99 412ms", cost: "$1,240" },
      { id: "gce-checkout-bff",  svc: "GCE",       region: "us-central1-a", env: "prod", health: "ok", metric: "CPU 42%", cost: "$246" },
      { id: "warehouse-bucket",  svc: "GCS",       region: "us",          env: "prod", health: "ok",  metric: "84 TB", cost: "$612" },
    ],
    activity: [
      { t: "42s ago", kind: "sync",     text: "Cloud Monitoring metrics polled · 1,840 series" },
      { t: "8m ago",  kind: "discover", text: "Discovered new Cloud Run service notifications-v3 in us-central1" },
      { t: "22m ago", kind: "alert",    text: "Cloud SQL sql-orders-primary replica lag exceeded 10s — alert opened" },
      { t: "2h ago",  kind: "tag",      text: "Label policy: 8 resources missing 'team' label" },
    ],
  },

  azure: {
    p: PROVIDERS.azure,
    summary: {
      accounts: 4, regions: 6, resources: 1842, alerts: 4, alertsErr: 0,
      cost: "$162.4k", costDelta: "−1.4%", lastSync: "1m ago", health: "ok",
      iam: "App registration · Monitoring Reader",
      roleArn: "optikk-obs · tenant 7e34···· · sp 92ab····",
    },
    services: [
      { id: "vm",      name: "Virtual Machines", cat: "compute", count: 312, alert: 1, util: 58, seed: 61 },
      { id: "aks",     name: "AKS",              cat: "compute", count: 12,  alert: 0, util: 66, seed: 62 },
      { id: "fn",      name: "Functions",        cat: "compute", count: 184, alert: 0, util: 32, seed: 63 },
      { id: "app",     name: "App Service",      cat: "compute", count: 48,  alert: 0, util: 42, seed: 64 },
      { id: "container",name:"Container Apps",   cat: "compute", count: 34,  alert: 0, util: 38, seed: 65 },
      { id: "sql",     name: "Azure SQL",        cat: "data",    count: 28,  alert: 1, util: 71, seed: 66 },
      { id: "cosmos",  name: "Cosmos DB",        cat: "data",    count: 14,  alert: 0, util: 54, seed: 67 },
      { id: "redis",   name: "Cache for Redis",  cat: "data",    count: 12,  alert: 0, util: 48, seed: 68 },
      { id: "blob",    name: "Blob Storage",     cat: "storage", count: 218, alert: 0, util: 28, seed: 69 },
      { id: "files",   name: "Files",            cat: "storage", count: 38,  alert: 0, util: 24, seed: 70 },
      { id: "appgw",   name: "App Gateway",      cat: "network", count: 22,  alert: 1, util: 41, seed: 71 },
      { id: "frontdoor",name:"Front Door",       cat: "network", count: 6,   alert: 0, util: 22, seed: 72 },
      { id: "eventhub",name: "Event Hubs",       cat: "events",  count: 18,  alert: 0, util: 52, seed: 73 },
      { id: "sb",      name: "Service Bus",      cat: "events",  count: 24,  alert: 1, util: 44, seed: 74 },
      { id: "openai",  name: "OpenAI Service",   cat: "ai",      count: 4,   alert: 0, util: 68, seed: 75 },
    ],
    resources: [
      { id: "aks-platform-prod", svc: "AKS",      region: "eastus2", env: "prod", health: "ok",   metric: "Nodes 18 / 24", cost: "$4,210" },
      { id: "sql-customers-w",   svc: "Azure SQL",region: "eastus2", env: "prod", health: "warn", metric: "DTU 84%", cost: "$1,840" },
      { id: "vm-jumpbox-01",     svc: "VM",       region: "westus",  env: "ops",  health: "ok",   metric: "CPU 18%", cost: "$184" },
      { id: "appgw-public",      svc: "App Gateway", region: "eastus2", env: "prod", health: "warn", metric: "5xx 0.8%", cost: "$412" },
      { id: "sb-billing",        svc: "Service Bus", region: "eastus2", env: "prod", health: "warn", metric: "DLQ 124 msgs", cost: "$48" },
      { id: "blob-archives",     svc: "Blob",     region: "eastus2", env: "prod", health: "ok",   metric: "248 TB", cost: "$1,420" },
      { id: "openai-prod",       svc: "OpenAI",   region: "eastus",  env: "prod", health: "ok",   metric: "Tok/s 4.8k", cost: "$2,840" },
    ],
    activity: [
      { t: "1m ago",  kind: "sync",     text: "Azure Monitor metrics polled · 12 subscriptions" },
      { t: "14m ago", kind: "discover", text: "Discovered new AKS node pool spot-pool-1 in eastus2" },
      { t: "40m ago", kind: "alert",    text: "Service Bus sb-billing DLQ depth crossed 100 — alert opened" },
      { t: "2h ago",  kind: "iam",      text: "Service principal token rotated · expires in 88 days" },
    ],
  },
};

const CAT_META = {
  compute: { label: "Compute",   icon: "service",    color: "var(--chart-1)" },
  data:    { label: "Databases", icon: "database",   color: "var(--chart-2)" },
  storage: { label: "Storage",   icon: "logs",       color: "var(--chart-3)" },
  network: { label: "Network",   icon: "trace",      color: "var(--chart-4)" },
  events:  { label: "Streaming", icon: "saturation", color: "var(--chart-6)" },
  ai:      { label: "AI / ML",   icon: "ai",         color: "var(--accent-violet)" },
};

const HEALTH_COLOR = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

/* ===================================================================== */

function CloudScreen({ go, params }) {
  const initial = ["aws", "gcp", "azure"].includes(params.cloud) ? params.cloud : "all";
  const [tab, setTab] = useStateCloud(initial);

  const tabs = [
    { id: "all",   label: "All clouds" },
    { id: "aws",   label: "AWS",   badge: CLOUDS.aws.summary.resources },
    { id: "gcp",   label: "GCP",   badge: CLOUDS.gcp.summary.resources },
    { id: "azure", label: "Azure", badge: CLOUDS.azure.summary.resources },
  ];

  const totalResources = CLOUDS.aws.summary.resources + CLOUDS.gcp.summary.resources + CLOUDS.azure.summary.resources;
  const totalAlerts    = CLOUDS.aws.summary.alerts + CLOUDS.gcp.summary.alerts + CLOUDS.azure.summary.alerts;

  return (
    <div className="page">
      {/* Title */}
      <div className="row" style={{ alignItems: "flex-end", gap: 16 }}>
        <div>
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
            <div className="page-title">Cloud</div>
            <span className="badge warn"><span className="b-dot"/>{totalAlerts} alerts firing</span>
            <span className="badge neutral mono" style={{ fontSize: 11 }}>3 providers · 24 accounts · 22 regions</span>
          </div>
          <div className="page-sub" style={{ marginTop: 4 }}>
            {totalResources.toLocaleString()} resources monitored · last full sync 31s ago · $863.4k spend MTD across providers
          </div>
        </div>
        <div className="spacer"/>
        <button className="btn"><Icon name="filter" size={14}/>env: prod</button>
        <button className="btn"><Icon name="filter" size={14}/>tags</button>
        <button className="btn btn-primary"><Icon name="plus" size={13}/>Add account</button>
      </div>

      <Tabs tabs={tabs} active={tab} setActive={setTab} />

      {tab === "all" && <AllCloudsView go={go} setTab={setTab}/>}
      {tab !== "all" && <CloudDetailView cloud={CLOUDS[tab]} go={go}/>}
    </div>
  );
}

/* ===================================================================== */
/*  ALL CLOUDS — comparison view                                         */
/* ===================================================================== */
function AllCloudsView({ go, setTab }) {
  const totalCost = 486.2 + 214.8 + 162.4; // k
  const totalResources = CLOUDS.aws.summary.resources + CLOUDS.gcp.summary.resources + CLOUDS.azure.summary.resources;
  const totalAlerts    = CLOUDS.aws.summary.alerts + CLOUDS.gcp.summary.alerts + CLOUDS.azure.summary.alerts;
  const totalAccounts  = CLOUDS.aws.summary.accounts + CLOUDS.gcp.summary.accounts + CLOUDS.azure.summary.accounts;

  return (
    <>
      {/* Top-level KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {[
          { l: "Resources", v: totalResources.toLocaleString(), u: "across 3 clouds", d: "+128", cls: "" , seed: 81, color: "var(--chart-1)"},
          { l: "Spend MTD", v: "$863.4k",   u: "+2.6% vs. last month", d: "+2.6%", cls: "down warn", seed: 82, color: "var(--chart-4)" },
          { l: "Alerts firing", v: String(totalAlerts), u: "3 critical · 18 warn",  d: "+5", cls: "down", seed: 83, color: "var(--err)" },
          { l: "Accounts / subs",  v: String(totalAccounts), u: "across providers", d: "0",  cls: "", seed: 84, color: "var(--chart-2)" },
          { l: "Regions active",   v: "22", u: "8 AZs degraded", d: "+1", cls: "down warn", seed: 85, color: "var(--chart-3)" },
        ].map(k => (
          <div key={k.l} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 11.5 }}>{k.l}</div>
              <span className={"delta " + (k.cls || "")} style={{ fontSize: 11 }}>{k.d}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 26, marginTop: 4 }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>{k.u}</div>
            <MiniSpark seed={k.seed} color={k.color} height={26} width={220}/>
          </div>
        ))}
      </div>

      {/* Provider cards (the three big ones) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[CLOUDS.aws, CLOUDS.gcp, CLOUDS.azure].map(c => <ProviderHeroCard key={c.p.id} c={c} onOpen={() => setTab(c.p.id)}/>)}
      </div>

      {/* Spend comparison + Cross-cloud topology summary + Coverage matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Spend trend by provider</div>
              <div className="card-sub" style={{ marginTop: 2 }}>last 30 days · stacked daily spend · USD</div>
            </div>
            <div className="row" style={{ gap: 12 }}>
              {[CLOUDS.aws, CLOUDS.gcp, CLOUDS.azure].map(c => (
                <div key={c.p.id} className="row" style={{ gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c.p.accent }}/>
                  <span className="muted" style={{ fontSize: 11 }}>{c.p.name}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-0)", fontWeight: 600 }}>{c.summary.cost}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, height: 200, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
              <AreaSpark seed={91} color={PROVIDERS.aws.accent}   soft={PROVIDERS.aws.soft}   height={200} base={0.55} amp={0.18}/>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
              <AreaSpark seed={92} color={PROVIDERS.gcp.accent}   soft={PROVIDERS.gcp.soft}   height={200} base={0.32} amp={0.12}/>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
              <AreaSpark seed={93} color={PROVIDERS.azure.accent} soft={PROVIDERS.azure.soft} height={200} base={0.20} amp={0.10}/>
            </div>
          </div>
          {/* x-axis labels */}
          <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            {["May 1", "May 8", "May 15", "May 22", "May 27"].map(t => (
              <span key={t} className="mono muted" style={{ fontSize: 10.5 }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Coverage matrix</div>
          <div className="card-sub" style={{ marginTop: 2 }}>capability × provider · what's wired up</div>
          <CoverageMatrix/>
        </div>
      </div>

      {/* Bottom row — global alerts & quick add */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Multi-cloud alerts</div>
              <div className="card-sub" style={{ marginTop: 2 }}>active across all providers</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>Open monitors</button>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { sev: "err",  p: "aws",   svc: "MSK",      title: "ISR shrunk on msk-cluster-1", dur: "18m", oncall: "JV" },
              { sev: "err",  p: "gcp",   svc: "Cloud SQL",title: "Replica lag > 10s on sql-orders-primary", dur: "22m", oncall: "RC" },
              { sev: "warn", p: "aws",   svc: "RDS",      title: "Free storage < 10% on pg-primary-2", dur: "12m", oncall: "MS" },
              { sev: "warn", p: "azure", svc: "Service Bus", title: "DLQ depth crossed 100 on sb-billing", dur: "40m", oncall: "AK" },
              { sev: "warn", p: "gcp",   svc: "Vertex AI", title: "Endpoint p99 latency 412ms", dur: "1h", oncall: "JV" },
            ].map((a, i) => {
              const p = PROVIDERS[a.p];
              return (
                <div key={i} className="row" style={{
                  padding: "10px 12px", borderRadius: 8,
                  border: "1px solid " + (a.sev === "err" ? "color-mix(in oklab, var(--err) 30%, var(--line))" : "color-mix(in oklab, var(--warn) 30%, var(--line))"),
                  background: a.sev === "err" ? "color-mix(in oklab, var(--err) 4%, var(--bg-card))" : "color-mix(in oklab, var(--warn) 4%, var(--bg-card))",
                  justifyContent: "space-between", cursor: "pointer",
                }} onClick={() => setTab(a.p)}>
                  <div className="row" style={{ gap: 10, minWidth: 0, flex: 1 }}>
                    <ProviderMark p={a.p} size={18}/>
                    <span className={"badge " + a.sev}><span className="b-dot"/>{a.sev === "err" ? "critical" : "warn"}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{a.title}</div>
                      <div className="mono muted" style={{ fontSize: 11 }}>{p.name} · {a.svc} · {a.dur}</div>
                    </div>
                  </div>
                  <span className="row" style={{ gap: 6 }}>
                    <span className="muted" style={{ fontSize: 10.5 }}>oncall</span>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{a.oncall}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Connect a new account</div>
          <div className="card-sub" style={{ marginTop: 2 }}>guided integration · CloudFormation, gcloud, az cli</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
            {[CLOUDS.aws, CLOUDS.gcp, CLOUDS.azure].map(c => (
              <div key={c.p.id} className="row" style={{
                flexDirection: "column", alignItems: "stretch", gap: 6,
                padding: 12, border: "1px solid var(--line)", borderRadius: 8,
                cursor: "pointer", background: "var(--bg-card)",
              }} onClick={() => setTab(c.p.id)}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <ProviderMark p={c.p.id} size={22}/>
                  <Icon name="chevron-right" size={13} className="muted"/>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-0)" }}>{c.p.name}</div>
                <div className="muted" style={{ fontSize: 10.5 }}>{c.summary.accounts} connected</div>
              </div>
            ))}
          </div>
          <div className="hairline" style={{ margin: "14px 0" }}/>
          <div className="label-up" style={{ marginBottom: 8 }}>Recent integrations</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { p: "aws",   txt: "billing-prod (748392) connected", t: "2h" },
              { p: "gcp",   txt: "optikk-sre-staging connected",    t: "yesterday" },
              { p: "azure", txt: "tenant 7e34··· added eastus2",    t: "3d ago" },
            ].map((x, i) => (
              <div key={i} className="row" style={{ gap: 8, fontSize: 12 }}>
                <ProviderMark p={x.p} size={14}/>
                <span style={{ color: "var(--fg-1)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.txt}</span>
                <span className="muted mono" style={{ fontSize: 10.5 }}>{x.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ProviderHeroCard({ c, onOpen }) {
  const s = c.summary;
  const healthBadge = s.health === "err" ? "err" : s.health === "warn" ? "warn" : "ok";
  return (
    <div className="card card-pad-lg" style={{
      position: "relative", overflow: "hidden",
      borderTop: "3px solid " + c.p.accent,
      cursor: "pointer",
    }} onClick={onOpen}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: c.p.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProviderMark p={c.p.id} size={26}/>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>{c.p.name}</div>
            <div className="mono muted" style={{ fontSize: 11 }}>{s.accounts} accounts · {s.regions} regions</div>
          </div>
        </div>
        <span className={"badge " + healthBadge}><span className="b-dot"/>{s.alerts} alerts</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div>
          <div className="label-up">Resources</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{s.resources.toLocaleString()}</div>
          <MiniSpark seed={s.resources % 50} color={c.p.accent} width={140} height={22}/>
        </div>
        <div>
          <div className="label-up">Spend MTD</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{s.cost}</div>
          <div className={"delta " + (s.costDelta.startsWith("−") ? "up" : "down warn")} style={{ fontSize: 11 }}>{s.costDelta}</div>
        </div>
      </div>

      <div className="hairline" style={{ margin: "16px 0 12px" }}/>

      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
        {Object.values(CAT_META).map(cat => {
          const total = c.services.filter(s => s.cat === cat.label.toLowerCase().replace(" / ml", "") || s.cat === Object.keys(CAT_META).find(k => CAT_META[k].label === cat.label)).reduce((a, s) => a + s.count, 0);
          return null;
        })}
        {["compute","data","storage","network","events","ai"].map(cat => {
          const total = c.services.filter(s => s.cat === cat).reduce((a, s) => a + s.count, 0);
          if (total === 0) return null;
          const m = CAT_META[cat];
          return (
            <div key={cat} className="row" style={{ gap: 5, padding: "4px 8px", borderRadius: 4, background: "var(--bg-inset)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }}/>
              <span style={{ fontSize: 11, color: "var(--fg-1)" }}>{m.label}</span>
              <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-0)" }}>{total}</span>
            </div>
          );
        })}
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
        <span className="mono muted" style={{ fontSize: 10.5 }}><span style={{ color: "var(--ok)" }}>●</span> connected · last sync {s.lastSync}</span>
        <span className="row" style={{ gap: 4, color: c.p.accent, fontWeight: 600, fontSize: 12 }}>
          Open {c.p.name} <Icon name="chevron-right" size={12}/>
        </span>
      </div>
    </div>
  );
}

function CoverageMatrix() {
  const caps = [
    { id: "metrics", label: "Metrics",     aws: "full", gcp: "full", az: "full" },
    { id: "logs",    label: "Logs",        aws: "full", gcp: "full", az: "partial" },
    { id: "traces",  label: "Traces",      aws: "full", gcp: "partial", az: "partial" },
    { id: "events",  label: "Audit / activity", aws: "full", gcp: "full", az: "full" },
    { id: "cost",    label: "Cost & billing",   aws: "full", gcp: "full", az: "partial" },
    { id: "secrets", label: "Secrets / IAM",    aws: "full", gcp: "partial", az: "partial" },
    { id: "drs",     label: "Resource topology", aws: "full", gcp: "full", az: "full" },
    { id: "policy",  label: "Tag / label policy", aws: "full", gcp: "full", az: "none" },
  ];
  const cell = (v) => {
    const map = {
      full:    { color: "var(--ok)",    label: "●" },
      partial: { color: "var(--warn)",  label: "◐" },
      none:    { color: "var(--fg-mute)", label: "—" },
    };
    const m = map[v];
    return <span style={{ color: m.color, fontWeight: 700 }}>{m.label}</span>;
  };
  return (
    <div style={{ marginTop: 14 }}>
      <div className="row" style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 0, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
        <span className="label-up">Capability</span>
        <span className="label-up" style={{ textAlign: "center" }}>AWS</span>
        <span className="label-up" style={{ textAlign: "center" }}>GCP</span>
        <span className="label-up" style={{ textAlign: "center" }}>Azure</span>
      </div>
      {caps.map(c => (
        <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", padding: "7px 0", borderBottom: "1px solid var(--line-2)", fontSize: 12.5 }}>
          <span style={{ color: "var(--fg-1)" }}>{c.label}</span>
          <span style={{ textAlign: "center" }}>{cell(c.aws)}</span>
          <span style={{ textAlign: "center" }}>{cell(c.gcp)}</span>
          <span style={{ textAlign: "center" }}>{cell(c.az)}</span>
        </div>
      ))}
      <div className="row" style={{ gap: 14, marginTop: 10 }}>
        <span className="row" style={{ gap: 4 }}><span style={{ color: "var(--ok)" }}>●</span><span className="muted" style={{ fontSize: 11 }}>full</span></span>
        <span className="row" style={{ gap: 4 }}><span style={{ color: "var(--warn)" }}>◐</span><span className="muted" style={{ fontSize: 11 }}>partial</span></span>
        <span className="row" style={{ gap: 4 }}><span style={{ color: "var(--fg-mute)" }}>—</span><span className="muted" style={{ fontSize: 11 }}>not connected</span></span>
      </div>
    </div>
  );
}

/* ===================================================================== */
/*  PER-CLOUD detail view                                                */
/* ===================================================================== */
function CloudDetailView({ cloud, go }) {
  const [cat, setCat] = useStateCloud("all");
  const s = cloud.summary;
  const p = cloud.p;

  const filteredServices = cat === "all" ? cloud.services : cloud.services.filter(x => x.cat === cat);

  return (
    <>
      {/* Connection bar */}
      <div className="card card-pad-lg" style={{
        padding: 16, borderColor: p.line, background: "color-mix(in oklab, " + p.accent + " 3%, var(--bg-card))",
      }}>
        <div className="row" style={{ gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: p.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProviderMark p={p.id} size={30}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>{p.name}</div>
              <span className="badge ok"><span className="b-dot"/>connected</span>
              <span className="badge neutral mono" style={{ fontSize: 10.5 }}>last sync {s.lastSync}</span>
            </div>
            <div className="row" style={{ gap: 14, marginTop: 6 }}>
              <span className="mono muted" style={{ fontSize: 11.5 }}>{s.accounts} {p.id === "azure" ? "subscriptions" : "accounts"} · {s.regions} regions</span>
              <span className="muted" style={{ fontSize: 11.5 }}>·</span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>IAM: {s.iam}</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.roleArn}</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn"><Icon name="filter" size={13}/>Manage accounts</button>
            <button className="btn"><Icon name="refresh" size={13}/>Re-sync</button>
            <button className="btn"><Icon name="more" size={13}/></button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {[
          { l: "Resources", v: s.resources.toLocaleString(), u: cat === "all" ? "all categories" : CAT_META[cat]?.label, d: "+12", cls: "", seed: 1, color: p.accent },
          { l: "Spend MTD", v: s.cost, u: "running rate", d: s.costDelta, cls: s.costDelta.startsWith("−") ? "up" : "down warn", seed: 2, color: "var(--chart-4)" },
          { l: "Alerts firing", v: String(s.alerts), u: s.alertsErr + " critical", d: "+1", cls: "down", seed: 3, color: "var(--err)" },
          { l: "Throughput", v: p.id === "aws" ? "84.2k" : p.id === "gcp" ? "42.1k" : "31.4k", u: "req/s aggregate", d: "+2.4%", cls: "", seed: 4, color: "var(--chart-1)" },
          { l: "Health score", v: s.health === "err" ? "62" : s.health === "warn" ? "84" : "96", u: "/ 100", d: s.health === "ok" ? "+1" : "−4", cls: s.health === "ok" ? "up" : "down warn", seed: 5, color: "var(--chart-3)" },
        ].map(k => (
          <div key={k.l} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 11.5 }}>{k.l}</div>
              <span className={"delta " + (k.cls || "")} style={{ fontSize: 11 }}>{k.d}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 26, marginTop: 4 }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>{k.u}</div>
            <MiniSpark seed={k.seed + (p.id === "aws" ? 0 : p.id === "gcp" ? 20 : 40)} color={k.color} height={26} width={220}/>
          </div>
        ))}
      </div>

      {/* Service grid + side rail */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Services monitored</div>
              <div className="card-sub" style={{ marginTop: 2 }}>{cloud.services.length} {p.name} services wired · click a tile to drill in</div>
            </div>
            <div className="seg">
              {["all", "compute", "data", "storage", "network", "events", "ai"].map(c => (
                <div key={c} className={"seg-opt" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>
                  {c === "all" ? "all" : CAT_META[c].label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
            {filteredServices.map(svc => {
              const meta = CAT_META[svc.cat];
              return (
                <div key={svc.id} style={{
                  padding: 12, borderRadius: 8, background: "var(--bg-inset)",
                  border: "1px solid var(--line-2)", cursor: "pointer",
                  position: "relative",
                }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 3, background: meta.color, opacity: 0.18, display: "inline-flex", alignItems: "center", justifyContent: "center", color: meta.color }}>
                        <Icon name={meta.icon} size={9}/>
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>{svc.name}</span>
                    </div>
                    {svc.alert > 0 && (
                      <span style={{ background: "var(--err-soft)", color: "var(--err-fg)", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{svc.alert}</span>
                    )}
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                    <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg-0)" }}>{svc.count.toLocaleString()}</div>
                    <div className="mono muted" style={{ fontSize: 10 }}>{meta.label.toLowerCase()}</div>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 3, background: "var(--bg-card)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: svc.util + "%", height: "100%", background: svc.util >= 80 ? "var(--err)" : svc.util >= 60 ? "var(--warn)" : "var(--ok)" }}/>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{svc.util}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Account / project breakdown</div>
          <div className="card-sub" style={{ marginTop: 2 }}>top {p.id === "azure" ? "subscriptions" : "accounts"} by resource count</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {(p.id === "aws" ? [
              { id: "748392-prod",      role: "Production",   res: 2104, cost: "$284k", alert: 6 },
              { id: "204108-staging",   role: "Staging",      res: 814,  cost: "$84k",  alert: 2 },
              { id: "918273-data",      role: "Data platform", res: 612, cost: "$72k", alert: 1 },
              { id: "402938-sandbox",   role: "Sandbox",      res: 412,  cost: "$24k", alert: 0 },
              { id: "112234-security",  role: "Security",     res: 186,  cost: "$22k", alert: 2 },
            ] : p.id === "gcp" ? [
              { id: "optikk-sre-prod",  role: "Production",   res: 1124, cost: "$144k", alert: 3 },
              { id: "optikk-data-prod", role: "Data platform",res: 612,  cost: "$48k",  alert: 1 },
              { id: "optikk-staging",   role: "Staging",      res: 312,  cost: "$14k",  alert: 1 },
              { id: "optikk-sandbox",   role: "Sandbox",      res: 138,  cost: "$8.6k", alert: 1 },
            ] : [
              { id: "tekion-prod-eus2", role: "Production",   res: 1018, cost: "$112k", alert: 3 },
              { id: "tekion-staging",   role: "Staging",      res: 412,  cost: "$28k",  alert: 0 },
              { id: "tekion-data",      role: "Data platform",res: 312,  cost: "$18k",  alert: 1 },
              { id: "tekion-ops",       role: "Ops & tooling", res: 100, cost: "$4.4k", alert: 0 },
            ]).map(a => (
              <div key={a.id} className="row" style={{ padding: "8px 10px", borderRadius: 6, background: "var(--bg-inset)", justifyContent: "space-between", cursor: "pointer" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{a.id}</span>
                    {a.alert > 0 && <span style={{ background: "var(--err-soft)", color: "var(--err-fg)", borderRadius: 8, padding: "0 6px", fontSize: 9.5, fontWeight: 700 }}>{a.alert}</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 10.5 }}>{a.role} · {a.res.toLocaleString()} resources</div>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>{a.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources table + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 12px" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="card-title">Resources needing attention</div>
                <div className="card-sub" style={{ marginTop: 2 }}>sorted by health · click to inspect</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <div className="search" style={{ width: 200, height: 28 }}>
                  <Icon name="search" size={13} className="muted"/>
                  <input placeholder="Filter resources…"/>
                </div>
                <button className="btn" style={{ height: 28 }}><Icon name="filter" size={12}/>tags</button>
                <button className="btn btn-ghost" style={{ height: 28 }}><Icon name="link-ext" size={12}/>View all</button>
              </div>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18, width: 260 }}>Resource</th>
                <th style={{ width: 110 }}>Service</th>
                <th>Region · env</th>
                <th>Metric</th>
                <th style={{ textAlign: "right", paddingRight: 18 }}>MTD cost</th>
                <th style={{ width: 18 }}></th>
              </tr>
            </thead>
            <tbody>
              {cloud.resources.map(r => (
                <tr key={r.id} style={{ cursor: "pointer" }}>
                  <td style={{ paddingLeft: 18 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: HEALTH_COLOR[r.health] }}/>
                      <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{r.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 6px", background: p.soft, color: p.accent, borderRadius: 3 }}>{r.svc}</span>
                  </td>
                  <td className="mono muted" style={{ fontSize: 11.5 }}>{r.region} · {r.env}</td>
                  <td className="mono" style={{ fontSize: 11.5, color: r.health === "err" ? "var(--err)" : r.health === "warn" ? "var(--warn-fg)" : "var(--fg-1)" }}>{r.metric}</td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 600, textAlign: "right", paddingRight: 18, fontVariantNumeric: "tabular-nums" }}>{r.cost}</td>
                  <td><Icon name="chevron-right" size={13} className="muted"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="card-title">Integration activity</div>
            <span className="row" style={{ gap: 4, color: "var(--ok)", fontSize: 11 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" }}/>
              <span className="muted" style={{ fontSize: 11 }}>live</span>
            </span>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {cloud.activity.map((a, i) => {
              const kindColor = a.kind === "alert" ? "var(--err)" : a.kind === "discover" ? "var(--chart-2)" : a.kind === "iam" ? "var(--warn)" : a.kind === "tag" ? "var(--chart-3)" : p.accent;
              const kindLabel = { sync: "SYNC", discover: "DISCOVER", alert: "ALERT", iam: "IAM", tag: "TAG" }[a.kind] || a.kind.toUpperCase();
              return (
                <div key={i} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    minWidth: 60, padding: "1px 6px", borderRadius: 3,
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em",
                    color: kindColor, background: "color-mix(in oklab, " + kindColor + " 14%, transparent)",
                    textAlign: "center", marginTop: 1,
                  }} className="mono">{kindLabel}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--fg-0)", lineHeight: 1.45 }}>{a.text}</div>
                    <div className="mono muted" style={{ fontSize: 10.5, marginTop: 1 }}>{a.t}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12, width: "100%", justifyContent: "center", height: 28 }}><Icon name="link-ext" size={12}/>Full activity log</button>
        </div>
      </div>

      {/* Cost detail */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">{p.name} spend</div>
            <div className="card-sub" style={{ marginTop: 2 }}>last 30 days · grouped by service</div>
          </div>
          <div className="row" style={{ gap: 12 }}>
            {[
              { l: "MTD", v: s.cost },
              { l: "Forecast", v: p.id === "aws" ? "$528k" : p.id === "gcp" ? "$232k" : "$168k" },
              { l: "Top driver", v: p.id === "aws" ? "EKS" : p.id === "gcp" ? "GKE" : "AKS" },
            ].map(x => (
              <div key={x.l}>
                <div className="label-up">{x.l}</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16, height: 160 }}>
          <AreaSpark seed={p.id === "aws" ? 101 : p.id === "gcp" ? 102 : 103} color={p.accent} soft={p.soft} height={160} base={0.5} amp={0.18}/>
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
          {["30d ago","23d","16d","9d","2d","today"].map(t => (
            <span key={t} className="mono muted" style={{ fontSize: 10.5 }}>{t}</span>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { CloudScreen });
