import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useMetricsState } from './useMetricsState';

function Harness() {
  const location = useLocation();
  const {
    activeTab,
    onTabChange,
    selectedService,
    setSelectedService,
    showErrorsOnly,
    setShowErrorsOnly,
  } = useMetricsState();

  return (
    <>
      <div data-testid="active-tab">{activeTab}</div>
      <div data-testid="search">{location.search}</div>
      <div data-testid="selected-service">{selectedService ?? 'none'}</div>
      <div data-testid="errors-only">{String(showErrorsOnly)}</div>
      <button onClick={() => onTabChange('latency')}>latency</button>
      <button onClick={() => onTabChange('overview')}>overview</button>
      <button onClick={() => setSelectedService('checkout')}>service</button>
      <button onClick={() => setShowErrorsOnly(true)}>errors</button>
    </>
  );
}

describe('useMetricsState', () => {
  it('derives the initial tab from the query string', () => {
    render(
      <MemoryRouter
        initialEntries={['/metrics?tab=latency']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Harness />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('latency');
    expect(screen.getByTestId('search')).toHaveTextContent('?tab=latency');
  });

  it('updates local state and keeps the tab query param in sync', () => {
    render(
      <MemoryRouter
        initialEntries={['/metrics']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Harness />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'latency' }));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('latency');
    expect(screen.getByTestId('search')).toHaveTextContent('?tab=latency');

    fireEvent.click(screen.getByRole('button', { name: 'overview' }));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('overview');
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole('button', { name: 'service' }));
    fireEvent.click(screen.getByRole('button', { name: 'errors' }));
    expect(screen.getByTestId('selected-service')).toHaveTextContent('checkout');
    expect(screen.getByTestId('errors-only')).toHaveTextContent('true');
  });
});
