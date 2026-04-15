import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createE2eApp } from './helpers/create-e2e-app';
import {
  createEventsPrismaMock,
  type EventsPrismaMock,
} from './helpers/create-events-prisma-mock';

describe('Events E2E', () => {
  let app: INestApplication;
  let prismaMock: EventsPrismaMock;

  beforeAll(async () => {
    prismaMock = createEventsPrismaMock();
    app = await createE2eApp(prismaMock);
  });

  afterAll(async () => {
    await app.close();
  });

  const createEvent = async (suffix: string = '') => {
    const eventName = suffix
      ? `Frontend Masters Meetup Warsaw ${suffix}`
      : 'Frontend Masters Meetup Warsaw';

    const response = await request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        name: eventName,
        email: 'organizer@example.com',
        description: 'An evening meetup about modern frontend architecture.',
      })
      .expect(201);

    return response.body as {
      id: string;
      name: string;
      slug: string;
      description: string;
    };
  };

  it('/api/v1/events (POST)', async () => {
    const created = await createEvent();

    expect(created).toEqual({
      id: 'evt-1',
      name: 'Frontend Masters Meetup Warsaw',
      slug: 'frontend-masters-meetup-warsaw',
      description: 'An evening meetup about modern frontend architecture.',
    });
  });

  it('/api/v1/events/:slug (GET) and /api/v1/events (GET)', async () => {
    const created = await createEvent('GET');

    const getBySlugResponse = await request(app.getHttpServer())
      .get(`/api/v1/events/${created.slug}`)
      .expect(200);

    expect(getBySlugResponse.body).toEqual({
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
    });

    const getListResponse = await request(app.getHttpServer())
      .get('/api/v1/events?page=1&limit=10')
      .expect(200);

    expect(getListResponse.body).toEqual(
      expect.arrayContaining([
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description,
        },
      ]),
    );
  });

  it('/api/v1/events/search (GET) returns case-insensitive matches and supports pagination', async () => {
    await createEvent('UniqueSearch One');
    await createEvent('UniqueSearch Two');
    await createEvent('UniqueSearch Three');

    const firstPage = await request(app.getHttpServer())
      .get('/api/v1/events/search?q=uniquesearch&page=1&limit=2')
      .expect(200);

    expect(firstPage.body).toHaveLength(2);

    const secondPage = await request(app.getHttpServer())
      .get('/api/v1/events/search?q=UNIQUESEARCH&page=2&limit=2')
      .expect(200);

    expect(secondPage.body).toHaveLength(1);
  });

  it('/api/v1/events/search (GET) validates query params and returns empty list for no matches', async () => {
    const emptyResult = await request(app.getHttpServer())
      .get('/api/v1/events/search?q=missing-event&page=1&limit=10')
      .expect(200);

    expect(emptyResult.body).toEqual([]);

    await request(app.getHttpServer())
      .get('/api/v1/events/search?q=&page=1&limit=10')
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/events/search?q=frontend&page=0&limit=10')
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/v1/events/search?q=frontend&page=1&limit=101')
      .expect(400);
  });

  it('/api/v1/events/:slug (PUT) rejects invalid payload when token is missing and rejects id in body', async () => {
    const created = await createEvent('PUT');

    await request(app.getHttpServer())
      .put(`/api/v1/events/${created.slug}`)
      .send({
        description: 'Updated event description',
      })
      .expect(400);

    await request(app.getHttpServer())
      .put(`/api/v1/events/${created.slug}`)
      .send({ id: created.id })
      .expect(400);
  });

  it('/api/v1/events/:slug/status (PUT) updates status and rejects invalid status', async () => {
    const created = await createEvent('STATUS');

    const updateStatusResponse = await request(app.getHttpServer())
      .put(`/api/v1/events/${created.slug}/status`)
      .send({ status: 'archived' })
      .expect(200);

    expect(updateStatusResponse.body).toEqual({
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
    });

    await request(app.getHttpServer())
      .put(`/api/v1/events/${created.slug}/status`)
      .send({ status: 'draft' })
      .expect(400);
  });

  it('/api/v1/events/:slug returns 404 for unknown event', async () => {
    await request(app.getHttpServer()).get('/api/v1/events/missing').expect(404);
  });
});
