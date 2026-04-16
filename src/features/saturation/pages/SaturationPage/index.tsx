import { useNavigate } from "@tanstack/react-router";

import { PageShell } from "@shared/components/ui";

import { SaturationDataTables } from "./components/SaturationDataTables";
import { SaturationExplorerToolbar } from "./components/SaturationExplorerToolbar";
import { SaturationPageHeader } from "./components/SaturationPageHeader";
import { SaturationStatTilesGrid } from "./components/SaturationStatTilesGrid";
import { useSaturationExplorerModel } from "./hooks/useSaturationExplorerModel";
import { useSaturationLegacyRedirect } from "./hooks/useSaturationLegacyRedirect";

export default function SaturationPage(): JSX.Element {
  const navigate = useNavigate();
  const model = useSaturationExplorerModel();

  useSaturationLegacyRedirect(model.searchParams);

  const datastoreSummary = model.datastoreSummaryQuery.data;
  const kafkaSummary = model.kafkaSummaryQuery.data;

  return (
    <PageShell>
      <SaturationPageHeader activeSection={model.activeSection} />

      <SaturationStatTilesGrid
        activeSection={model.activeSection}
        datastoreSummary={datastoreSummary}
        kafkaSummary={kafkaSummary}
      />

      <SaturationExplorerToolbar
        activeSection={model.activeSection}
        kafkaView={model.kafkaView}
        storeType={model.storeType}
        queryText={model.queryText}
        setSearchValue={model.setSearchValue}
      />

      <SaturationDataTables
        activeSection={model.activeSection}
        kafkaView={model.kafkaView}
        datastoreRows={model.datastoreRows}
        kafkaTopicRows={model.kafkaTopicRows}
        kafkaGroupRows={model.kafkaGroupRows}
        navigate={navigate}
      />
    </PageShell>
  );
}
