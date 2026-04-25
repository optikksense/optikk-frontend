import SpanDetailDrawer from "../../../components/SpanDetailDrawer";

import { TraceDetailServiceBar } from "./TraceDetailServiceBar";
import { TraceDetailVisualization } from "./TraceDetailVisualization";
import { TraceMetaBar } from "./TraceMetaBar";
import { TraceOverviewSection } from "./TraceOverviewSection";

type DrawerProps = Parameters<typeof SpanDetailDrawer>[0];
type VisualizationProps = Parameters<typeof TraceDetailVisualization>[0];
type MetaProps = Parameters<typeof TraceMetaBar>[0];
type ServiceBarProps = Parameters<typeof TraceDetailServiceBar>[0];

interface Props {
  meta: MetaProps;
  serviceBar: ServiceBarProps;
  visualization: VisualizationProps;
  drawer: DrawerProps;
}

export function TraceDetailBody({ meta, serviceBar, visualization, drawer }: Props) {
  return (
    <>
      <TraceMetaBar {...meta} />
      <TraceDetailServiceBar {...serviceBar} />
      <TraceDetailVisualization {...visualization} />
      <TraceOverviewSection
        traceId={meta.traceId}
        spans={visualization.spans ?? []}
        onSpanClick={(id) => visualization.onSpanClick?.({ span_id: id } as never)}
      />
      <SpanDetailDrawer {...drawer} />
    </>
  );
}
