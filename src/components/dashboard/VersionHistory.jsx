import { useState } from 'react';
import { Drawer, Timeline, Button, Space, Spin, Empty, Modal, Tag } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { History, RotateCcw, GitCompare } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import YamlDiffViewer from './YamlDiffViewer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Drawer showing version history for a dashboard page.
 * Supports viewing diffs between versions and rolling back.
 */
export default function VersionHistory({ open, pageId, currentYaml, onClose, onRollback }) {
  const { selectedTeamId } = useAppStore();
  const queryClient = useQueryClient();
  const [diffModal, setDiffModal] = useState(null); // { version, yaml }
  const [comparing, setComparing] = useState(false);

  // Fetch version list
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-versions', selectedTeamId, pageId],
    queryFn: () => v1Service.listDashboardConfigVersions(selectedTeamId, pageId),
    enabled: !!open && !!selectedTeamId && !!pageId,
    staleTime: 30_000,
  });

  const versions = data?.versions || [];

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: (version) => v1Service.rollbackDashboardConfig(selectedTeamId, pageId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-config', selectedTeamId, pageId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-versions', selectedTeamId, pageId] });
      onRollback?.();
      onClose();
    },
  });

  const handleViewDiff = async (version) => {
    setComparing(true);
    try {
      const result = await v1Service.getDashboardConfigVersion(selectedTeamId, pageId, version);
      setDiffModal({ version, yaml: result?.configYaml || '' });
    } catch (err) {
      console.error('Failed to load version:', err);
    } finally {
      setComparing(false);
    }
  };

  const handleRollback = (version) => {
    Modal.confirm({
      title: `Rollback to version ${version}?`,
      content: 'This will replace the current dashboard configuration with the selected version. A new version entry will be created for the rollback.',
      okText: 'Rollback',
      okType: 'danger',
      onOk: () => rollbackMutation.mutateAsync(version),
    });
  };

  return (
    <>
      <Drawer
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={16} />
            Version History
          </span>
        }
        open={open}
        onClose={onClose}
        width={400}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : versions.length === 0 ? (
          <Empty description="No version history yet. Save the dashboard to create the first version." />
        ) : (
          <Timeline
            items={versions.map((v) => ({
              key: v.version,
              color: v.changeSummary?.includes('Rolled back') ? 'orange' : 'blue',
              children: (
                <div className="version-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Tag color="blue" style={{ margin: 0 }}>v{v.version}</Tag>
                    <span style={{ fontSize: 12, color: 'var(--text-muted, #888)' }}>
                      {v.createdAt ? dayjs(v.createdAt).fromNow() : ''}
                    </span>
                  </div>
                  {v.changeSummary && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary, #a0a0b0)', marginBottom: 4 }}>
                      {v.changeSummary}
                    </div>
                  )}
                  {v.createdBy && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted, #666)', marginBottom: 6 }}>
                      by {v.createdBy}
                    </div>
                  )}
                  <Space size="small">
                    <Button
                      size="small"
                      icon={<GitCompare size={12} />}
                      onClick={() => handleViewDiff(v.version)}
                      loading={comparing}
                    >
                      Diff
                    </Button>
                    <Button
                      size="small"
                      icon={<RotateCcw size={12} />}
                      onClick={() => handleRollback(v.version)}
                      loading={rollbackMutation.isPending}
                    >
                      Rollback
                    </Button>
                  </Space>
                </div>
              ),
            }))}
          />
        )}
      </Drawer>

      {/* Diff Modal */}
      <Modal
        title={`Diff: Current vs Version ${diffModal?.version}`}
        open={!!diffModal}
        onCancel={() => setDiffModal(null)}
        footer={
          <Space>
            <Button onClick={() => setDiffModal(null)}>Close</Button>
            <Button
              type="primary"
              danger
              icon={<RotateCcw size={12} />}
              onClick={() => {
                setDiffModal(null);
                handleRollback(diffModal.version);
              }}
            >
              Rollback to this version
            </Button>
          </Space>
        }
        width={800}
        destroyOnClose
      >
        {diffModal && (
          <YamlDiffViewer
            oldYaml={diffModal.yaml}
            newYaml={currentYaml || ''}
            title={`Version ${diffModal.version} → Current`}
          />
        )}
      </Modal>
    </>
  );
}
