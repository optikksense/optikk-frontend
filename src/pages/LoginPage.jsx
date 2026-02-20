import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { Mail, Lock, Layers } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import toast from 'react-hot-toast';
import './LoginPage.css';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
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

  const handleSubmit = async (values) => {
    const result = await login(values.email, values.password);
    if (result.success) {
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
            <Title level={2} style={{ margin: 0, color: '#fff' }}>
              ObserveX
            </Title>
          </div>
          
          <Title level={3} style={{ color: '#fff', marginBottom: 16 }}>
            Modern Observability Platform
          </Title>
          
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
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
                  prefix={<Mail size={16} style={{ color: '#666' }} />}
                  placeholder="demo@observex.io"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<Lock size={16} style={{ color: '#666' }} />}
                  placeholder="Enter your password"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
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
                Demo credentials: <strong>demo@observex.io</strong> / any password
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
}

