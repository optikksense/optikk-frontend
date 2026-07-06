import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { OptikkLogo } from "@/shared/components/brand/OptikkLogo";

import { approveDevice } from "../api/deviceAuthApi";

// Reads an optional ?user_code= to prefill the code shown by the CLI.
function initialCode(): string {
  const params = new URLSearchParams(window.location.search);
  return (params.get("user_code") ?? "").toUpperCase();
}

function DeviceApprovePage() {
  const [code, setCode] = useState(initialCode);

  const mutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (userCode) => approveDevice(userCode),
  });

  const approved = mutation.isSuccess;

  return (
    <div className="min-h-screen bg-surface-canvas px-6 py-10 text-foreground">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2.5 font-bold text-[16px] tracking-[-0.01em]">
          <OptikkLogo size={28} />
          Optikk
        </div>

        <h1 className="m-0 mb-1.5 font-bold text-2xl tracking-[-0.015em]">Authorize your CLI</h1>
        <p className="m-0 mb-8 text-[13.5px] text-foreground-muted">
          Confirm the code shown in your terminal to finish signing in.
        </p>

        {approved ? (
          <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-[13.5px]">
            ✓ Device approved. Return to your terminal — it will finish logging in.
          </div>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = code.trim().toUpperCase();
              if (trimmed) mutation.mutate(trimmed);
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="rounded-md border border-border bg-surface-inset px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.15em] outline-none focus:border-primary"
            />
            {mutation.isError && (
              <p className="m-0 text-[13px] text-error">{mutation.error.message}</p>
            )}
            <button
              type="submit"
              disabled={mutation.isPending || !code.trim()}
              className="mt-1 flex h-[42px] w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary font-semibold text-[var(--login-submit-fg)] text-sm transition-colors hover:border-[var(--login-link)] hover:bg-[var(--login-link)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Approving…" : "Approve"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default DeviceApprovePage;
