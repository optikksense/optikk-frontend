import { Check, Cloud, Copy, ChevronRight, Minus, Server, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import './Pricing.css';

type Plan = 'self-hosted' | 'cloud';

type TableValue = 'check' | 'partial' | 'x';

interface CompareRow {
  feature: string;
  selfHosted: TableValue;
  cloud: TableValue;
  datadog: TableValue;
}

const COMPARE_ROWS: CompareRow[] = [
  { feature: 'Self-hosted control', selfHosted: 'check', cloud: 'x', datadog: 'x' },
  { feature: 'Data ownership', selfHosted: 'check', cloud: 'partial', datadog: 'x' },
  { feature: 'Managed infra', selfHosted: 'x', cloud: 'check', datadog: 'check' },
  { feature: 'SSO / SAML', selfHosted: 'check', cloud: 'check', datadog: 'partial' },
  { feature: 'SLA', selfHosted: 'x', cloud: 'check', datadog: 'check' },
  { feature: 'Volume discounts', selfHosted: 'x', cloud: 'check', datadog: 'partial' },
  { feature: 'Enterprise support', selfHosted: 'partial', cloud: 'check', datadog: 'check' },
];

const SELF_HOSTED_FEATURES = [
  'Unlimited users',
  'Unlimited data retention (your storage, your rules)',
  'Metrics, Traces, Logs — all three pillars',
  'Full OpenTelemetry support',
  'No seats limit, no span limits, no phone home',
  'MIT licensed — fork it, extend it, own it',
];

const CLOUD_FEATURES = [
  'Unlimited users & seats',
  '30-day hot retention included',
  'Fully managed, auto-scaled',
  'SSO / SAML',
  '99.9% uptime SLA',
  'Priority Slack support',
  'No base fee beyond minimum',
];

const DOCKER_CMD = 'docker run -p 3000:3000 ghcr.io/optikk-org/optikk:latest';

function TableCell({ value }: { value: TableValue }) {
  if (value === 'check') {
    return <Check size={16} className="compare-check" />;
  }
  if (value === 'partial') {
    return <Minus size={16} className="compare-partial" />;
  }
  return <X size={16} className="compare-x" />;
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="15" width="24" height="13" rx="4" stroke="#6366F1" strokeWidth="2" fill="rgba(99, 102, 241, 0.15)" />
      <rect x="8" y="9" width="16" height="13" rx="4" stroke="#22D3EE" strokeWidth="2" fill="rgba(34, 211, 238, 0.1)" />
      <rect x="12" y="3" width="8" height="13" rx="4" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <circle cx="16" cy="9.5" r="2.5" fill="#FFFFFF" />
      <circle cx="16" cy="15.5" r="2.5" fill="#22D3EE" />
      <circle cx="16" cy="21.5" r="2.5" fill="#6366F1" />
      <line x1="16" y1="9.5" x2="16" y2="21.5" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.25, ease: 'easeIn' as const } },
};

