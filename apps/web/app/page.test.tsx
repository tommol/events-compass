import { render, screen } from '@testing-library/react';

import HomePage from './page';

jest.mock('../lib/api', () => ({
  fetchHealthStatus: jest.fn().mockResolvedValue({
    status: 'ok',
    service: 'api',
    database: 'up',
    timestamp: '2026-01-01T12:00:00.000Z',
  }),
}));

describe('HomePage', () => {
  it('renders backend health data', async () => {
    const element = await HomePage();
    render(element);

    expect(screen.getByRole('heading', { name: 'Events Compass' })).toBeInTheDocument();
    expect(screen.getByText('status: ok')).toBeInTheDocument();
    expect(screen.getByText('database: up')).toBeInTheDocument();
  });
});
