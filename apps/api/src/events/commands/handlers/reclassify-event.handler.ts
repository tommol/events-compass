import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EventClassifyRequestedEvent } from '../../events/event-classify-requested.event';
import { EventsRepository } from '../../repository/events.repository';
import { ReclassifyEventCommand } from '../reclassify-event.command';

@CommandHandler(ReclassifyEventCommand)
export class ReclassifyEventCommandHandler implements ICommandHandler<ReclassifyEventCommand> {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReclassifyEventCommand): Promise<void> {
    const event = await this.eventsRepository.findBySlug(command.slug, false);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    this.eventBus.publish(new EventClassifyRequestedEvent(event.id));
  }
}
