import { IconButton, Skeleton, Surface } from "@/components/ui";
import { Copy, Key, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import type { SettingsTeamViewModel } from "../../types";

interface SettingsTeamTabProps {
  readonly profileLoading: boolean;
  readonly teams: SettingsTeamViewModel[];
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `••••••••••••${key.slice(-4)}`;
}

export default function SettingsTeamTab({
  profileLoading,
  teams,
}: SettingsTeamTabProps): JSX.Element {
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
        toast.success("API key copied");
      })
      .catch(() => {
        toast.error("Unable to copy API key");
      });
  };

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <div className="mb-md flex items-center gap-sm">
        <Users size={20} />
        <h3 className="m-0 font-semibold text-lg">Team Information</h3>
      </div>

      <div className="border-t" />

      {teams.map((team, index) => (
        <div key={`${team.name ?? "team"}-${index}`} className="border-b py-sm">
          <div className="mb-xs flex items-center justify-between">
            <span className="font-semibold text-md">{team.name}</span>
            <span className="text-muted text-xs uppercase tracking-wide">{team.role}</span>
          </div>
          {team.apiKey && (
            <div className="flex items-center gap-xs">
              <Key size={13} className="text-muted" />
              <code className="font-mono text-secondary text-xs" style={{ wordBreak: "break-all" }}>
                {revealedKeys.has(index) ? team.apiKey : maskApiKey(team.apiKey)}
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
                onClick={() => copyKey(team.apiKey!)}
              />
            </div>
          )}
        </div>
      ))}

      {teams.length === 0 && (
        <p className="py-lg text-muted" style={{ textAlign: "center" }}>
          You are not a member of any teams yet.
        </p>
      )}
    </Surface>
  );
}
