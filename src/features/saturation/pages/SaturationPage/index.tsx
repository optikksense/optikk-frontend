import "./SaturationOverview.css";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { SaturationOverviewHeader } from "./components/SaturationOverviewHeader";
import { SubsystemCardsRow } from "./components/SubsystemCardsRow";
import { TopKafkaTopicsCard } from "./components/TopKafkaTopicsCard";
import { WorstSystemsTable } from "./components/WorstSystemsTable";
import { useSaturationOverviewModel } from "./hooks/useSaturationOverviewModel";

export default function SaturationPage(): JSX.Element {
  const model = useSaturationOverviewModel();
  return (
    <div className="sat-root">
      <SaturationOverviewHeader summary={model.summary} />
      <SaturationSubnav
        active="overview"
        counts={{ kafka: model.counts.topics, database: model.counts.database }}
      />

      {model.error ? (
        <div className="sat-error" role="alert">
          Could not load saturation data: {model.error.message}
        </div>
      ) : null}

      <SubsystemCardsRow cards={model.cards} />
      <WorstSystemsTable rows={model.worstSystems} />
      <TopKafkaTopicsCard topics={model.topTopics} />
    </div>
  );
}
