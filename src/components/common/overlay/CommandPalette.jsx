import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Input } from 'antd';
import {
  BarChart3, FileText, GitBranch, Layers, Network, Bell,
  Server, Settings, Activity, RefreshCw, Sun, Search,
} from 'lucide-react';
import { useAppStore } from '@store/appStore';
import './CommandPalette.css';

const COMMANDS = [
  { id: 'overview', label: 'Go to Overview', icon: Activity, path: '/overview', group: 'Navigate' },
  { id: 'metrics', label: 'Go to Metrics', icon: BarChart3, path: '/metrics', group: 'Navigate' },
  { id: 'logs', label: 'Go to Logs', icon: FileText, path: '/logs', group: 'Navigate' },
{ id: 'traces', label: 'Go to Traces', icon: GitBranch, path: '/traces', group: 'Navigate' },
  { id: 'services', label: 'Go to Services', icon: Layers, path: '/services', group: 'Navigate' },
  { id: 'service-map', label: 'Go to Service Map', icon: Network, path: '/service-map', group: 'Navigate' },
  { id: 'errors', label: 'Go to Errors', icon: Activity, path: '/overview?tab=errors', group: 'Navigate' },
  { id: 'alerts', label: 'Go to Alerts', icon: Bell, path: '/alerts', group: 'Navigate' },
  { id: 'incidents', label: 'Go to Incidents', icon: Bell, path: '/alerts?tab=incidents', group: 'Navigate' },
  { id: 'infrastructure', label: 'Go to Infrastructure', icon: Server, path: '/infrastructure', group: 'Navigate' },
  { id: 'deployments', label: 'Go to Deployments', icon: Server, path: '/infrastructure?tab=deployments', group: 'Navigate' },
  { id: 'health-checks', label: 'Go to Health Checks', icon: Server, path: '/infrastructure?tab=health-checks', group: 'Navigate' },
  { id: 'latency', label: 'Go to Latency', icon: BarChart3, path: '/metrics?tab=latency', group: 'Navigate' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, path: '/settings', group: 'Navigate' },
  { id: 'refresh', label: 'Refresh Data', icon: RefreshCw, action: 'refresh', group: 'Actions' },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: Sun, action: 'toggleTheme', group: 'Actions' },
];

export default function CommandPalette({ open, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { triggerRefresh, theme, setTheme } = useAppStore();

  const filtered = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const executeCommand = useCallback((cmd) => {
    if (cmd.path) {
      navigate(cmd.path);
    } else if (cmd.action === 'refresh') {
      triggerRefresh();
    } else if (cmd.action === 'toggleTheme') {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
    onClose();
    setSearch('');
    setSelectedIndex(0);
  }, [navigate, onClose, triggerRefresh, theme, setTheme]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      executeCommand(filtered[selectedIndex]);
    }
  };

  const groups = [...new Set(filtered.map((c) => c.group))];

  return (
    <Modal
      open={open}
      onCancel={() => { onClose(); setSearch(''); }}
      footer={null}
      closable={false}
      className="command-palette-modal"
      width={560}
      centered
    >
      <div className="command-palette">
        <div className="command-palette-input-wrapper">
          <Search size={16} className="command-palette-search-icon" />
          <Input
            ref={inputRef}
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="borderless"
            className="command-palette-input"
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        <div className="command-palette-results">
          {groups.map((group) => (
            <div key={group} className="command-palette-group">
              <div className="command-palette-group-label">{group}</div>
              {filtered
                .filter((cmd) => cmd.group === group)
                .map((cmd) => {
                  const globalIndex = filtered.indexOf(cmd);
                  const Icon = cmd.icon;
                  return (
                    <div
                      key={cmd.id}
                      className={`command-palette-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <Icon size={16} />
                      <span>{cmd.label}</span>
                    </div>
                  );
                })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="command-palette-empty">No commands found</div>
          )}
        </div>

        <div className="command-palette-footer">
          <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> Navigate</span>
          <span><kbd>&crarr;</kbd> Select</span>
          <span><kbd>esc</kbd> Close</span>
        </div>
      </div>
    </Modal>
  );
}
