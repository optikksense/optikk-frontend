import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI flavor: full page (default), visualization card, or dashboard panel. */
  variant?: "page" | "visualization" | "panel";
  showDetails?: boolean;
  fallback?: ReactNode;
  resetOnError?: boolean;
  boundaryName?: string;
  /** Panel title kept visible in the "panel" variant fallback. */
  title?: ReactNode;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: string;
  action?: ReactNode;
}

export interface TrendIndicatorProps {
  value?: number | null;
  inverted?: boolean;
  showValue?: boolean;
}

export interface LoadingProps {
  label?: string;
  size?: "small" | "default" | "large";
  fullscreen?: boolean;
}
