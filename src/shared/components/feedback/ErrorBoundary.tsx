import { APP_COLORS } from '@config/colorLiterals';
import { Button, Result } from 'antd';
import { AlertCircle } from 'lucide-react';
import React from 'react';

import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '24px',
        }}
      >
        <Result
          status="error"
          icon={<AlertCircle size={64} color={APP_COLORS.hex_f04438} />}
          title="Something went wrong"
          subTitle={
            this.props.showDetails && this.state.error
              ? this.state.error.toString()
              : "We're sorry for the inconvenience. Please try refreshing the page."
          }
          extra={[
            <Button type="primary" key="reset" onClick={this.handleReset}>
              Try Again
            </Button>,
            <Button key="home" onClick={() => (window.location.href = '/')}>
              Go Home
            </Button>,
          ]}
        />
      </div>
    );
  }
}

export default ErrorBoundary;
