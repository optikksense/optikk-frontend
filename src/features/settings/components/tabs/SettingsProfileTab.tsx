import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Surface, Button, Skeleton } from '@/components/ui';

import type { SettingsProfileFormValues, SettingsProfileViewModel } from '../../types';

interface SettingsProfileTabProps {
  readonly profileLoading: boolean;
  readonly profile: SettingsProfileViewModel | null;
  readonly isSaving: boolean;
  readonly getInitials: (name: string) => string;
  readonly onSubmit: (values: SettingsProfileFormValues) => void;
}

export default function SettingsProfileTab({
  profileLoading,
  profile,
  isSaving,
  getInitials,
  onSubmit,
}: SettingsProfileTabProps): JSX.Element {
  const [name, setName] = useState(profile?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setAvatarUrl(profile.avatarUrl ?? '');
    }
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="p-xl">
        <Skeleton count={5} />
      </div>
    );
  }

  const initials = getInitials(profile?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email: profile?.email, avatarUrl: avatarUrl || undefined });
  };

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <div className="flex items-center gap-md mb-md">
        <div
          className="flex items-center justify-center rounded font-bold text-lg"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: profile?.avatarUrl
              ? `url(${profile.avatarUrl}) center/cover`
              : 'var(--color-primary)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {!profile?.avatarUrl && initials}
        </div>
        <div>
          <div className="text-lg font-semibold">{profile?.name}</div>
          <div className="text-sm text-muted">{profile?.role}</div>
        </div>
      </div>

      <div className="border-t mb-md" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Name</label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="h-9 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-10 pr-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-subtle-10)]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Email</label>
          <input
            value={profile?.email ?? ''}
            disabled
            className="h-9 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 text-[13px] text-[var(--text-muted)] opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="h-9 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-subtle-10)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Role</label>
          <input
            value={profile?.role ?? ''}
            disabled
            className="h-9 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 text-[13px] text-[var(--text-muted)] opacity-60"
          />
        </div>

        <Button variant="primary" fullWidth loading={isSaving} type="submit">
          Save Changes
        </Button>
      </form>
    </Surface>
  );
}
