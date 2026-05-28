import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { useAppStore } from "@store/appStore";
import { useAuthIsLoading, useAuthStore } from "@store/authStore";

import { LoginField } from "./LoginField";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email").email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

/**
 * Login form — email, password, remember-me, submit.
 */
export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthIsLoading();
  const setTimeRange = useAppStore((s) => s.setTimeRange);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    const result = await login(parsed.data.email, parsed.data.password);
    if (result.success) {
      applyPostLoginDefaults();
      navigate({ to: "/overview" });
    }
  };

  const applyPostLoginDefaults = (): void => {
    setTimeRange({
      kind: "relative",
      preset: "30m",
      label: "Last 30 minutes",
      minutes: 30,
    });
    toast.success("Login successful!");
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off">
      <LoginField
        id="email"
        label="Work Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
        icon={<Mail size={16} />}
        required
        autoComplete="email"
      />

      <LoginField
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••••"
        icon={<Lock size={16} />}
        required
        autoComplete="current-password"
        endSlot={<PasswordToggle show={showPassword} onToggle={setShowPassword} />}
      />

      <SubmitButton loading={isLoading} />
    </form>
  );
}

/* ── Sub-components (kept private to this file) ─────────── */

function PasswordToggle({
  show,
  onToggle,
}: {
  readonly show: boolean;
  readonly onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="absolute right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--text-muted)] transition-colors duration-150 hover:text-foreground"
      onClick={() => onToggle(!show)}
      aria-label={show ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function SubmitButton({ loading }: { readonly loading: boolean }) {
  return (
    <button
      data-testid="login-submit"
      type="submit"
      className="mt-2 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border-0 bg-[image:var(--login-btn-gradient)] font-[inherit] text-base font-semibold text-[var(--login-btn-text)] transition-[opacity,transform,box-shadow] duration-150 [&:hover:not(:disabled)]:-translate-y-px [&:hover:not(:disabled)]:opacity-[0.92] [&:hover:not(:disabled)]:shadow-[0_4px_20px_var(--login-accent-glow)] [&:active:not(:disabled)]:translate-y-0 [&:active:not(:disabled)]:opacity-[0.85] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
    >
      {loading ? (
        <span className="h-[18px] w-[18px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-[var(--login-btn-text)]" />
      ) : (
        <>
          <LogIn size={18} />
          Sign in to Optikk
        </>
      )}
    </button>
  );
}
