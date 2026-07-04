import { LegalLayout } from "../Legal/LegalLayout";

export default function SecurityPage() {
  return (
    <LegalLayout currentKey="security" title="Security Statement" lastUpdated="May 23, 2026">
      <p>
        Security is at the core of everything we do. At Optikk, we design and operate our SaaS
        platform and open-source agents with the highest industry standards of data protection,
        compliance, and availability in mind.
      </p>

      <h2>1. Data Encryption</h2>
      <p>
        We ensure that your data is secure both when it is moving and when it is stored on our
        systems:
      </p>
      <ul>
        <li>
          <strong>In Transit:</strong> All data sent to or from the Optikk platform, including
          telemetry ingestion streams (via OTLP) and dashboard browsing sessions, is encrypted using
          TLS 1.3 (with TLS 1.2 fallback).
        </li>
        <li>
          <strong>At Rest:</strong> Ingested telemetry in our analytical databases (ClickHouse) and
          transactional data in MySQL/Redis are encrypted using AES-256 standard encryption at the
          storage layer.
        </li>
      </ul>

      <h2>2. Authentication and Access Control</h2>
      <p>We provide robust controls to secure access to your workspace and configurations:</p>
      <ul>
        <li>
          <strong>SSO and SAML:</strong> We support Single Sign-On (SSO), SAML 2.0, and SCIM mapping
          on all subscription plans without custom enterprise premiums.
        </li>
        <li>
          <strong>Role-Based Access Control (RBAC):</strong> Define precise tenant permissions,
          restricting access to sensitive telemetry scopes, dashboards, alert settings, or billing
          options.
        </li>
        <li>
          <strong>Secure API Keys:</strong> Ingestion and API query tokens are hashed and securely
          stored. We recommend rotating keys regularly.
        </li>
      </ul>

      <h2>3. Infrastructure and Operations</h2>
      <p>
        Our platform runs on premium cloud infrastructure designed for maximum security and
        resilience:
      </p>
      <ul>
        <li>
          <strong>Network Isolation:</strong> Production infrastructure is separated into virtual
          private networks, with strict firewall rules and network access control lists.
        </li>
        <li>
          <strong>Intrusion Detection:</strong> We employ automated monitoring to analyze access
          logs, identifying unauthorized traffic, DDoS threats, and abnormal request patterns.
        </li>
        <li>
          <strong>Regular Backups:</strong> System configuration database snapshots are backed up
          daily, encrypted, and stored with multi-region redundancy.
        </li>
      </ul>

      <h2>4. Vulnerability Management</h2>
      <p>We keep our codebase secure through continuous testing and dependency analysis:</p>
      <ul>
        <li>
          <strong>Automated Scanning:</strong> Code dependencies are automatically scanned for
          vulnerabilities prior to build and deployment.
        </li>
        <li>
          <strong>Responsible Disclosure:</strong> We welcome reports from security researchers. If
          you discover a vulnerability, please notify us immediately at <em>security@optikk.io</em>.
        </li>
        <li>
          <strong>Patching Cycle:</strong> Critical vulnerability patches are applied to our
          production environment within 24 hours of release.
        </li>
      </ul>

      <h2>5. Compliance</h2>
      <p>
        Optikk is designed to align with major regulatory compliance standards, including SOC 2 Type
        II compliance framework requirements, GDPR data protection rules, and CCPA consumer privacy
        mandates.
      </p>
    </LegalLayout>
  );
}
