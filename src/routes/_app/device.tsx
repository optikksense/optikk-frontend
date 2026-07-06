import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DeviceApprovePage = lazy(() => import("@/features/deviceAuth/pages/DeviceApprovePage"));

export const Route = createFileRoute("/_app/device")({
  component: () => <DeviceApprovePage />,
});
