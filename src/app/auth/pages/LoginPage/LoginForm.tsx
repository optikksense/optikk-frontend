import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail } from "lucide-react";

import { ROUTES } from "@shared/constants/routes";

import { LoginField } from "./LoginField";
import { useLoginSubmit } from "./useLoginSubmit";

export function LoginForm() {
  const form = useLoginSubmit();
  return (
    <form onSubmit={form.handleSubmit} autoComplete="off">
      <LoginField
        id="email"
        label="Work email"
        type="email"
        value={form.email}
        onChange={form.setEmail}
        placeholder="you@company.com"
        icon={<Mail size={15} strokeWidth={2} />}
        required
        autoComplete="email"
      />
      <LoginField
        id="password"
        label="Password"
        type={form.showPassword ? "text" : "password"}
        value={form.password}
        onChange={form.setPassword}
        placeholder="••••••••••••"
        icon={<Lock size={15} strokeWidth={2} />}
        required
        autoComplete="current-password"
        hint={<ForgotLink />}
        endSlot={<ShowHideToggle show={form.showPassword} onToggle={form.setShowPassword} />}
      />
      <KeepSignedInRow />
      <SubmitButton loading={form.isLoading} />
      <RequestAccessLine />
      <LegalLine />
    </form>
  );
}

function ForgotLink() {
  return (
    <a
      href="#"
      className="text-[11.5px] font-medium text-[var(--login-link)] no-underline hover:underline"
    >
      Forgot?
    </a>
  );
}

function ShowHideToggle({
  show,
  onToggle,
}: {
  readonly show: boolean;
  readonly onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!show)}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-inset)] hover:text-[var(--text-secondary)]"
    >
      {show ? "Hide" : "Show"}
    </button>
  );
}

function KeepSignedInRow() {
  return (
    <div className="my-1 mb-[18px] flex items-center justify-between">
      <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-[var(--text-secondary)]">
        <input
          type="checkbox"
          className="m-0 h-[14px] w-[14px] accent-[var(--color-primary)]"
        />
        Keep me signed in
      </label>
    </div>
  );
}

function SubmitButton({ loading }: { readonly loading: boolean }) {
  return (
    <button
      data-testid="login-submit"
      type="submit"
      disabled={loading}
      className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] font-[inherit] text-sm font-semibold text-[var(--login-submit-fg)] transition-[background-color,border-color,transform] duration-150 hover:border-[var(--login-link)] hover:bg-[var(--login-link)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-[16px] w-[16px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <>
          Sign in
          <ArrowRight size={14} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}

function RequestAccessLine() {
  return (
    <p className="mt-4 text-center text-[12.5px] text-[var(--text-muted)]">
      Don&apos;t have an account?{" "}
      <Link
        to={ROUTES.pricing}
        className="font-semibold text-[var(--login-link)] no-underline hover:underline"
      >
        Request access
      </Link>
    </p>
  );
}

function LegalLine() {
  return (
    <p className="mx-auto mt-[22px] max-w-[320px] text-center text-[11px] leading-[1.5] text-[var(--text-muted)]">
      By signing in you agree to Optikk&apos;s{" "}
      <Link to={ROUTES.terms} className="text-[var(--text-secondary)] underline">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link to={ROUTES.privacy} className="text-[var(--text-secondary)] underline">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
