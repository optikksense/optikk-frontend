import React from 'react';
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Descriptions,
  Spin,
  Avatar,
  Divider,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, User, Palette, Bell, Users, Key } from 'lucide-react';
import { PageHeader } from '@components/common';
import { settingsService } from '@services/settingsService';
import { useAppStore } from '@store/appStore';
import { toast } from 'react-hot-toast';
import './SettingsPage.css';

const { TabPane } = Tabs;
const { Option } = Select;

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [profileForm] = Form.useForm();

  const {
    theme,
    notificationsEnabled,
    viewPreferences,
    setTheme,
    setNotificationsEnabled,
    setViewPreferences,
  } = useAppStore();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: () => settingsService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => settingsService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['settings-profile']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleProfileSubmit = (values) => {
    updateProfileMutation.mutate({
      name: values.name,
      avatarUrl: values.avatarUrl,
    });
  };

  const handleThemeChange = (checked) => {
    setTheme(checked ? 'dark' : 'light');
    toast.success(`Switched to ${checked ? 'dark' : 'light'} theme`);
  };

  const handleNotificationsChange = (checked) => {
    setNotificationsEnabled(checked);
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleDefaultTimeRangeChange = (value) => {
    setViewPreferences({ ...viewPreferences, defaultTimeRange: value });
    toast.success('Default time range updated');
  };

  const handleDefaultPageSizeChange = (value) => {
    setViewPreferences({ ...viewPreferences, defaultPageSize: value });
    toast.success('Default page size updated');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderProfileTab = () => {
    if (profileLoading) {
      return (
        <div className="settings-loading">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <Card className="settings-card">
        <div className="profile-header">
          <Avatar size={80} src={profile?.avatarUrl} className="profile-avatar">
            {getInitials(profile?.name)}
          </Avatar>
          <div className="profile-info">
            <h3>{profile?.name}</h3>
            <p className="profile-role">{profile?.role}</p>
          </div>
        </div>

        <Divider />

        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSubmit}
          initialValues={{
            name: profile?.name,
            email: profile?.email,
            avatarUrl: profile?.avatarUrl,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input prefix={<User size={16} />} placeholder="Your name" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input prefix={<Bell size={16} />} disabled />
          </Form.Item>

          <Form.Item label="Avatar URL" name="avatarUrl">
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>

          <Form.Item label="Role">
            <Input value={profile?.role} disabled />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateProfileMutation.isPending}
              block
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const renderPreferencesTab = () => {
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
            checked={theme === 'dark'}
            onChange={handleThemeChange}
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
            checked={notificationsEnabled}
            onChange={handleNotificationsChange}
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
            onChange={handleDefaultTimeRangeChange}
            style={{ width: 200 }}
          >
            <Option value="15m">Last 15 minutes</Option>
            <Option value="30m">Last 30 minutes</Option>
            <Option value="1h">Last 1 hour</Option>
            <Option value="3h">Last 3 hours</Option>
            <Option value="6h">Last 6 hours</Option>
            <Option value="12h">Last 12 hours</Option>
            <Option value="24h">Last 24 hours</Option>
            <Option value="7d">Last 7 days</Option>
          </Select>
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
            onChange={handleDefaultPageSizeChange}
            style={{ width: 200 }}
          >
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
            <Option value={50}>50</Option>
            <Option value={100}>100</Option>
          </Select>
        </div>
      </Card>
    );
  };

  const renderTeamTab = () => {
    if (profileLoading) {
      return (
        <div className="settings-loading">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <Card className="settings-card">
        <div className="team-header">
          <Users size={24} />
          <h3>Team Information</h3>
        </div>

        <Divider />

        <Descriptions column={1} bordered>
          {profile?.teams?.map((team, index) => (
            <Descriptions.Item key={index} label={`Team ${index + 1}`}>
              <div className="team-info">
                <div className="team-main">
                  <span className="team-name">{team.name}</span>
                  {team.apiKey && (
                    <span className="team-api-key">
                      <Key size={14} />
                      {team.apiKey}
                    </span>
                  )}
                </div>
                <span className="team-role">{team.role}</span>
              </div>
            </Descriptions.Item>
          ))}
        </Descriptions>

        {(!profile?.teams || profile.teams.length === 0) && (
          <p className="no-teams">You are not a member of any teams yet.</p>
        )}
      </Card>
    );
  };

  return (
    <div className="settings-page">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs defaultActiveKey="profile" className="settings-tabs">
        <TabPane
          tab={
            <span className="tab-label">
              <User size={16} />
              Profile
            </span>
          }
          key="profile"
        >
          {renderProfileTab()}
        </TabPane>

        <TabPane
          tab={
            <span className="tab-label">
              <Palette size={16} />
              Preferences
            </span>
          }
          key="preferences"
        >
          {renderPreferencesTab()}
        </TabPane>

        <TabPane
          tab={
            <span className="tab-label">
              <Users size={16} />
              Team
            </span>
          }
          key="team"
        >
          {renderTeamTab()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
