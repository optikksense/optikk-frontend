import { createFileRoute } from "@tanstack/react-router";

import { requireSession } from "@shared/api/auth/requireSession";

                                                                            
export const Route = createFileRoute("/welcome")({
  beforeLoad: async ({ location }) => {
    await requireSession(location.href);
  },
});
