import { QueryBus } from '@nestjs/cqrs';

import { HealthController } from './health.controller';
import { GetHealthQuery } from './queries/get-health.query';

describe('HealthController', () => {
  it('dispatches a health query and returns the handler response', async () => {
    const queryBus = {
      execute: jest.fn().mockResolvedValue({
        status: 'ok',
        service: 'api',
        database: 'up',
        timestamp: '2026-04-14T10:00:00.000Z',
      }),
    };

    const controller = new HealthController(queryBus as unknown as QueryBus);
    const result = await controller.getHealth();

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetHealthQuery));
    expect(result).toEqual({
      status: 'ok',
      service: 'api',
      database: 'up',
      timestamp: '2026-04-14T10:00:00.000Z',
    });
  });
});