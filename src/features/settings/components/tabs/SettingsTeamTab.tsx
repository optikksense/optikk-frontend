import { Card, Descriptions, Divider, Spin } from 'antd';
import { Key, Users } from 'lucide-react';

interface TeamInfo {
  name?: string;
  apiKey?: string;
  role?: string;
}

interface SettingsTeamTabProps {
  profileLoading: boolean;
  teams: TeamInfo[];
}

/**
 * Team tab content for settings page.
 */
export default function SettingsTeamTab({
  profileLoading,
  teams,
}: SettingsTeamTabProps): JSX.Element {
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
        {teams.map((team, index) => (
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

      {teams.length === 0 && (
        <p className="no-teams">You are not a member of any teams yet.</p>
      )}
    </Card>
  );
}

