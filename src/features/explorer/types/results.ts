import type { ReactNode } from "react";

export interface ColumnDef<Row> {
  readonly key: string;
  readonly label: string;
  readonly width?: number;
  readonly render: (row: Row) => ReactNode;
}

export interface ColumnConfig {
  readonly key: string;
  readonly visible: boolean;
  readonly width?: number;
}
