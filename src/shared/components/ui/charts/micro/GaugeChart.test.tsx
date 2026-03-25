import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import GaugeChart from './GaugeChart';

describe('GaugeChart', () => {
  it('renders an accessible svg gauge without css variable values in markup', () => {
    render(<GaugeChart value={92} label="Apdex" />);

    const svg = screen.getByRole('img', { name: 'Apdex' });
    expect(svg.tagName).toBe('svg');
    expect(svg.outerHTML).not.toContain('var(');
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('Apdex')).toBeInTheDocument();
  });

  it('clamps values outside the 0-100 range', () => {
    render(<GaugeChart value={120} label="Budget" />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
