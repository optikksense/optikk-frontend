import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ErrorGroupDetailPage = lazy(() => import("@/features/errors/pages/ErrorGroupDetailPage"));

export const Route = createFileRoute("/_app/errors/$groupId")({
  component: () => <ErrorGroupDetailPage />,
});
