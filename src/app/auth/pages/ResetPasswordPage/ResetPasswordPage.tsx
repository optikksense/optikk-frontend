import { ROUTES } from "@shared/constants/routes";

import { AuthPageShell } from "../../components/AuthPageShell";
import { ResetPasswordForm } from "./ResetPasswordForm";

export function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Set new password"
      subtitle="Enter your new password below. Make sure it's at least 8 characters long."
      prompt="Remembered your password?"
      actionLabel="Sign in"
      actionTo={ROUTES.login}
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
