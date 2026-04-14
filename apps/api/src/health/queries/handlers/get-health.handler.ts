import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ServiceUnavailableException } from '@nestjs/common';
import type { HealthResponse } from '@events-compass/shared';

import { PrismaService } from '../../../prisma/prisma.service';
import { GetHealthQuery } from '../get-health.query';

@QueryHandler(GetHealthQuery)
export class GetHealthHandler implements IQueryHandler<GetHealthQuery, HealthResponse> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        service: 'api',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'ok',
        service: 'api',
        database: 'down',
        timestamp: new Date().toISOString(),
      } satisfies HealthResponse);
    }
  }
}
