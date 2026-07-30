import { DatabaseQueriesExplorer } from "@/features/saturation/pages/SaturationDatabaseQueriesPage/DatabaseQueriesExplorer";

export function DatabaseQueriesTab({ system }: { system: string }) {
  return <DatabaseQueriesExplorer dbSystem={system} embedded />;
}
