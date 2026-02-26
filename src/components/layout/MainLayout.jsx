import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from '../common/overlay/CommandPalette';
import { useAppStore } from '@store/appStore';
import './MainLayout.css';

const { Content } = Layout;

export default function MainLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout className={`main-content-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </Layout>
  );
}
