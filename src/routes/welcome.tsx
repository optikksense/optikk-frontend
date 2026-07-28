import { createFileRoute } from "@tanstack/react-router";

import { requireSession } from "@shared/api/auth/requireSession";

// Authed but rendered full-screen (no MainLayout shell), like login/signup.
export const Route = createFileRoute("/welcome")({
  beforeLoad: async ({ location }) => {
    await requireSession(location.href);
  },
});
