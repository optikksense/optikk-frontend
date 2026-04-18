export const SERVICE_TOPOLOGY_STYLES = `
  .react-flow__controls {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    margin: 16px !important;
  }

  .react-flow__controls-button {
    background: var(--bg-card);
    color: var(--text-secondary);
    border: none !important;
    border-bottom: 1px solid var(--border-color) !important;
    width: 28px !important;
    height: 28px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-colors);
  }

  .react-flow__controls-button:last-child {
    border-bottom: none !important;
  }

  .react-flow__controls-button:hover {
    background: var(--bg-hover) !important;
    color: var(--text-primary) !important;
  }

  .react-flow__controls-button svg {
    fill: currentColor;
    width: 14px;
    height: 14px;
  }

  .react-flow__minimap {
    background-color: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    box-shadow: var(--shadow-lg) !important;
    margin: 16px !important;
  }

  .react-flow__minimap-mask {
    fill: rgba(0, 0, 0, 0.45) !important;
  }
`;
