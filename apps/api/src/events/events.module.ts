import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { EventsRepository } from './repository/events.repository';
import { QueryHandlers } from './queries/handlers';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscoveryModule } from '../discovery/discovery.module';

@Module({
  imports: [CqrsModule, PrismaModule, DiscoveryModule],
  controllers: [EventsController],
  providers: [EventsRepository, ...CommandHandlers, ...QueryHandlers],
})
export class EventsModule {}
