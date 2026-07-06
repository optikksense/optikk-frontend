import { Button } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import React from "react";
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary";

import type { ErrorBoundaryProps } from "./types";

function FallbackComponent({
  error,
  resetErrorBoundary,
  showDetails,
  boundaryName,
  resetOnError,
}: FallbackProps & { showDetails?: boolean; boundaryName?: string; resetOnError?: boolean }) {
  const handleReset = () => {
    resetErrorBoundary();
    if (resetOnError) {
      window.location.reload();
    }
  };

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
          {showDetails && error
            ? error.toString()
            : "We're sorry for the inconvenience. Please try refreshing the page."}
        </p>
        {showDetails && boundaryName && (
          <p className="text-secondary text-sm" style={{ marginTop: 8 }}>
            Boundary: {boundaryName}
          </p>
        )}
        <div className="flex gap-sm">
          <Button variant="primary" onClick={handleReset}>
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

export default function ErrorBoundary({
  children,
  fallback,
  showDetails,
  boundaryName,
  resetOnError,
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={(props) => {
        if (fallback) return <>{fallback}</>;
        return (
          <FallbackComponent
            {...props}
            showDetails={showDetails}
            boundaryName={boundaryName}
            resetOnError={resetOnError}
          />
        );
      }}
      onError={(error, info) => {
        console.error(
          `Error Boundary caught an error${boundaryName ? ` [${boundaryName}]` : ""}:`,
          error,
          info,
        );
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
