import { type ReactNode } from "react";

export interface SummaryKPI {
  readonly label: string;
  readonly value: ReactNode;
  readonly tone?: "default" | "error" | "success" | "warn";
  readonly hint?: string;
}
