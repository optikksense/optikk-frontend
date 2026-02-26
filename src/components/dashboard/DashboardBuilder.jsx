import { useMemo, useState, useCallback, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth, getCompactor } from 'react-grid-layout';
import { Modal, Form, Input, Button as AntButton, Space as AntSpace } from 'antd';
import toast from 'react-hot-toast';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useDashboardBuilderStore } from '@store/dashboardBuilderStore';
import { ConfigurableChartCard } from '@components/dashboard/ConfigurableDashboard';
import PanelWrapper from '@components/dashboard/PanelWrapper';
import DashboardBuilderToolbar from '@components/dashboard/DashboardBuilderToolbar';
import PanelEditor from '@components/dashboard/PanelEditor';
import DataSourceEditor from '@components/dashboard/DataSourceEditor';
import TemplateVariableBar from '@components/dashboard/TemplateVariableBar';
import VariableEditor from '@components/dashboard/VariableEditor';
import { configToGridLayout, configToYaml, createEmptyPanel, generatePanelId } from '@utils/yamlHelpers';
import './DashboardBuilder.css';

const ROW_HEIGHT = 70;
const COLS = { lg: 24, md: 24, sm: 24, xs: 24 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 };
const VERTICAL_COMPACTOR = getCompactor('vertical');

/**
 * DashboardBuilder renders the YAML-configured dashboard in an editable drag-and-drop grid.
 */
export default function DashboardBuilder({
  pageId,
  dataSources = {},
  extraContext = {},
  onSave,
  onExit,
  onVersionHistory,
  onShare,
  templateVariables,
}) {
  const {
    dirtyConfig,
    undoStack,
    selectedPanelId,
    panelEditorOpen,
    updateLayout,
    addPanel,
    removePanel,
    updatePanelConfig,
    openPanelEditor,
    closePanelEditor,
    updateDashboardMeta,
    updateDataSources,
    updateVariables,
    isDirty,
    undo,
    exitEditMode,
  } = useDashboardBuilderStore();

  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(false);

  // Container width measurement for react-grid-layout v2
  const containerRef = useRef(null);
  const width = useContainerWidth(containerRef);

  const dirty = isDirty();

  // Compute react-grid-layout items from the dirty config
  const gridLayout = useMemo(
    () => configToGridLayout(dirtyConfig),
    [dirtyConfig]
  );

  // Build layout map for all breakpoints (same layout for all)
  const layouts = useMemo(() => ({
    lg: gridLayout,
    md: gridLayout,
    sm: gridLayout,
    xs: gridLayout,
  }), [gridLayout]);

  const handleLayoutChange = useCallback((layout) => {
    updateLayout(layout);
  }, [updateLayout]);

  const handleSave = async () => {
    if (!dirtyConfig) return;
    setSaving(true);
    try {
      const yamlStr = configToYaml(dirtyConfig);
      await onSave(yamlStr);
      toast.success('Dashboard saved');
      exitEditMode();
    } catch (err) {
      toast.error('Failed to save dashboard');
      console.error('Dashboard save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (dirty) {
      Modal.confirm({
        title: 'Discard changes?',
        content: 'All unsaved changes will be lost.',
        okText: 'Discard',
        okType: 'danger',
        onOk: () => {
          exitEditMode();
          onExit?.();
        },
      });
    } else {
      exitEditMode();
      onExit?.();
    }
  };

  const handleAddPanel = () => {
    addPanel(createEmptyPanel());
  };

  const handleDuplicate = (panelId) => {
    const src = dirtyConfig?.charts?.find((c) => c.id === panelId);
    if (!src) return;
    const dup = { ...structuredClone(src), id: generatePanelId(), title: `${src.title} (copy)` };
    addPanel(dup);
  };

  const handlePanelSave = (panelId, updates) => {
    updatePanelConfig(panelId, updates);
    closePanelEditor();
  };

  // The selected panel config for the editor
  const selectedPanel = useMemo(
    () => dirtyConfig?.charts?.find((c) => c.id === selectedPanelId),
    [dirtyConfig, selectedPanelId]
  );

  const handleSettingsSave = ({ title, subtitle, icon }) => {
    updateDashboardMeta({ title, subtitle, icon });
    setSettingsOpen(false);
  };

  if (!dirtyConfig) return null;

  return (
    <div className="dashboard-builder" ref={containerRef}>
      <DashboardBuilderToolbar
        isDirty={dirty}
        canUndo={undoStack.length > 0}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onAddPanel={handleAddPanel}
        onUndo={undo}
        onVersionHistory={onVersionHistory}
        onShare={onShare}
        onSettings={() => setSettingsOpen(true)}
      />

      {dirtyConfig.variables?.length > 0 && templateVariables && (
        <TemplateVariableBar
          variables={dirtyConfig.variables}
          values={templateVariables.values}
          onChange={templateVariables.setVariable}
        />
      )}

      {width > 0 && (
        <ResponsiveGridLayout
          className="builder-grid"
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          draggableHandle=".panel-drag-handle"
          onLayoutChange={handleLayoutChange}
          compactor={VERTICAL_COMPACTOR}
          isResizable
          isDraggable
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {(dirtyConfig.charts || []).map((chartConfig) => (
            <div key={chartConfig.id}>
              <PanelWrapper
                panelId={chartConfig.id}
                title={chartConfig.title}
                onEdit={openPanelEditor}
                onDelete={removePanel}
                onDuplicate={handleDuplicate}
              >
                <ConfigurableChartCard
                  chartConfig={chartConfig}
                  dataSources={dataSources}
                  extraContext={extraContext}
                />
              </PanelWrapper>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}

      {/* Panel Editor Drawer */}
      {panelEditorOpen && selectedPanel && (
        <PanelEditor
          open={panelEditorOpen}
          panelConfig={selectedPanel}
          dataSources={dirtyConfig.dataSources || []}
          onSave={(updates) => handlePanelSave(selectedPanelId, updates)}
          onCancel={closePanelEditor}
        />
      )}

      {/* Dashboard Settings Modal */}
      <Modal
        title="Dashboard Settings"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <DashboardSettingsForm
          config={dirtyConfig}
          onSave={handleSettingsSave}
          onDataSourcesChange={updateDataSources}
          onVariablesOpen={() => { setSettingsOpen(false); setVariablesOpen(true); }}
        />
      </Modal>

      {/* Variables Editor Modal */}
      <Modal
        title="Template Variables"
        open={variablesOpen}
        onCancel={() => setVariablesOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <VariableEditor
          variables={dirtyConfig.variables || []}
          onChange={updateVariables}
        />
      </Modal>
    </div>
  );
}

/** Inline dashboard settings form */
function DashboardSettingsForm({ config, onSave, onDataSourcesChange, onVariablesOpen }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSave(values);
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: config.title || '',
          subtitle: config.subtitle || '',
          icon: config.icon || '',
        }}
        onFinish={handleFinish}
      >
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Subtitle" name="subtitle">
          <Input />
        </Form.Item>
        <Form.Item label="Icon" name="icon">
          <Input placeholder="e.g. Activity, BarChart3, AlertCircle" />
        </Form.Item>
        <Form.Item>
          <AntSpace>
            <AntButton type="primary" htmlType="submit">Apply</AntButton>
            <AntButton onClick={onVariablesOpen}>Edit Variables</AntButton>
          </AntSpace>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Data Sources</h4>
        <DataSourceEditor
          dataSources={config.dataSources || []}
          onChange={onDataSourcesChange}
        />
      </div>
    </div>
  );
}
