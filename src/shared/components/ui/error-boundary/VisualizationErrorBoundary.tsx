import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

function Fallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-border bg-card p-4 text-center">
      <div className="mb-3 rounded-full bg-err/10 p-3 text-err">
        <AlertTriangle size={24} />
      </div>
      <h3 className="font-semibold text-foreground">Visualization Error</h3>
      <p className="mt-1 max-w-[400px] text-[13px] text-foreground-muted">
        We encountered an unexpected error while trying to render this visualization.
      </p>
      {import.meta.env.DEV && (
        <pre className="mt-2 max-w-full overflow-auto rounded bg-muted/20 p-2 text-left text-[11px] text-err opacity-80">
          {error.message}
        </pre>
      )}
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-4 rounded-md border border-border bg-muted/20 px-4 py-1.5 font-medium text-[13px] transition-colors hover:bg-muted/40"
      >
        Try Again
      </button>
    </div>
  );
}

export function VisualizationErrorBoundary({ children, fallback }: Props) {
  return (
    <ErrorBoundary
      fallbackRender={(props) => (fallback ? <>{fallback}</> : <Fallback {...props} />)}
      onError={(error, info) => console.error("Visualization rendering error:", error, info)}
    >
      {children}
    </ErrorBoundary>
  );
}
