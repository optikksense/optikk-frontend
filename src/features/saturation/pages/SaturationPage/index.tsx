import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { SaturationOverviewHeader } from "./components/SaturationOverviewHeader";
import { SubsystemCardsRow } from "./components/SubsystemCardsRow";
import { TopKafkaTopicsCard } from "./components/TopKafkaTopicsCard";
import { WorstSystemsTable } from "./components/WorstSystemsTable";
import { useSaturationOverviewModel } from "./hooks/useSaturationOverviewModel";

export default function SaturationPage(): JSX.Element {
  const model = useSaturationOverviewModel();
  return (
    <div className="flex min-w-0 flex-col gap-5 px-1 pt-1 pb-7 font-[Geist,'Inter_Tight',ui-sans-serif,system-ui,sans-serif] text-[13px] text-[var(--fg-1)] [font-feature-settings:'ss01','cv11','tnum'] [&_*]:box-border [&_.mono]:font-['Geist_Mono','JetBrains_Mono',ui-monospace,monospace] [&_code]:font-['Geist_Mono','JetBrains_Mono',ui-monospace,monospace]">
      <SaturationOverviewHeader summary={model.summary} />
      <SaturationSubnav
        active="overview"
        counts={{ kafka: model.counts.topics, database: model.counts.database }}
      />

      {model.error ? (
        <div
          className="rounded-lg border border-[color-mix(in_oklch,var(--color-error),transparent_65%)] bg-error-subtle px-[14px] py-[10px] text-[12.5px] text-error"
          role="alert"
        >
          Could not load saturation data: {model.error.message}
        </div>
      ) : null}

      <SubsystemCardsRow cards={model.cards} />
      <WorstSystemsTable rows={model.worstSystems} />
      <TopKafkaTopicsCard topics={model.topTopics} />
    </div>
  );
}
