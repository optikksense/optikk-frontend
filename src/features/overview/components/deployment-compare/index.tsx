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
import { useOpenSurface } from "./hooks/useOpenSurface";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  initialData?: Record<string, unknown> | null;
}

function DrawerState({
  seed,
  compareQuery,
  compare,
  timelineQuery,
  timeline,
  openSurface,
}: ReturnType<typeof useDeploymentCompare> & {
  openSurface: ReturnType<typeof useOpenSurface>;
}) {
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
        <DrawerState {...compareBundle} openSurface={openSurface} />
      </DrawerContent>
    </Drawer>
  );
}
