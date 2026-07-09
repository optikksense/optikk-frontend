import { createLazyFileRoute } from "@tanstack/react-router";

import ErrorTrackingPage from "@/features/errors/pages/ErrorTrackingPage";

export const Route = createLazyFileRoute("/_app/errors/")({
  component: () => <ErrorTrackingPage />,
});
