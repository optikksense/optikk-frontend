import { useState, useMemo } from 'react';
import { Modal, Switch, Select, Button, Input, Space, message } from 'antd';
import { Copy, Link2, ExternalLink } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';

const EXPIRATION_OPTIONS = [
  { value: 0, label: 'Never expires' },
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
  { value: 168, label: '7 days' },
  { value: 720, label: '30 days' },
];

/**
 * Modal for sharing a dashboard with optional time range and variable baking.
 */
export default function ShareDashboardModal({ open, pageId, templateVariables, onClose }) {
  const { selectedTeamId, timeRange } = useAppStore();
  const [includeTimeRange, setIncludeTimeRange] = useState(true);
  const [includeVariables, setIncludeVariables] = useState(true);
  const [expiresInHours, setExpiresInHours] = useState(0);
  const [shareResult, setShareResult] = useState(null);
  const [mode, setMode] = useState('url'); // 'url' or 'shortlink'

  // Build URL params based on current settings
  const urlParams = useMemo(() => {
    const params = new URLSearchParams();

    if (includeTimeRange && timeRange) {
      const now = Date.now();
      const minutes = timeRange.minutes || 60;
      params.set('t_start', String(now - minutes * 60 * 1000));
      params.set('t_end', String(now));
    }

    if (includeVariables && templateVariables?.values) {
      for (const [key, value] of Object.entries(templateVariables.values)) {
        if (value && value !== '*') {
          params.set(`var_${key}`, value);
        }
      }
    }

    return params.toString();
  }, [includeTimeRange, includeVariables, timeRange, templateVariables]);

  const shareUrl = useMemo(() => {
    const base = window.location.origin;
    const path = window.location.pathname;
    return urlParams ? `${base}${path}?${urlParams}` : `${base}${path}`;
  }, [urlParams]);

  // Short link mutation
  const createShareMutation = useMutation({
    mutationFn: () => {
      const params = {};
      if (includeTimeRange && timeRange) {
        const now = Date.now();
        const minutes = timeRange.minutes || 60;
        params.startTime = String(now - minutes * 60 * 1000);
        params.endTime = String(now);
      }
      if (includeVariables && templateVariables?.values) {
        params.variables = {};
        for (const [key, value] of Object.entries(templateVariables.values)) {
          if (value && value !== '*') {
            params.variables[key] = value;
          }
        }
      }
      return v1Service.createDashboardShare(selectedTeamId, pageId, {
        params,
        expiresInHours: expiresInHours || undefined,
      });
    },
    onSuccess: (data) => {
      setShareResult(data);
    },
  });

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Link copied to clipboard');
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      message.success('Link copied to clipboard');
    }
  };

  const shortLinkUrl = shareResult
    ? `${window.location.origin}/shared/${shareResult.shareId}`
    : null;

  const displayUrl = mode === 'shortlink' && shortLinkUrl ? shortLinkUrl : shareUrl;

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link2 size={16} />
          Share Dashboard
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Include current time range</span>
            <Switch checked={includeTimeRange} onChange={setIncludeTimeRange} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Include template variables</span>
            <Switch
              checked={includeVariables}
              onChange={setIncludeVariables}
              disabled={!templateVariables?.values || Object.keys(templateVariables.values).length === 0}
            />
          </label>
        </div>

        {/* Sharing mode */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type={mode === 'url' ? 'primary' : 'default'}
            size="small"
            onClick={() => setMode('url')}
          >
            URL Parameters
          </Button>
          <Button
            type={mode === 'shortlink' ? 'primary' : 'default'}
            size="small"
            onClick={() => {
              setMode('shortlink');
              if (!shareResult) {
                createShareMutation.mutate();
              }
            }}
          >
            Short Link
          </Button>
        </div>

        {mode === 'shortlink' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted, #888)' }}>Expiration:</span>
            <Select
              size="small"
              value={expiresInHours}
              onChange={(v) => {
                setExpiresInHours(v);
                setShareResult(null); // Need to recreate
              }}
              options={EXPIRATION_OPTIONS}
              style={{ width: 160 }}
            />
          </div>
        )}

        {/* Generated URL */}
        <div>
          <Input.Group compact style={{ display: 'flex' }}>
            <Input
              value={mode === 'shortlink' && !shortLinkUrl ? 'Generating...' : displayUrl}
              readOnly
              style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}
            />
            <Button
              icon={<Copy size={14} />}
              onClick={() => handleCopy(displayUrl)}
              disabled={mode === 'shortlink' && !shortLinkUrl}
            >
              Copy
            </Button>
          </Input.Group>
        </div>

        {/* Open in new tab */}
        <Button
          type="link"
          icon={<ExternalLink size={14} />}
          onClick={() => window.open(displayUrl, '_blank')}
          style={{ alignSelf: 'flex-start', padding: 0 }}
        >
          Open in new tab
        </Button>
      </div>
    </Modal>
  );
}
