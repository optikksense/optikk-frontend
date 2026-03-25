import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { DEV_BACKEND_URL } from '@config/apiConfig';
import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const { setTimeRange } = useAppStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let cWidth: number;
    let cHeight: number;
    const spans: TelemetrySpan[] = [];

    const resizeCanvas = () => {
      // Only size up if it exists and is visible
      if (window.innerWidth <= 1024) return;
      const parent = canvas.parentElement;
      if (parent) {
        cWidth = parent.offsetWidth;
        cHeight = parent.offsetHeight;
        canvas.width = cWidth;
        canvas.height = cHeight;
      }
    };

    class TelemetrySpan {
      length: number = 0;
      speed: number = 0;
      thickness: number = 0;
      x: number = 0;
      y: number = 0;
      baseAlpha: number = 0;
      color: string = '';
      nodes: { offset: number; size: number; pulse: number }[] = [];

      constructor() {
        this.init(true);
      }

      init(randomX = false) {
        this.length = 150 + Math.random() * 300;
        this.speed = 1 + Math.random() * 2;
        this.thickness = this.speed * 0.7;

        this.x = randomX ? Math.random() * (cWidth || window.innerWidth) : (cWidth || window.innerWidth) + 100;
        this.y = Math.random() * (cHeight || window.innerHeight);

        this.baseAlpha = (this.speed / 3) * 0.4;
        const isPrimary = Math.random() > 0.4;
        this.color = isPrimary
          ? `rgba(99, 102, 241, ${this.baseAlpha})`
          : `rgba(34, 211, 238, ${this.baseAlpha})`;

        this.nodes = [];
        const maxNodes = Math.floor(Math.random() * 5);
        for (let i = 0; i < maxNodes; i++) {
          this.nodes.push({
            offset: Math.random(),
            size: this.thickness * (1.5 + Math.random()),
            pulse: Math.random() * Math.PI * 2,
          });
        }
      }

      update(time: number) {
        this.x -= this.speed;
        this.y += Math.sin(time * 0.001 + this.speed) * 0.1;
        if (this.x + this.length < -50) {
          this.init(false);
        }
      }

      draw(time: number, ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        const tailGrad = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y);
        tailGrad.addColorStop(0, this.color);
        tailGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = this.thickness;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.stroke();

        this.nodes.forEach((node) => {
          const nx = this.x + this.length * node.offset;
          const drawSize = node.size + Math.sin(time * 0.005 + node.pulse) * 0.5;

          ctx.beginPath();
          ctx.fillStyle = this.color.replace(this.baseAlpha.toString(), (this.baseAlpha * 2).toString());
          ctx.arc(nx, this.y, Math.max(0.5, drawSize), 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    const initCanvas = () => {
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      if (window.innerWidth > 1024 && cWidth && cHeight) {
        const count = Math.floor((cWidth * cHeight) / 25000);
        for (let i = 0; i < count; i++) {
          spans.push(new TelemetrySpan());
        }
        animationFrameId = requestAnimationFrame(animateCanvas);
      }
    };

    const animateCanvas = (time: number) => {
      ctx.clearRect(0, 0, cWidth, cHeight);
      spans.forEach((span) => {
        span.update(time);
        span.draw(time, ctx);
      });
      animationFrameId = requestAnimationFrame(animateCanvas);
    };

    initCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/overview');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    
    if (email && password) {
      const result = await login(email, password);
      if (result.success) {
        setTimeRange({ kind: 'relative', preset: '30m', label: 'Last 30 minutes', minutes: 30 });
        toast.success('Login successful!');
        navigate('/overview');
      }
    }
  };

  return (
    <div className="landing-container">
      <div className="noise-layer"></div>

      <div className="split-layout">
        {/* ===== LEFT PANEL ===== */}
        <div className="left-panel">
          <canvas ref={canvasRef} id="telemetryCanvas" className="canvas-bg"></canvas>
          <div className="gradient-overlay"></div>

          <div className="left-content">
            <div className="brand">
              <div className="brand-icon">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                  <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
                  <g transform="translate(4, 4)">
                    <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="2 12 12 18.5 22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="2 15.5 12 22 22 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              Optikk
            </div>

            <h1 className="hero-title">
              <span>Monitor.</span>
              <br />
              <span>Trace.</span>
              <br />
              <span>Understand.</span>
            </h1>

            <p className="hero-subtitle">
              The single pane of glass for modern infrastructure. Uncover the ground truth of your distributed systems in real-time,
              without context switching.
            </p>

            <div className="features">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <span className="feature-label">Real-time Metrics</span>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="18" r="3"></circle>
                    <circle cx="6" cy="6" r="3"></circle>
                    <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                    <line x1="6" y1="9" x2="6" y2="21"></line>
                  </svg>
                </div>
                <span className="feature-label">Distributed Tracing</span>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="18" x2="14" y2="18"></line>
                    <rect x="18" y="16" width="4" height="4" rx="1" fill="currentColor"></rect>
                  </svg>
                </div>
                <span className="feature-label">Centralized Logs</span>
              </div>
            </div>
          </div>

          <div className="social-proof">
            <div className="proof-label">Trusted by 2,400+ engineering teams</div>
            <div className="client-logos">
              {/* Fictional Tech Logos */}
              <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 15a5 5 0 1010 0 5 5 0 10-10 0zm20 0l5-8h5l-7 10 7 10h-5l-5-8-2 3v5h-4v-20h4v6zM50 15a5 5 0 1010 0 5 5 0 10-10 0z" />
                <text x="65" y="20" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="14" fill="#FFFFFF">
                  AcmeCorp
                </text>
              </svg>
              <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="8" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="25" cy="15" r="8" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                <text x="40" y="21" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="16" letterSpacing="-1" fill="#FFFFFF">
                  NEXUS
                </text>
              </svg>
              <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 25L15 5h5l10 20h-4l-8.5-17L8.5 25z" fill="#FFFFFF" />
                <text x="35" y="20" className="font-mono" fontWeight="700" fontSize="15" fill="#FFFFFF">
                  VERTEX
                </text>
              </svg>
              <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="20" height="20" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="15" cy="15" r="4" fill="#FFFFFF" />
                <text x="35" y="20" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="15" fill="#FFFFFF">
                  Quantum
                </text>
              </svg>
              <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15q10-10 20 0t20 0" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <text x="50" y="20" fontFamily="'DM Serif Display', serif" fontStyle="italic" fontWeight="normal" fontSize="16" fill="#FFFFFF">
                  Flow
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="right-panel">
          <div className="login-card">
            {!isAuthenticated ? (
              <div id="formSection">
                <div className="card-header">
                  <div className="brand-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
                      <g transform="translate(4, 4)">
                        <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="2 12 12 18.5 22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="2 15.5 12 22 22 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    </svg>
                  </div>
                  <h2 className="card-title">Welcome back</h2>
                  <p className="card-subtitle">Sign in to monitor your distributed services</p>
                </div>

                <form id="loginForm" onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <input ref={emailRef} type="email" id="email" className="form-input" placeholder=" " required autoComplete="email" />
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                  </div>

                  <div className="form-group">
                    <input ref={passwordRef} type="password" id="password" className="form-input" placeholder=" " required autoComplete="current-password" />
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                  </div>

                  <div className="form-footer">
                    <button
                      type="button"
                      className="text-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                    {showForgotPassword && (
                      <p className="forgot-password-msg" style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Password resets are managed by your IT administrator. Please contact your IT admin for assistance.
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(false)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}
                          aria-label="Dismiss"
                        >
                          ✕
                        </button>
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary" id="btnSubmit" disabled={isLoading} style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
                    <span id="btnText" style={{ display: isLoading ? 'none' : 'inline' }}>
                      Sign In
                    </span>
                    <div className="loading-spinner" id="btnSpinner" style={{ display: isLoading ? 'block' : 'none' }}></div>
                  </button>
                </form>

                <a href="#" className="btn-ghost">
                  Request a demo <span className="arrow">&rarr;</span>
                </a>

                <div className="divider">or continue with</div>

                <div className="sso-options">
                  <a
                    href={`${DEV_BACKEND_URL}/api/v1/auth/google`}
                    className="btn-sso"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </a>
                  <a
                    href={`${DEV_BACKEND_URL}/api/v1/auth/github`}
                    className="btn-sso"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#FFFFFF" />
                    </svg>
                    GitHub
                  </a>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
