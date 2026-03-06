import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Tabs } from 'antd';
import { Palette, Settings, User, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { PageHeader } from '@components/common';

import { settingsService } from '@services/settingsService';

import { useAppStore } from '@store/appStore';

import {
  SettingsPreferencesTab,
  SettingsProfileTab,
  SettingsTeamTab,
} from '../../components/tabs';

import './SettingsPage.css';

/**
 * Settings page container that coordinates profile/preferences/team tabs.
 */
export default function SettingsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [profileForm] = Form.useForm();

  const {
    theme,
    notificationsEnabled,
    viewPreferences,
    setTheme,
    setNotificationsEnabled,
    setViewPreference,
  } = useAppStore();

  const { data: profileRaw, isLoading: profileLoading } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: () => settingsService.getProfile(),
  });

  const profile = (profileRaw as Record<string, any> | null) ?? null;
  const teams = Array.isArray(profile?.teams) ? profile.teams : [];

  const updateProfileMutation = useMutation({
    mutationFn: (data: Record<string, any>) => settingsService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['settings-profile'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update profile');
    },
  });

  const handleProfileSubmit = (values: Record<string, any>): void => {
    updateProfileMutation.mutate({
      name: values.name,
      avatarUrl: values.avatarUrl,
    });
  };

  const handleThemeChange = (checked: boolean): void => {
    setTheme(checked ? 'dark' : 'light');
    toast.success(`Switched to ${checked ? 'dark' : 'light'} theme`);
  };

  const handleNotificationsChange = (checked: boolean): void => {
    setNotificationsEnabled(checked);
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handlePreferenceChange = (key: string, value: any): void => {
    setViewPreference(key, value);
    toast.success('Preference updated');
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="settings-page">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs
        defaultActiveKey="profile"
        className="settings-tabs"
        items={[
          {
            key: 'profile',
            label: (
              <span className="tab-label">
                <User size={16} />
                Profile
              </span>
            ),
            children: (
              <SettingsProfileTab
                profileLoading={profileLoading}
                profile={profile}
                profileForm={profileForm}
                isSaving={updateProfileMutation.isPending}
                getInitials={getInitials}
                onSubmit={handleProfileSubmit}
              />
            ),
          },
          {
            key: 'preferences',
            label: (
              <span className="tab-label">
                <Palette size={16} />
                Preferences
              </span>
            ),
            children: (
              <SettingsPreferencesTab
                theme={theme}
                notificationsEnabled={notificationsEnabled}
                viewPreferences={(viewPreferences as Record<string, any>) ?? null}
                onThemeChange={handleThemeChange}
                onNotificationsChange={handleNotificationsChange}
                onPreferenceChange={handlePreferenceChange}
              />
            ),
          },
          {
            key: 'team',
            label: (
              <span className="tab-label">
                <Users size={16} />
                Team
              </span>
            ),
            children: <SettingsTeamTab profileLoading={profileLoading} teams={teams} />,
          },
        ]}
      />
    </div>
  );
}

