import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

export const Route = createFileRoute("/_app/saturation/database/instance/$system")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: ROUTES.databaseInstance,
      params: { system: params.system },
    });
  },
});
