import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ROUTES } from "@shared/constants/routes";
import { cn } from "@shared/lib/utils";

import { session } from "@shared/api/auth/session";

import type { ReactNode } from "react";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  orgName: z.string().trim().min(1, "Please enter your organization"),
  email: z.string().trim().min(1, "Please enter your email").email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptedTerms: z
    .boolean()
    .refine((v) => v, { message: "Please accept the Terms of Service and Privacy Policy" }),
});

type SignupField = keyof z.infer<typeof signupSchema>;
type FieldErrors = Partial<Record<SignupField, string>>;

function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as SignupField | undefined;
    if (field != null && errors[field] == null) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function SignupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field: SignupField): void => {
    setErrors((current) => (current[field] == null ? current : { ...current, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, orgName, email, password, acceptedTerms });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    let result: "verificationRequired" | "signedIn";
    try {
      result = await session.signup(parsed.data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
      setIsSubmitting(false);
      return;
    }

    if (result === "signedIn") {
      toast.success("Account created.");
      navigate({ to: ROUTES.welcome });
      return;
    }
    toast.success("Check your email to verify your account.");
    navigate({ to: ROUTES.login });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <Field
        id="name"
        label="Your name"
        type="text"
        value={name}
        onChange={(v) => {
          setName(v);
          clearError("name");
        }}
        placeholder="Ada Lovelace"
        icon={<User size={15} strokeWidth={2} />}
        autoComplete="name"
        error={errors.name}
      />
      <Field
        id="orgName"
        label="Organization"
        type="text"
        value={orgName}
        onChange={(v) => {
          setOrgName(v);
          clearError("orgName");
        }}
        placeholder="Acme, Inc."
        icon={<Building2 size={15} strokeWidth={2} />}
        autoComplete="organization"
        error={errors.orgName}
      />
      <Field
        id="email"
        label="Work email"
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          clearError("email");
        }}
        placeholder="you@company.com"
        icon={<Mail size={15} strokeWidth={2} />}
        autoComplete="email"
        error={errors.email}
      />
      <Field
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(v) => {
          setPassword(v);
          clearError("password");
        }}
        placeholder="At least 8 characters"
        icon={<Lock size={15} strokeWidth={2} />}
        autoComplete="new-password"
        endSlot={<ShowHideToggle show={showPassword} onToggle={setShowPassword} />}
        error={errors.password}
      />
      <TermsCheckbox
        checked={acceptedTerms}
        onChange={(v) => {
          setAcceptedTerms(v);
          clearError("acceptedTerms");
        }}
        error={errors.acceptedTerms}
      />
      <SubmitButton loading={isSubmitting} />
      <SignInLine />
    </form>
  );
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly icon: ReactNode;
  readonly endSlot?: ReactNode;
  readonly autoComplete?: string;
  readonly error?: string;
}

function FieldError({ id, message }: { readonly id: string; readonly message: string }) {
  return (
    <p id={`${id}-error`} className="m-0 text-[11.5px] text-error">
      {message}
    </p>
  );
}

const INPUT_BASE =
  "h-[42px] w-full rounded-md border border-border bg-card " +
  "py-0 pl-9 pr-3 font-[inherit] text-[13.5px] text-foreground outline-none " +
  "transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-foreground-muted " +
  "hover:border-foreground-muted " +
  "focus:border-primary focus:shadow-[var(--login-focus-ring)]";

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  endSlot,
  autoComplete,
  error,
}: FieldProps) {
  return (
    <div className="mb-3 grid gap-1.5">
      <label
        htmlFor={id}
        className="font-semibold text-[11.5px] text-foreground-secondary uppercase tracking-[0.04em]"
      >
        {label}
      </label>
      <div className="relative">
        <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-[11px] text-foreground-muted">
          {icon}
        </span>
        <input
          id={id}
          data-testid={`signup-${id}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error != null || undefined}
          aria-describedby={error != null ? `${id}-error` : undefined}
          className={cn(INPUT_BASE, endSlot && "pr-16", error && "border-error")}
        />
        {endSlot}
      </div>
      {error && <FieldError id={id} message={error} />}
    </div>
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
      className="-translate-y-1/2 absolute top-1/2 right-2 rounded px-1.5 py-1 font-semibold text-[11px] text-foreground-muted uppercase tracking-[0.04em] transition-colors hover:bg-surface-inset hover:text-foreground-secondary"
    >
      {show ? "Hide" : "Show"}
    </button>
  );
}

function SubmitButton({ loading }: { readonly loading: boolean }) {
  return (
    <button
      data-testid="signup-submit"
      type="submit"
      disabled={loading}
      className="mt-2 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary font-[inherit] font-semibold text-[var(--login-submit-fg)] text-sm transition-[background-color,border-color,transform] duration-150 hover:border-[var(--login-link)] hover:bg-[var(--login-link)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-[16px] w-[16px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <>
          Create account
          <ArrowRight size={14} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}

function SignInLine() {
  return (
    <p className="mt-4 text-center text-[12.5px] text-foreground-muted">
      Already have an account?{" "}
      <Link
        to={ROUTES.login}
        className="font-semibold text-[var(--login-link)] no-underline hover:underline"
      >
        Sign in
      </Link>
    </p>
  );
}

function TermsCheckbox({
  checked,
  onChange,
  error,
}: {
  readonly checked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly error?: string;
}) {
  return (
    <div className="mt-4 grid gap-1.5">
      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] text-foreground-muted leading-[1.5]">
        <input
          id="acceptedTerms"
          data-testid="signup-terms"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error != null || undefined}
          aria-describedby={error != null ? "acceptedTerms-error" : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        />
        <span>
          I agree to Optikk&apos;s{" "}
          <a href={ROUTES.terms} className="text-foreground-secondary underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href={ROUTES.privacy} className="text-foreground-secondary underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {error && <FieldError id="acceptedTerms" message={error} />}
    </div>
  );
}
