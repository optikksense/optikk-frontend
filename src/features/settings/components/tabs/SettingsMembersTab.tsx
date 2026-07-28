import { Button } from "@shared/components/primitives/ui/button";
import { Card as Surface } from "@shared/components/primitives/ui/card";
import { Modal } from "@shared/components/primitives/ui/dialog";
import { IconButton } from "@shared/components/primitives/ui/icon-button";
import { Select } from "@shared/components/primitives/ui/select";
import { Skeleton } from "@shared/components/primitives/ui/skeleton";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@app/store/authStore";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";

import type { MemberRole } from "../../api/membersApi";
import { useMemberMutations, useMembers } from "../../hooks/useMembers";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

function asRole(value: string | number | (string | number)[]): MemberRole {
  return value === "admin" ? "admin" : "member";
}

export default function SettingsMembersTab(): JSX.Element {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data: members, isLoading, isError, error } = useMembers();
  const { create, updateRole, remove } = useMemberMutations();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "member" as MemberRole,
  });

  const isSelf = (memberId: number) => String(memberId) === String(currentUserId);

  const changeRole = (id: number, role: MemberRole) => {
    updateRole.mutate({ id, role }, { onError: (e) => toast.error(formatErrorForDisplay(e)) });
  };

  const removeMember = (id: number) => {
    remove.mutate(id, {
      onSuccess: () => toast.success("Member removed"),
      onError: (e) => toast.error(formatErrorForDisplay(e)),
    });
  };

  const submitInvite = () => {
    if (!form.email || !form.name) {
      toast.error("Email and name are required");
      return;
    }
    create.mutate(form, {
      onSuccess: () => {
        toast.success("Member added");
        setInviteOpen(false);
        setForm({ email: "", name: "", password: "", role: "member" });
      },
      onError: (e) => toast.error(formatErrorForDisplay(e)),
    });
  };

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <div className="mb-md flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Users size={20} />
          <h3 className="m-0 font-semibold text-lg">Members</h3>
        </div>
        <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus size={14} className="mr-xs" /> Add member
        </Button>
      </div>

      <div className="border-t" />

      {isLoading && (
        <div className="py-md">
          <Skeleton count={3} />
        </div>
      )}

      {isError && (
        <p className="py-lg text-danger" style={{ textAlign: "center" }}>
          {formatErrorForDisplay(error)}
        </p>
      )}

      {!isLoading &&
        !isError &&
        (members ?? []).map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b py-sm">
            <div className="flex flex-col">
              <span className="font-semibold text-md">{m.name}</span>
              <span className="text-muted text-xs">{m.email}</span>
            </div>
            <div className="flex items-center gap-sm">
              {isSelf(m.id) ? (
                <span className="text-muted text-xs uppercase tracking-wide">{m.role}</span>
              ) : (
                <Select
                  value={m.role}
                  options={ROLE_OPTIONS}
                  onChange={(v) => changeRole(m.id, asRole(v))}
                />
              )}
              <IconButton
                icon={<Trash2 size={14} />}
                size="sm"
                label="Remove member"
                disabled={isSelf(m.id) || remove.isPending}
                onClick={() => removeMember(m.id)}
              />
            </div>
          </div>
        ))}

      {!isLoading && !isError && (members ?? []).length === 0 && (
        <p className="py-lg text-muted" style={{ textAlign: "center" }}>
          No members yet.
        </p>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Add member">
        <div className="flex flex-col gap-sm p-sm">
          <input
            className="w-full rounded border px-sm py-xs"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full rounded border px-sm py-xs"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded border px-sm py-xs text-sm"
            placeholder="Optional temporary password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="mt-[-4px] text-muted text-xs">
            Leave blank to email the user an invite link to set their own password.
          </p>
          <Select
            value={form.role}
            options={ROLE_OPTIONS}
            onChange={(v) => setForm({ ...form, role: asRole(v) })}
          />
          <div className="mt-sm flex justify-end gap-sm">
            <Button variant="ghost" size="sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={submitInvite} disabled={create.isPending}>
              Add member
            </Button>
          </div>
        </div>
      </Modal>
    </Surface>
  );
}
