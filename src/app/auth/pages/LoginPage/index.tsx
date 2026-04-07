import { Surface, Button } from '@/components/ui';
import { Mail, Lock, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { useAppStore, useTimeRange } from '@store/appStore';
import { useAuthStore, useIsAuthenticated, useAuthIsLoading, useAuthError } from '@store/authStore';

import { APP_COLORS } from '@config/colorLiterals';

import './LoginPage.css';

const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Please enter your email').email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
});

/**
 *
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthIsLoading();
  const error = useAuthError();
  const clearError = useAuthStore((s) => s.clearError);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/overview' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check your login details');
      return;
    }

    const result = await login(parsed.data.email, parsed.data.password);
    if (result.success) {
      setTimeRange({ kind: 'relative', preset: '30m', label: 'Last 30 minutes', minutes: 30 });
      toast.success('Login successful!');
      navigate({ to: '/overview' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="branding-logo">
            <div className="branding-logo-icon">
              <Layers size={24} />
            </div>
            <h2 style={{ margin: 0, color: APP_COLORS.hex_fff }}>Optikk</h2>
          </div>

          <h3 style={{ color: APP_COLORS.hex_fff, marginBottom: 16 }}>
            Modern Observability Platform
          </h3>

          <p style={{ fontSize: 16, color: APP_COLORS.rgba_255_255_255_0p7 }}>
            Monitor, analyze, and optimize your distributed systems with real-time insights.
          </p>

          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <div className="feature-title">Real-time Metrics</div>
                <div className="feature-desc">Track performance and health</div>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div>
                <div className="feature-title">Distributed Tracing</div>
                <div className="feature-desc">Debug across microservices</div>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <div>
                <div className="feature-title">Centralized Logs</div>
                <div className="feature-desc">Search and analyze logs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <Surface className="login-card" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            <div>
              <h3 style={{ marginBottom: 8 }}>Welcome back</h3>
              <span style={{ color: 'var(--text-secondary)' }}>
                Sign in to your account to continue
              </span>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[var(--text-primary)]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <input
                      data-testid="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-10 pr-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(94,96,206,0.1)]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[var(--text-primary)]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <input
                      data-testid="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-10 pr-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(94,96,206,0.1)]"
                      required
                    />
                  </div>
                </div>

                <Button
                  data-testid="login-submit"
                  variant="primary"
                  type="submit"
                  fullWidth
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>
        </Surface>
      </div>
    </div>
  );
}
