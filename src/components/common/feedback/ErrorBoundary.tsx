import { Result, Button } from 'antd';
import { AlertCircle } from 'lucide-react';
import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  showDetails?: boolean;
  fallback?: ReactNode;
  resetOnError?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   *
   * @param props
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   *
   * @param _error
   */
  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error: _error, errorInfo: null };
  }

  /**
   *
   * @param error
   * @param errorInfo
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
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

    // Optionally reload the page
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  /**
   *
   */
  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '24px',
        }}>
          <Result
            status="error"
            icon={<AlertCircle size={64} color="#F04438" />}
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
              <Button key="home" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
