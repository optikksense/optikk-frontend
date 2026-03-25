import { Bell, Columns2, Palette, Settings } from 'lucide-react';
import { Surface, Switch, Select } from '@/components/ui';

import type {
  SettingsPreferenceKey,
  SettingsPreferenceValue,
  SettingsViewPreferences,
} from '../../types';

interface SettingsPreferencesTabProps {
  readonly theme: string;
  readonly notificationsEnabled: boolean;
  readonly viewPreferences: SettingsViewPreferences | null;
  readonly onThemeChange: (checked: boolean) => void;
  readonly onNotificationsChange: (checked: boolean) => void;
  readonly onPreferenceChange: (
    key: SettingsPreferenceKey,
    value: SettingsPreferenceValue,
  ) => void;
}

function PrefRow({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-sm border-b">
      <div className="flex items-center gap-sm">
        <span className="text-secondary">{icon}</span>
        <div>
          <div className="font-semibold text-base">{title}</div>
          <div className="text-xs text-muted">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPreferencesTab({
  theme,
  notificationsEnabled,
  viewPreferences,
  onThemeChange,
  onNotificationsChange,
  onPreferenceChange,
}: SettingsPreferencesTabProps): JSX.Element {
  const density = viewPreferences?.density || 'comfortable';

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <PrefRow
        icon={<Palette size={18} />}
        title="Theme"
        description="Switch between light and dark mode"
      >
        <Switch
          checked={theme === 'dark'}
          onChange={(e) => onThemeChange(e.target.checked)}
          label={theme === 'dark' ? 'Dark' : 'Light'}
        />
      </PrefRow>

      <PrefRow
        icon={<Columns2 size={18} />}
        title="Density"
        description="Compact mode reduces spacing for more data density"
      >
        <Switch
          checked={density === 'compact'}
          onChange={(e) => onPreferenceChange('density', e.target.checked ? 'compact' : 'comfortable')}
          label={density === 'compact' ? 'Compact' : 'Comfortable'}
        />
      </PrefRow>

      <PrefRow
        icon={<Bell size={18} />}
        title="Notifications"
        description="Enable or disable notifications"
      >
        <Switch
          checked={notificationsEnabled}
          onChange={(e) => onNotificationsChange(e.target.checked)}
        />
      </PrefRow>

      <PrefRow
        icon={<Settings size={18} />}
        title="Default Time Range"
        description="Select default time range for dashboards"
      >
        <Select
          value={viewPreferences?.defaultTimeRange || '1h'}
          onChange={(val) => onPreferenceChange('defaultTimeRange', String(val))}
          style={{ width: 200 }}
          options={[
            { value: '15m', label: 'Last 15 minutes' },
            { value: '30m', label: 'Last 30 minutes' },
            { value: '1h', label: 'Last 1 hour' },
            { value: '3h', label: 'Last 3 hours' },
            { value: '6h', label: 'Last 6 hours' },
            { value: '12h', label: 'Last 12 hours' },
            { value: '24h', label: 'Last 24 hours' },
            { value: '7d', label: 'Last 7 days' },
          ]}
        />
      </PrefRow>

      <PrefRow
        icon={<Settings size={18} />}
        title="Default Page Size"
        description="Number of items to display per page"
      >
        <Select
          value={viewPreferences?.defaultPageSize || 20}
          onChange={(val) => onPreferenceChange('defaultPageSize', Number(val))}
          style={{ width: 200 }}
          options={[
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
          ]}
        />
      </PrefRow>
    </Surface>
  );
}
