import { Link } from 'react-router-dom';

function BrandIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
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

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  
  return (
    <footer style={{
      background: '#0D0E14',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      fontFamily: "'Inter', sans-serif",
      padding: '80px 48px 40px',
    }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 64px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 48px; } }
        @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; gap: 32px; } }
        .footer-col-title { font-size: 13px; font-weight: 600; color: #F8FAFC; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; font-family: "'JetBrains Mono', monospace"; }
        .footer-link { display: block; color: #94A3B8; font-size: 14px; text-decoration: none; margin-bottom: 14px; transition: color 0.2s; }
        .footer-link:hover { color: #22D3EE; }
      `}</style>
      
      <div className="footer-grid">
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F1F5F9', fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 16 }}>
            <BrandIcon /> Optikk
          </div>
          <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, maxWidth: 280, marginBottom: 24 }}>
            Full-stack observability for engineering teams. Navigate from high-level metrics down to single code lines in seconds.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#94A3B8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            12.4k GitHub Stars
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <div className="footer-col-title">Product</div>
          <Link to="/features" className="footer-link">Features</Link>
          <Link to="/product" className="footer-link">Pricing</Link>
          <Link to="/self-host" className="footer-link">Self-host</Link>
          <Link to="/" className="footer-link">Product Tour</Link>
        </div>

        {/* Col 3 */}
        <div>
          <div className="footer-col-title">Developers</div>
          <a href="#" className="footer-link">Go SDK</a>
          <a href="#" className="footer-link">Python SDK</a>
          <a href="#" className="footer-link">Java SDK</a>
          <a href="#" className="footer-link">Node.js SDK</a>
          <a href="#" className="footer-link">OTLP Docs</a>
        </div>

        {/* Col 4 */}
        <div>
          <div className="footer-col-title">Platform</div>
          <a href="#" className="footer-link">Metrics</a>
          <a href="#" className="footer-link">Traces</a>
          <a href="#" className="footer-link">Logs</a>
          <a href="#" className="footer-link">AI Observability</a>
        </div>
      </div>

      <div style={{
        maxWidth: 1200, margin: '64px auto 0', paddingTop: 32,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 13, color: '#64748B', flexWrap: 'wrap', gap: 16,
      }}>
        <div>© {year} Optikk Inc. · MIT License · Built with ♥ for engineers</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>License</a>
          <a href="https://github.com/optikk-org" style={{ color: '#64748B', textDecoration: 'none' }}>GitHub</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>Discord</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>X</a>
        </div>
      </div>
    </footer>
  );
}
