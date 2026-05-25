import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { DeploymentCompareBody } from "./components/DeploymentCompareBody";
import { DeploymentCompareHeader } from "./components/DeploymentCompareHeader";
import {
  ErrorState,
  LoadingState,
  MissingMetadataState,
  NoDataState,
} from "./components/DeploymentCompareStates";
import { useDeploymentCompare } from "./hooks/useDeploymentCompare";
import { useDeploymentImpact } from "./hooks/useDeploymentImpact";
import { useDeploymentList } from "./hooks/useDeploymentList";
import { useOpenSurface } from "./hooks/useOpenSurface";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  initialData?: Record<string, unknown> | null;
}

interface DrawerStateProps extends ReturnType<typeof useDeploymentCompare> {
  openSurface: ReturnType<typeof useOpenSurface>;
  impacts: ReturnType<typeof useDeploymentImpact>["impacts"];
  impactsLoading: boolean;
  deployments: ReturnType<typeof useDeploymentList>["deployments"];
}

function DrawerState({
  seed,
  compareQuery,
  compare,
  timelineQuery,
  timeline,
  openSurface,
  impacts,
  impactsLoading,
  deployments,
}: DrawerStateProps) {
  if (!seed) return <MissingMetadataState />;
  if (compareQuery.isLoading) return <LoadingState />;
  if (compareQuery.isError) return <ErrorState />;
  if (!compare) return <NoDataState />;
  return (
    <DeploymentCompareBody
      compare={compare}
      onOpen={openSurface}
      timelineIsLoading={timelineQuery.isLoading}
      timeline={timeline}
      serviceName={seed.serviceName}
      currentVersion={seed.version}
      impacts={impacts}
      impactsLoading={impactsLoading}
      deployments={deployments}
    />
  );
}

export default function DeploymentCompareDrawer({
  open,
  onClose,
  title,
  initialData,
}: Props): JSX.Element {
  const compareBundle = useDeploymentCompare(initialData);
  const openSurface = useOpenSurface(compareBundle.seed?.serviceName);
  const { impacts, loading: impactsLoading } = useDeploymentImpact(compareBundle.seed?.serviceName);
  const { deployments } = useDeploymentList(compareBundle.seed?.serviceName);

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      direction="right"
    >
      <DrawerContent
        className="top-[var(--space-header-h,56px)] right-0 bottom-0 left-auto z-[1100] h-auto select-text overflow-y-auto border-[var(--border-color)] border-l"
        style={{ width: "min(1120px, calc(100vw - 20px))" }}
      >
        <DeploymentCompareHeader title={title} seed={compareBundle.seed} />
        <DrawerState
          {...compareBundle}
          openSurface={openSurface}
          impacts={impacts}
          impactsLoading={impactsLoading}
          deployments={deployments}
        />
      </DrawerContent>
    </Drawer>
  );
}
