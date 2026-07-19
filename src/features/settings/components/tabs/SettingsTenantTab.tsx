import { IconButton, Skeleton, Surface } from "@shared/components/primitives/ui";
import { Copy, Key, RefreshCw, TriangleAlert, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { rotateApiKey } from "../../api/tenantApi";
import type { SettingsTenantViewModel } from "../../types";

interface SettingsTenantTabProps {
  readonly profileLoading: boolean;
  readonly tenants: SettingsTenantViewModel[];
  readonly isAdmin: boolean;
}

export default function SettingsTenantTab({
  profileLoading,
  tenants,
  isAdmin,
}: SettingsTenantTabProps): JSX.Element {
  if (profileLoading) {
    return (
      <div className="p-xl">
        <Skeleton count={4} />
      </div>
    );
  }

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
        </div>
      ))}

      {tenants.length === 0 && (
        <p className="py-lg text-muted" style={{ textAlign: "center" }}>
          You are not a member of any tenants yet.
        </p>
      )}

      <ApiKeySection isAdmin={isAdmin} />
    </Surface>
  );
}

/**
 * API keys are stored hashed server-side, so a key is visible exactly once:
 * in the response that minted it. This section is the only place a key can
 * be regenerated; there is no way to re-display an existing key.
 */
function ApiKeySection({ isAdmin }: { readonly isAdmin: boolean }): JSX.Element {
  const [newKey, setNewKey] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);

  const regenerate = async () => {
    setRotating(true);
    try {
      const resp = await rotateApiKey();
      setNewKey(resp.apiKey);
      toast.success("New API key generated", { duration: 2000 });
    } catch {
      toast.error("Unable to regenerate API key");
    } finally {
      setRotating(false);
    }
  };

  const copyKey = (key: string) => {
    void navigator.clipboard
      .writeText(key)
      .then(() => toast.success("API key copied", { duration: 2000 }))
      .catch(() => toast.error("Unable to copy API key"));
  };

  return (
    <div className="pt-md">
      <div className="mb-xs flex items-center gap-xs">
        <Key size={14} className="text-muted" />
        <span className="font-semibold text-md">Ingest API key</span>
      </div>
      <p className="m-0 mb-sm text-muted text-xs">
        Keys are stored hashed and are <strong>not recoverable if lost</strong>. A key is shown only
        once, when it is generated — if you lose it, regenerate a new one (the old key stops working
        within a few minutes).
      </p>

      {isAdmin ? (
        <button
          type="button"
          className="flex items-center gap-xs text-xs"
          onClick={() => void regenerate()}
          disabled={rotating}
          style={{ cursor: rotating ? "wait" : "pointer" }}
        >
          <RefreshCw size={12} />
          {rotating ? "Generating…" : "Regenerate API key"}
        </button>
      ) : (
        <p className="m-0 text-muted text-xs">Ask a tenant admin to regenerate the key.</p>
      )}

      {newKey && (
        <div className="mt-sm rounded border p-sm">
          <div className="mb-xs flex items-center gap-xs text-xs">
            <TriangleAlert size={13} />
            <strong>Store this key now — it cannot be shown again.</strong>
          </div>
          <div className="flex items-center gap-xs">
            <code className="font-mono text-secondary text-xs" style={{ wordBreak: "break-all" }}>
              {newKey}
            </code>
            <IconButton
              icon={<Copy size={12} />}
              size="sm"
              label="Copy API key"
              onClick={() => copyKey(newKey)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
