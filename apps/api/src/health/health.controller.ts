import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import type { HealthResponse } from '@events-compass/shared';

import { GetHealthQuery } from './queries/get-health.query';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get API and database health status' })
  @ApiOkResponse({
    description: 'Health status payload',
    schema: {
      example: {
        status: 'ok',
        service: 'api',
        database: 'up',
        timestamp: '2026-01-01T12:00:00.000Z',
      },
    },
  })
  async getHealth(): Promise<HealthResponse> {
    return this.queryBus.execute(new GetHealthQuery());
  }
}
