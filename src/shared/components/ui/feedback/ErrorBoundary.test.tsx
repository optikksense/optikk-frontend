import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ErrorBoundary from './ErrorBoundary';

function Boom(): JSX.Element {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows error details and boundary name in development mode', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary showDetails boundaryName="route:test-dashboard">
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error: kaboom')).toBeInTheDocument();
    expect(screen.getByText('Boundary: route:test-dashboard')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error Boundary caught an error [route:test-dashboard]:',
      expect.any(Error),
      expect.anything(),
    );
  });
});
