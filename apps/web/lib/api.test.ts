import {
  createEvent,
  fetchHealthStatus,
  getEventBySlug,
  getEventByToken,
  requestEditToken,
  searchEvents,
  updateEvent,
} from './api';

describe('api', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  describe('fetchHealthStatus', () => {
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

  describe('events endpoints', () => {
    it('returns event by slug on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'evt-1',
          name: 'Frontend Meetup',
          slug: 'frontend-meetup',
          city: 'Warsaw',
        }),
      } as Response);

      await expect(getEventBySlug('frontend-meetup')).resolves.toEqual({
        ok: true,
        status: 200,
        data: {
          id: 'evt-1',
          name: 'Frontend Meetup',
          slug: 'frontend-meetup',
          city: 'Warsaw',
          description: undefined,
          country: undefined,
          region: undefined,
          postalCode: undefined,
          address: undefined,
          venue: undefined,
          startAt: undefined,
          endAt: undefined,
        },
      });
    });

    it('returns error result when event by token is not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          message: 'Event not found or token expired',
        }),
      } as Response);

      await expect(getEventByToken('missing')).resolves.toEqual({
        ok: false,
        status: 404,
        error: 'Event not found or token expired',
      });
    });

    it('returns success result for requestEditToken when API responds 204', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
      } as Response);

      await expect(requestEditToken('frontend-meetup', { email: 'owner@example.com' })).resolves.toEqual({
        ok: true,
        status: 204,
        data: null,
      });
    });

    it('creates event using create endpoint', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          id: 'evt-2',
          name: 'Backend Meetup',
          slug: 'backend-meetup',
          description: 'API discussions',
        }),
      } as Response);

      await expect(
        createEvent({
          name: 'Backend Meetup',
          email: 'organizer@example.com',
          description: 'API discussions',
        }),
      ).resolves.toEqual({
        ok: true,
        status: 201,
        data: {
          id: 'evt-2',
          name: 'Backend Meetup',
          slug: 'backend-meetup',
          description: 'API discussions',
          country: undefined,
          city: undefined,
          region: undefined,
          postalCode: undefined,
          address: undefined,
          venue: undefined,
          startAt: undefined,
          endAt: undefined,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/events',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Backend Meetup',
            email: 'organizer@example.com',
            description: 'API discussions',
          }),
        }),
      );
    });

    it('sends token in body when updating event', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'evt-1',
          name: 'Frontend Meetup',
          slug: 'frontend-meetup',
          description: 'Updated',
        }),
      } as Response);

      await expect(
        updateEvent('frontend-meetup', 'token-hash-1', {
          description: 'Updated',
        }),
      ).resolves.toEqual({
        ok: true,
        status: 200,
        data: {
          id: 'evt-1',
          name: 'Frontend Meetup',
          slug: 'frontend-meetup',
          description: 'Updated',
          country: undefined,
          city: undefined,
          region: undefined,
          postalCode: undefined,
          address: undefined,
          venue: undefined,
          startAt: undefined,
          endAt: undefined,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/events/frontend-meetup',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            token: 'token-hash-1',
            description: 'Updated',
          }),
        }),
      );
    });

    it('searches events with query params and maps list response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 'evt-10',
            name: 'Frontend Meetup Warsaw',
            slug: 'frontend-meetup-warsaw',
            city: 'Warsaw',
          },
        ]),
      } as Response);

      await expect(searchEvents('frontend', 2, 5)).resolves.toEqual({
        ok: true,
        status: 200,
        data: [
          {
            id: 'evt-10',
            name: 'Frontend Meetup Warsaw',
            slug: 'frontend-meetup-warsaw',
            city: 'Warsaw',
            description: undefined,
            country: undefined,
            region: undefined,
            postalCode: undefined,
            address: undefined,
            venue: undefined,
            startAt: undefined,
            endAt: undefined,
          },
        ],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/events/search?q=frontend&page=2&limit=5',
        expect.any(Object),
      );
    });
  });
});
