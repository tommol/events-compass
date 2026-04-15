import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma/prisma.module';
import { EventClassifierService } from './event-classifier.service';
import { LlmClientService } from './llm-client.service';
import { QueryInterpreterService } from './query-interpreter.service';
import { DiscoveryRepository } from './discovery.repository';
import { EventClassifyRequestedHandler } from './events/event-classify-requested.handler';

@Module({
  imports: [ConfigModule, CqrsModule, PrismaModule],
  providers: [
    LlmClientService,
    QueryInterpreterService,
    EventClassifierService,
    DiscoveryRepository,
    EventClassifyRequestedHandler,
  ],
  exports: [QueryInterpreterService, EventClassifierService],
})
export class DiscoveryModule {}
