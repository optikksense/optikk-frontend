import { DatabaseExplorerNav } from "@/features/saturation/components/DatabaseExplorerNav";
import { DatabaseQueriesExplorer } from "./DatabaseQueriesExplorer";

export default function SaturationDatabaseQueriesPage() {
  return <DatabaseQueriesExplorer actions={<DatabaseExplorerNav active="queries" />} />;
}
