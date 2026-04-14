import { fetchHealthStatus } from './api';

describe('fetchHealthStatus', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('returns payload when API responds with ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
        service: 'api',
        database: 'up',
        timestamp: '2026-01-01T12:00:00.000Z',
      }),
    } as Response);

    await expect(fetchHealthStatus()).resolves.toEqual({
      status: 'ok',
      service: 'api',
      database: 'up',
      timestamp: '2026-01-01T12:00:00.000Z',
    });
  });

  it('returns null for non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    } as Response);

    await expect(fetchHealthStatus()).resolves.toBeNull();
  });
});
