import { createFileRoute, redirect } from "@tanstack/react-router";

                                                                
export const Route = createFileRoute("/_app/ingestion")({
  loader: () => {
    throw redirect({ to: "/settings?tab=ingestion" as never, replace: true });
  },
});
