import React, { type ReactNode } from "react";

import { Surface } from "@/components/ui";
import ChartErrorOverlay from "@shared/components/ui/feedback/ChartErrorOverlay";
import { UNKNOWN_ERROR } from "@shared/constants/errorCodes";

interface DashboardCardErrorBoundaryProps {
  children: ReactNode;
  componentId: string;
  componentKey: string;
  title: ReactNode;
  showDetails?: boolean;
}

interface DashboardCardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class DashboardCardErrorBoundary extends React.Component<
  DashboardCardErrorBoundaryProps,
  DashboardCardErrorBoundaryState
> {
  override state: DashboardCardErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): DashboardCardErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard card runtime error", {
      componentId: this.props.componentId,
      componentKey: this.props.componentKey,
      title: typeof this.props.title === "string" ? this.props.title : undefined,
      error,
      errorInfo,
    });
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const detailMessage =
      this.props.showDetails && this.state.error ? this.state.error.message : null;

    return (
      <Surface
        elevation={1}
        padding="xs"
        className="chart-card flex flex-col"
        style={{ height: "100%", overflow: "hidden" }}
      >
        <div className="chart-card__title">{this.props.title}</div>
        <ChartErrorOverlay
          code={UNKNOWN_ERROR}
          message={detailMessage ?? "This panel failed to render."}
        />
      </Surface>
    );
  }
}
