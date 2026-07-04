import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { z } from "zod";

const LoginPage = lazy(() => import("@/app/auth"));

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: () => (
      <LoginPage />

  ),
});
