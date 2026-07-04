import { LegalLayout } from "../Legal/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout currentKey="privacy" title="Privacy Policy" lastUpdated="May 23, 2026">
      <p>
        At Optikk, we are committed to protecting your privacy. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use our observability
        platform, including our website, API, and agent integrations.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information to provide better services to all our users. The types of information
        we collect include:
      </p>
      <ul>
        <li>
          <strong>Account Information:</strong> Your name, email address, password, billing address,
          and payment details when you create an account or subscribe to our services.
        </li>
        <li>
          <strong>Telemetry Data:</strong> Metrics, logs, traces, and metadata transmitted by your
          systems and applications to the Optikk platform for analysis and visualization.
        </li>
        <li>
          <strong>Usage Information:</strong> Metadata regarding how you interact with our platform,
          such as feature usage, active dashboards, and page navigation history.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the collected information for the following purposes:</p>
      <ul>
        <li>To operate, maintain, host, and improve the Optikk observability platform.</li>
        <li>To process transactions, manage subscriptions, and send billing notifications.</li>
        <li>To provide customer support and troubleshoot application or ingestion issues.</li>
        <li>To analyze system performance, user engagement, and guide our product roadmap.</li>
      </ul>

      <h2>3. Data Ingestion & Sovereignty</h2>
      <p>
        We respect your choice of data residency. Telemetry data ingested via our open-standard
        OpenTelemetry integrations is routed strictly according to your selected data region (e.g.,
        US, EU, or APAC). Ingested raw telemetry events are kept in high-performance storage
        according to your configured retention period (default 30 days) and can be archived to your
        own cold-tier storage.
      </p>

      <h2>4. Information Sharing and Disclosure</h2>
      <p>
        We do not sell your personal or telemetry data to third parties. We may share information
        only in limited circumstances, such as:
      </p>
      <ul>
        <li>
          With trusted third-party service providers (like payment processors) who support our
          operations.
        </li>
        <li>
          To comply with legal obligations, enforce our terms of service, or protect our rights.
        </li>
        <li>In connection with any merger, acquisition, or sale of company assets.</li>
      </ul>

      <h2>5. Security of Your Data</h2>
      <p>
        We implement industry-standard administrative, technical, and physical security measures
        designed to secure your data from unauthorized access, alteration, or deletion. For more
        detailed information on our security protocols, please refer to our Security Statement.
      </p>

      <h2>6. Your Rights and Choices</h2>
      <p>
        Depending on your location, you may have rights under GDPR, CCPA, or other local regulations
        regarding your personal data, including the right to access, correct, delete, or limit its
        processing. Please contact our support tenant to exercise these rights.
      </p>
    </LegalLayout>
  );
}
