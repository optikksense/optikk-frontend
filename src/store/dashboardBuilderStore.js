import { create } from 'zustand';
import { produce } from 'immer';

export const useDashboardBuilderStore = create((set, get) => ({
  isEditMode: false,
  dirtyConfig: null,
  originalConfig: null,
  undoStack: [],
  selectedPanelId: null,
  panelEditorOpen: false,

  enterEditMode: (config) => {
    set({
      isEditMode: true,
      originalConfig: structuredClone(config),
      dirtyConfig: structuredClone(config),
      undoStack: [],
      selectedPanelId: null,
      panelEditorOpen: false,
    });
  },

  exitEditMode: () => {
    set({
      isEditMode: false,
      dirtyConfig: null,
      originalConfig: null,
      undoStack: [],
      selectedPanelId: null,
      panelEditorOpen: false,
    });
  },

  /** Push current state to undo stack before making a change. */
  _pushUndo: () => {
    const { dirtyConfig, undoStack } = get();
    if (!dirtyConfig) return;
    set({ undoStack: [...undoStack.slice(-29), structuredClone(dirtyConfig)] });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({ dirtyConfig: prev, undoStack: undoStack.slice(0, -1) });
  },

  /** Update chart positions from react-grid-layout onLayoutChange callback. */
  updateLayout: (layoutItems) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig?.charts) return;
      const posMap = {};
      for (const item of layoutItems) {
        posMap[item.i] = { x: item.x, y: item.y, w: item.w, h: item.h };
      }
      // Update each chart's layout and store grid position for ordering
      for (const chart of state.dirtyConfig.charts) {
        const pos = posMap[chart.id];
        if (pos) {
          if (!chart.layout) chart.layout = {};
          chart.layout.col = pos.w;
          chart.layout.row = pos.h;
          chart._gridX = pos.x;
          chart._gridY = pos.y;
        }
      }
      // Sort charts by grid position (top-to-bottom, left-to-right)
      state.dirtyConfig.charts.sort((a, b) => {
        const ay = a._gridY ?? 0, by = b._gridY ?? 0;
        if (ay !== by) return ay - by;
        return (a._gridX ?? 0) - (b._gridX ?? 0);
      });
    }));
  },

  addPanel: (panelConfig) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig) return;
      if (!state.dirtyConfig.charts) state.dirtyConfig.charts = [];
      state.dirtyConfig.charts.push(panelConfig);
    }));
  },

  removePanel: (panelId) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig?.charts) return;
      state.dirtyConfig.charts = state.dirtyConfig.charts.filter((c) => c.id !== panelId);
    }));
  },

  updatePanelConfig: (panelId, partial) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig?.charts) return;
      const idx = state.dirtyConfig.charts.findIndex((c) => c.id === panelId);
      if (idx === -1) return;
      Object.assign(state.dirtyConfig.charts[idx], partial);
    }));
  },

  openPanelEditor: (panelId) => {
    set({ selectedPanelId: panelId, panelEditorOpen: true });
  },

  closePanelEditor: () => {
    set({ selectedPanelId: null, panelEditorOpen: false });
  },

  updateDashboardMeta: (updates) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig) return;
      Object.assign(state.dirtyConfig, updates);
    }));
  },

  updateDataSources: (dataSources) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig) return;
      state.dirtyConfig.dataSources = dataSources;
    }));
  },

  updateVariables: (variables) => {
    get()._pushUndo();
    set(produce((state) => {
      if (!state.dirtyConfig) return;
      state.dirtyConfig.variables = variables;
    }));
  },

  isDirty: () => {
    const { dirtyConfig, originalConfig } = get();
    return JSON.stringify(dirtyConfig) !== JSON.stringify(originalConfig);
  },
}));
