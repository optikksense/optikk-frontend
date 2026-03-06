import { APP_COLORS } from '@config/colorLiterals';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { Mail, Lock, Layers } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import './LoginPage.css';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 *
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const { setTimeRange } = useAppStore();
  const [form] = Form.useForm();

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

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    const result = await login(values.email, values.password);
    if (result.success) {
      // Normalize post-login view window for load-test verification.
      setTimeRange('30m');
      toast.success('Login successful!');
      navigate('/overview');
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
            <Title level={2} style={{ margin: 0, color: APP_COLORS.hex_fff }}>
              Optikk
            </Title>
          </div>

          <Title level={3} style={{ color: APP_COLORS.hex_fff, marginBottom: 16 }}>
            Modern Observability Platform
          </Title>

          <Text style={{ fontSize: 16, color: APP_COLORS.rgba_255_255_255_0p7 }}>
            Monitor, analyze, and optimize your distributed systems with real-time insights.
          </Text>

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
        <Card className="login-card">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 8 }}>
                Welcome back
              </Title>
              <Text type="secondary">Sign in to your account to continue</Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  data-testid="login-email"
                  prefix={<Mail size={16} style={{ color: APP_COLORS.hex_666 }} />}
                  placeholder="frontend.demo@observability.local"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  data-testid="login-password"
                  prefix={<Lock size={16} style={{ color: APP_COLORS.hex_666 }} />}
                  placeholder="Enter your password"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  data-testid="login-submit"
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <div className="login-demo-info">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Demo credentials: <strong>frontend.demo@observability.local</strong> / Demo@12345
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
}
