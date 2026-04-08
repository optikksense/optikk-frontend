import { Button } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import React from "react";

import type { ErrorBoundaryProps, ErrorBoundaryState } from "./types";

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
    console.error(
      `Error Boundary caught an error${this.props.boundaryName ? ` [${this.props.boundaryName}]` : ""}:`,
      error,
      errorInfo
    );
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
      <div className="flex items-center justify-center" style={{ minHeight: 400, padding: 24 }}>
        <div
          className="flex-col items-center gap-lg"
          style={{ textAlign: "center", maxWidth: 420 }}
        >
          <AlertCircle size={48} color="var(--color-error)" />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Something went wrong
          </h2>
          <p className="text-secondary text-sm">
            {this.props.showDetails && this.state.error
              ? this.state.error.toString()
              : "We're sorry for the inconvenience. Please try refreshing the page."}
          </p>
          {this.props.showDetails && this.props.boundaryName && (
            <p className="text-secondary text-sm" style={{ marginTop: 8 }}>
              Boundary: {this.props.boundaryName}
            </p>
          )}
          <div className="flex gap-sm">
            <Button variant="primary" onClick={this.handleReset}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => (window.location.href = "/")}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
