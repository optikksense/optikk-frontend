import { IconButton, Skeleton, Surface } from "@/components/ui";
import { Copy, Key, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { SettingsTenantViewModel } from "../../types";

interface SettingsTenantTabProps {
  readonly profileLoading: boolean;
  readonly tenants: SettingsTenantViewModel[];
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `••••••••••••${key.slice(-4)}`;
}

export default function SettingsTenantTab({
  profileLoading,
  tenants,
}: SettingsTenantTabProps): JSX.Element {
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());

  if (profileLoading) {
    return (
      <div className="p-xl">
        <Skeleton count={4} />
      </div>
    );
  }

  const toggleReveal = (index: number) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const copyKey = (key: string) => {
    void navigator.clipboard
      .writeText(key)
      .then(() => {
        toast.success("API key copied", { duration: 2000 });
      })
      .catch(() => {
        toast.error("Unable to copy API key");
      });
  };

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <div className="mb-md flex items-center gap-sm">
        <Users size={20} />
        <h3 className="m-0 font-semibold text-lg">Tenant Information</h3>
      </div>

      <div className="border-t" />

      {tenants.map((tenant, index) => (
        <div key={`${tenant.name ?? "tenant"}-${index}`} className="border-b py-sm">
          <div className="mb-xs flex items-center justify-between">
            <span className="font-semibold text-md">{tenant.name}</span>
            <span className="text-muted text-xs uppercase tracking-wide">{tenant.role}</span>
          </div>
          {tenant.apiKey && (
            <div className="flex items-center gap-xs">
              <Key size={13} className="text-muted" />
              <code className="font-mono text-secondary text-xs" style={{ wordBreak: "break-all" }}>
                {revealedKeys.has(index) ? tenant.apiKey : maskApiKey(tenant.apiKey)}
              </code>
              <button
                type="button"
                className="text-muted text-xs"
                onClick={() => toggleReveal(index)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {revealedKeys.has(index) ? "Hide" : "Reveal"}
              </button>
              <IconButton
                icon={<Copy size={12} />}
                size="sm"
                label="Copy API key"
                onClick={() => copyKey(tenant.apiKey!)}
              />
            </div>
          )}
        </div>
      ))}

      {tenants.length === 0 && (
        <p className="py-lg text-muted" style={{ textAlign: "center" }}>
          You are not a member of any tenants yet.
        </p>
      )}
    </Surface>
  );
}
