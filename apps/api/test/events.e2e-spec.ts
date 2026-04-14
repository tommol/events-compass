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

  const createEvent = async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        name: 'Frontend Masters Meetup Warsaw',
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

  it('/api/v1/events/:id (GET) and /api/v1/events (GET)', async () => {
    const created = await createEvent();

    const getByIdResponse = await request(app.getHttpServer())
      .get(`/api/v1/events/${created.id}`)
      .expect(200);

    expect(getByIdResponse.body).toEqual({
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

  it('/api/v1/events/:id (PUT) updates details and rejects id in body', async () => {
    const created = await createEvent();

    const updateResponse = await request(app.getHttpServer())
      .put(`/api/v1/events/${created.id}`)
      .send({
        description: 'Updated event description',
        country: 'Poland',
        city: 'Warsaw',
        region: 'Mazowieckie',
        postalCode: '00-001',
        address: 'Marszalkowska 1',
        venue: 'PGE Narodowy',
        startAt: '2026-06-15T18:00:00.000Z',
        endAt: '2026-06-15T22:00:00.000Z',
      })
      .expect(200);

    expect(updateResponse.body).toEqual({
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: 'Updated event description',
      country: 'Poland',
      city: 'Warsaw',
      region: 'Mazowieckie',
      postalCode: '00-001',
      address: 'Marszalkowska 1',
      venue: 'PGE Narodowy',
      startAt: '2026-06-15T18:00:00.000Z',
      endAt: '2026-06-15T22:00:00.000Z',
    });

    await request(app.getHttpServer())
      .put(`/api/v1/events/${created.id}`)
      .send({ id: created.id })
      .expect(400);
  });

  it('/api/v1/events/:id/status (PUT) updates status and rejects invalid status', async () => {
    const created = await createEvent();

    const updateStatusResponse = await request(app.getHttpServer())
      .put(`/api/v1/events/${created.id}/status`)
      .send({ status: 'archived' })
      .expect(200);

    expect(updateStatusResponse.body).toEqual({
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
    });

    await request(app.getHttpServer())
      .put(`/api/v1/events/${created.id}/status`)
      .send({ status: 'draft' })
      .expect(400);
  });

  it('/api/v1/events/:id returns 404 for unknown event', async () => {
    await request(app.getHttpServer()).get('/api/v1/events/missing').expect(404);
  });
});
