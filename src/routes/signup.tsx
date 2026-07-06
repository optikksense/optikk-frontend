import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { z } from "zod";

const SignupPage = lazy(() => import("@/app/auth/pages/SignupPage"));

export const Route = createFileRoute("/signup")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: () => <SignupPage />,
});