const ProductPage: FC = () => {
  const [plan, setPlan] = useState<Plan>('self-hosted');
  const [gb, setGb] = useState(500);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // $0.18/GB, minimum $200/month
  const optikkCost = Math.max(200, gb * 0.18);
  // Datadog: $0.85/GB realistic
  const datadogCost = gb * 0.85;
  const savings = datadogCost - optikkCost;

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(DOCKER_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="pricing-container">
      <div className="pricing-noise" />
      <div className="pricing-gradient" />

      {/* NAV */}
      <nav className="pricing-nav">
        <a href="/" className="nav-brand">
          <div className="nav-brand-icon">
            <BrandIcon />
          </div>
          Optikk
        </a>
        <ul className="nav-links">
          <li><a href="#">Features</a></li>
          <li><a href="#">Docs</a></li>
          <li>
            <a href="https://github.com/optikk-org" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
        <div className="nav-right">
          <button
            type="button"
            className="nav-login-btn"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
          <button
            type="button"
            className="nav-cta"
            onClick={() => navigate('/login')}
          >
            Get Started <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pricing-main">

        {/* HERO */}
        <section className="pricing-hero">
          <h1 className="pricing-title">Simple pricing. No surprises.</h1>
          <p className="pricing-subtitle">
            Self-host forever, free. Or let us run it — pay only for what you ingest.
          </p>
        </section>

        {/* TOGGLE */}
        <div className="toggle-bar">
          <div className="toggle-track">
            {(['self-hosted', 'cloud'] as Plan[]).map((p) => (
              <button
                key={p}
                type="button"
                className="toggle-btn"
                onClick={() => setPlan(p)}
              >
                {plan === p && (
                  <motion.div
                    className="toggle-pill"
                    layoutId="toggle-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="toggle-label">
                  {p === 'self-hosted' ? 'Self-Hosted' : 'Cloud'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PLAN CARD */}
        <div className="plan-card-wrapper">
          <AnimatePresence mode="wait">
            {plan === 'self-hosted' ? (
              <motion.div
                key="self-hosted"
                className="plan-card plan-card--glow"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="plan-badge">FREE · Forever · No credit card</div>
                <h2 className="plan-headline">Everything. Unlimited. Yours.</h2>
                <p className="plan-tagline">One binary. Your infra. Zero lock-in.</p>

                <ul className="feature-list">
                  {SELF_HOSTED_FEATURES.map((f) => (
                    <li key={f}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="plan-cta-group">
                  <a href="#" className="btn-primary">
                    Deploy in 5 minutes <ChevronRight size={16} />
                  </a>
                </div>

                <div className="code-block-wrapper" style={{ marginTop: 24 }}>
                  <div className="code-block">
                    <code>{DOCKER_CMD}</code>
                    <button
                      type="button"
                      className={`copy-btn${copied ? ' copied' : ''}`}
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <p style={{ marginTop: 16, fontSize: 12, color: '#475569', textAlign: 'center' }}>
                  Need help with large-scale self-hosted deployments?{' '}
                  <a href="#" style={{ color: '#6366F1', textDecoration: 'none' }}>
                    Enterprise support plans available.
                  </a>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="cloud"
                className="plan-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="plan-badge" style={{ borderColor: 'rgba(34, 211, 238, 0.3)', color: '#22D3EE', background: 'rgba(34, 211, 238, 0.08)' }}>
                  7-DAY FREE TRIAL · NO CREDIT CARD
                </div>
                <h2 className="plan-headline">One rate. No tiers. No surprises.</h2>

                <div className="cloud-price-display">
                  <span className="cloud-price-amount">$0.18</span>
                  <div className="cloud-price-meta">
                    <span className="cloud-price-unit">/GB ingested</span>
                    <span className="cloud-price-minimum">Minimum $200/month · ~1.1TB included</span>
                  </div>
                </div>

                <ul className="feature-list">
                  {CLOUD_FEATURES.map((f) => (
                    <li key={f}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="plan-cta-group">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/login')}
                  >
                    Start 7-Day Free Trial
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      document.getElementById('gb-calculator')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Estimate your bill →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* GB CALCULATOR — cloud only */}
        {plan === 'cloud' && (
          <div className="gb-calculator" id="gb-calculator">
            <div className="calc-label">Estimate your bill</div>
            <div className="calc-gb-display">{gb.toLocaleString()} GB / month</div>
            <input
              type="range"
              className="gb-slider"
              min={0}
              max={10000}
              step={50}
              value={gb}
              onChange={(e) => setGb(Number(e.target.value))}
            />
            <div className="calc-output">
              <div className="calc-optikk">
                <span className="calc-optikk-label">Optikk / month</span>
                <span className="calc-optikk-value">~${optikkCost.toFixed(2)}</span>
                {gb * 0.18 < 200 && (
                  <span className="calc-minimum-note">$200 minimum applies</span>
                )}
              </div>
              <div className="calc-datadog">
                <span className="calc-datadog-label">Datadog equivalent</span>
                <span className="calc-datadog-value">~${datadogCost.toFixed(2)}</span>
                <span className="calc-datadog-note">~{(datadogCost / Math.max(optikkCost, 0.01)).toFixed(1)}× more expensive</span>
              </div>
              {savings > 0 && (
                <div className="calc-save">
                  <span className="calc-save-label">You save</span>
                  <span className="calc-save-value">~${savings.toFixed(2)}</span>
                  <span className="calc-save-note">per month</span>
                </div>
              )}
            </div>
            <p className="calc-volume-note">
              Volume discounts available above 5 TB/month — <a href="#" style={{ color: '#6366F1', textDecoration: 'none' }}>talk to us.</a>
            </p>
          </div>
        )}

        {/* ENTERPRISE ADD-ONS */}
        <section className="enterprise-section">
          <div className="section-label">Enterprise add-ons</div>
          <div className="enterprise-grid">
            <div className="enterprise-card">
              <div className="enterprise-icon">
                <Server size={20} />
              </div>
              <div className="enterprise-card-title">Extended Retention</div>
              <p className="enterprise-card-desc">
                Custom pricing, up to 3 years hot storage for compliance and historical analysis.
              </p>
              <a href="#" className="enterprise-link">
                Contact Us <ChevronRight size={13} />
              </a>
            </div>
            <div className="enterprise-card">
              <div className="enterprise-icon">
                <Cloud size={20} />
              </div>
              <div className="enterprise-card-title">On-Prem Managed</div>
              <p className="enterprise-card-desc">
                Optikk engineers deploy and manage the full stack inside your VPC.
              </p>
              <a href="#" className="enterprise-link">
                Contact Us <ChevronRight size={13} />
              </a>
            </div>
            <div className="enterprise-card">
              <div className="enterprise-icon">
                <Shield size={20} />
              </div>
              <div className="enterprise-card-title">Dedicated Support</div>
              <p className="enterprise-card-desc">
                SLA guarantee, named customer success manager, private Slack channel.
              </p>
              <a href="#" className="enterprise-link">
                Contact Us <ChevronRight size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="compare-section">
          <div className="section-label" style={{ marginBottom: 24 }}>How we compare</div>
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                <th className="col-self-hosted">Optikk Self-Hosted</th>
                <th className="col-cloud">Optikk Cloud</th>
                <th className="col-datadog">Datadog</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td><TableCell value={row.selfHosted} /></td>
                  <td><TableCell value={row.cloud} /></td>
                  <td><TableCell value={row.datadog} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FOOTER CTA */}
        <section className="footer-cta-section">
          <p className="footer-cta-text">Ready to get started?</p>
          <div className="footer-cta-btns">
            <button
              type="button"
              className="btn-primary"
              style={{ width: 'auto', padding: '14px 32px' }}
              onClick={() => navigate('/login')}
            >
              Log in to Optikk
            </button>
            <a
              href="https://github.com/optikk-org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ width: 'auto', padding: '14px 32px' }}
            >
              View on GitHub →
            </a>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ProductPage;
