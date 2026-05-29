import { useParams } from "@tanstack/react-router";
import { Database } from "lucide-react";

import { PageHeader, PageShell } from "@shared/components/ui";

import { ConnectionPoolPanel } from "./components/ConnectionPoolPanel";
import { DatastoreBreakdowns } from "./components/DatastoreBreakdowns";
import { DatastoreHeaderActions } from "./components/DatastoreHeaderActions";
import { DatastoreOverviewCard } from "./components/DatastoreOverviewCard";
import { DatastoreStatTiles } from "./components/DatastoreStatTiles";
import { DatastoreTables } from "./components/DatastoreTables";
import { useDatastoreData } from "./hooks/useDatastoreData";
import { useOpenDatastoreSurface } from "./hooks/useOpenDatastoreSurface";

export default function DatastoreDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const system = decodeURIComponent(typeof params.system === "string" ? params.system : "");

  const bundle = useDatastoreData(system);
  const overview = bundle.overviewQuery.data;
  const openSurface = useOpenDatastoreSurface(system);

  return (
    <PageShell>
      <PageHeader
        title={system}
        subtitle="System-level datastore exploration with latency, contention, namespace, and slow-query context."
        icon={<Database size={24} />}
        actions={
          <DatastoreHeaderActions
            category={overview?.category ?? "database"}
            onOpen={openSurface}
          />
        }
      />
      <DatastoreStatTiles overview={overview} />
      <DatastoreOverviewCard overview={overview} />
      <DatastoreBreakdowns system={system} />
      <DatastoreTables bundle={bundle} />
      <ConnectionPoolPanel system={system} />
    </PageShell>
  );
}
