import { Card, Divider, Select, Switch } from 'antd';
import { Bell, Palette, Settings } from 'lucide-react';

interface SettingsPreferencesTabProps {
  theme: string;
  notificationsEnabled: boolean;
  viewPreferences: Record<string, any> | null;
  onThemeChange: (checked: boolean) => void;
  onNotificationsChange: (checked: boolean) => void;
  onPreferenceChange: (key: string, value: any) => void;
}

/**
 * Preferences tab content for settings page.
 */
export default function SettingsPreferencesTab({
  theme,
  notificationsEnabled,
  viewPreferences,
  onThemeChange,
  onNotificationsChange,
  onPreferenceChange,
}: SettingsPreferencesTabProps): JSX.Element {
  return (
    <Card className="settings-card">
      <div className="preference-item">
        <div className="preference-label">
          <Palette size={20} />
          <div>
            <h4>Theme</h4>
            <p>Switch between light and dark mode</p>
          </div>
        </div>
        <Switch
          data-testid="settings-theme-switch"
          checked={theme === 'dark'}
          onChange={onThemeChange}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </div>

      <Divider />

      <div className="preference-item">
        <div className="preference-label">
          <Bell size={20} />
          <div>
            <h4>Notifications</h4>
            <p>Enable or disable notifications</p>
          </div>
        </div>
        <Switch
          data-testid="settings-notifications-switch"
          checked={notificationsEnabled}
          onChange={onNotificationsChange}
        />
      </div>

      <Divider />

      <div className="preference-item">
        <div className="preference-label">
          <Settings size={20} />
          <div>
            <h4>Default Time Range</h4>
            <p>Select default time range for dashboards</p>
          </div>
        </div>
        <Select
          value={viewPreferences?.defaultTimeRange || '1h'}
          onChange={(value) => onPreferenceChange('defaultTimeRange', value)}
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
      </div>

      <Divider />

      <div className="preference-item">
        <div className="preference-label">
          <Settings size={20} />
          <div>
            <h4>Default Page Size</h4>
            <p>Number of items to display per page</p>
          </div>
        </div>
        <Select
          value={viewPreferences?.defaultPageSize || 20}
          onChange={(value) => onPreferenceChange('defaultPageSize', value)}
          style={{ width: 200 }}
          options={[
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
          ]}
        />
      </div>
    </Card>
  );
}

