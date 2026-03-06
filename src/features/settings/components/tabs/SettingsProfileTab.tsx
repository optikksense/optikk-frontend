import { Avatar, Button, Card, Divider, Form, Input, Spin } from 'antd';
import { Bell, User } from 'lucide-react';
import type { FormInstance } from 'antd/es/form';

interface SettingsProfileTabProps {
  profileLoading: boolean;
  profile: Record<string, any> | null;
  profileForm: FormInstance;
  isSaving: boolean;
  getInitials: (name: string) => string;
  onSubmit: (values: any) => void;
}

/**
 * Profile tab content for settings page.
 */
export default function SettingsProfileTab({
  profileLoading,
  profile,
  profileForm,
  isSaving,
  getInitials,
  onSubmit,
}: SettingsProfileTabProps): JSX.Element {
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
          {getInitials(profile?.name || '')}
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
        onFinish={onSubmit}
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
            data-testid="settings-save-profile"
            type="primary"
            htmlType="submit"
            loading={isSaving}
            block
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

