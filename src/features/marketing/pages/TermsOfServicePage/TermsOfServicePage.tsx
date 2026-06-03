import { LegalLayout } from "../Legal/LegalLayout";

export default function TermsOfServicePage() {
  return (
    <LegalLayout currentKey="terms" title="Terms of Service" lastUpdated="May 23, 2026">
      <p>
        Welcome to Optikk. These Terms of Service ("Terms") govern your access to and use of our
        observability services, including our website, APIs, agents, and software platforms
        (collectively, the "Service"). Please read them carefully before using the Service.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account, accessing, or using the Service, you agree to be bound by these
        Terms and our Privacy Policy. If you are entering into these Terms on behalf of an entity,
        you represent that you have the authority to bind that entity.
      </p>

      <h2>2. Accounts and Subscription</h2>
      <p>
        To access certain features of the Service, you must register for an account. You are
        responsible for maintaining the confidentiality of your account credentials. You agree to
        notify us immediately of any unauthorized use of your account.
      </p>

      <h2>3. Acceptable Use Policy</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Violate any applicable laws, regulations, or third-party rights.</li>
        <li>
          Ingest malicious software, code, or telemetry streams designed to disrupt, disable, or
          harm our platform or other users.
        </li>
        <li>
          Circumvent rate limits or attempt to access unauthorized portions of our infrastructure.
        </li>
        <li>Scan, test, or probe the vulnerability of our systems without prior authorization.</li>
      </ul>

      <h2>4. Self-Hosted Licensing</h2>
      <p>
        Optikk is fully open source under the Apache License 2.0. The software, engine, scheduler,
        and dashboards are provided free of charge, and you may compile, deploy, and self-host the
        Service within your own infrastructure without fees, license keys, or usage caps.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        The Service, including its design, code, interface, and branding, is the property of Optikk
        or its licensors. Note that the core engine, scheduler, and frontend dashboards are made
        available under the Apache License 2.0. Your rights to compile, run, and self-host our open
        source components are governed separately by that license.
      </p>

      <h2>6. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to the Service at any time, with or
        without cause or notice, if we believe you have breached these Terms or are causing
        operational risk to the platform. You may close your account at any time from your settings
        panel.
      </p>

      <h2>7. Disclaimer and Limitation of Liability</h2>
      <p>
        The Service is provided "as is" and "as available" without any warranties of any kind.
        Optikk disclaims all warranties, express or implied, including fitness for a particular
        purpose. In no event shall Optikk be liable for any indirect, incidental, special, or
        consequential damages resulting from your use or inability to use the Service.
      </p>
    </LegalLayout>
  );
}
