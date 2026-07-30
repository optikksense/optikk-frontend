import { ROUTES } from "@shared/constants/routes";

import { AuthPageShell } from "../../components/AuthPageShell";
import { SignupForm } from "./SignupForm";

export function SignupPage() {
  return (
    <AuthPageShell
      title="Start observing in minutes"
      subtitle="Create your workspace and get an API key — your first trace lands in minutes."
      prompt="Already have an account?"
      actionLabel="Sign in"
      actionTo={ROUTES.login}
    >
      <SignupForm />
    </AuthPageShell>
  );
}
