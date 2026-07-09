import { createLazyFileRoute } from "@tanstack/react-router";

import DeviceApprovePage from "@/features/deviceAuth/pages/DeviceApprovePage";

export const Route = createLazyFileRoute("/_app/device")({
  component: () => <DeviceApprovePage />,
});
