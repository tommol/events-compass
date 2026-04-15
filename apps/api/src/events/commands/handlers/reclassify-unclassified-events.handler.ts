import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EventClassifyRequestedEvent } from '../../events/event-classify-requested.event';
import { EventsRepository } from '../../repository/events.repository';
import { ReclassifyUnclassifiedEventsCommand } from '../reclassify-unclassified-events.command';

@CommandHandler(ReclassifyUnclassifiedEventsCommand)
export class ReclassifyUnclassifiedEventsCommandHandler
  implements ICommandHandler<ReclassifyUnclassifiedEventsCommand, number>
{
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(_command: ReclassifyUnclassifiedEventsCommand): Promise<number> {
    const events = await this.eventsRepository.findUnclassifiedEvents();

    for (const event of events) {
      this.eventBus.publish(new EventClassifyRequestedEvent(event.id));
    }

    return events.length;
  }
}
