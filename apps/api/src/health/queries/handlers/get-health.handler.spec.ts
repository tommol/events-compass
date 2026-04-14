import { ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { GetHealthHandler } from './get-health.handler';

describe('GetHealthHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-14T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns API and database status when the probe succeeds', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([1]),
    };

    const handler = new GetHealthHandler(prisma as unknown as PrismaService);

    await expect(handler.execute()).resolves.toEqual({
      status: 'ok',
      service: 'api',
      database: 'up',
      timestamp: '2026-04-14T10:00:00.000Z',
    });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('throws ServiceUnavailableException when the probe fails', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('db down')),
    };

    const handler = new GetHealthHandler(prisma as unknown as PrismaService);

    await expect(handler.execute()).rejects.toBeInstanceOf(ServiceUnavailableException);

    try {
      await handler.execute();
    } catch (error) {
      const exception = error as ServiceUnavailableException;
      expect(exception.getResponse()).toEqual({
        status: 'ok',
        service: 'api',
        database: 'down',
        timestamp: '2026-04-14T10:00:00.000Z',
      });
    }
  });
});