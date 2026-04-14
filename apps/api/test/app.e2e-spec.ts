import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createE2eApp } from './helpers/create-e2e-app';

describe('API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp({
      $queryRaw: jest.fn().mockResolvedValue([1]),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'api',
        database: 'up',
        timestamp: expect.any(String),
      }),
    );
  });

  it('/api/v1/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(201);

    expect(response.body).toEqual({
      accessToken: 'stub-token-user-example-com',
      expiresInSeconds: 3600,
      tokenType: 'Bearer',
    });
  });
});
