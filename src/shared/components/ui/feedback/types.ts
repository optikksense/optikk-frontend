import type { ErrorInfo, ReactNode } from "react";

/**
 *
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  showDetails?: boolean;
  fallback?: ReactNode;
  resetOnError?: boolean;
  boundaryName?: string;
}

/**
 *
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 *
 */
export interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: string;
  action?: ReactNode;
}

/**
 *
 */
export type StatusBadgeType = "service" | "trace";

/**
 *
 */
export interface StatusBadgeProps {
  status: string;
  type?: StatusBadgeType;
}

/**
 *
 */
export interface TrendIndicatorProps {
  value?: number | null;
  inverted?: boolean;
  showValue?: boolean;
}

/**
 *
 */
export interface LoadingProps {
  label?: string;
  size?: "small" | "default" | "large";
  fullscreen?: boolean;
}

/**
 *
 */
export interface FeedbackSkeletonProps {
  rows?: number;
  active?: boolean;
}
