import SpanDetailDrawer from "../../../components/SpanDetailDrawer";

import { TraceDetailServiceBar } from "./TraceDetailServiceBar";
import { TraceDetailStats } from "./TraceDetailStats";
import { TraceDetailVisualization } from "./TraceDetailVisualization";

type DrawerProps = Parameters<typeof SpanDetailDrawer>[0];
type VisualizationProps = Parameters<typeof TraceDetailVisualization>[0];
type StatsProps = Parameters<typeof TraceDetailStats>[0];
type ServiceBarProps = Parameters<typeof TraceDetailServiceBar>[0];

interface Props {
  stats: StatsProps;
  serviceBar: ServiceBarProps;
  visualization: VisualizationProps;
  drawer: DrawerProps;
}

export function TraceDetailBody({ stats, serviceBar, visualization, drawer }: Props) {
  return (
    <>
      <TraceDetailStats {...stats} />
      <TraceDetailServiceBar {...serviceBar} />
      <TraceDetailVisualization {...visualization} />
      <SpanDetailDrawer {...drawer} />
    </>
  );
}
