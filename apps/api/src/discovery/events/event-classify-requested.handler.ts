import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventClassifyRequestedEvent } from '../../events/events/event-classify-requested.event';
import { EventClassifierService } from '../event-classifier.service';
import { DiscoveryRepository } from '../discovery.repository';

@EventsHandler(EventClassifyRequestedEvent)
export class EventClassifyRequestedHandler implements IEventHandler<EventClassifyRequestedEvent> {
  constructor(
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly eventClassifierService: EventClassifierService,
  ) {}

  public async handle(event: EventClassifyRequestedEvent): Promise<void> {
    const entity = await this.discoveryRepository.findEventForClassification(event.eventId);
    if (!entity) {
      return;
    }

    const allowedTagSlugs = await this.discoveryRepository.listTagSlugs();
    const classification = await this.eventClassifierService.classify(
      {
        name: entity.name,
        description: entity.description,
        city: entity.detail?.city,
        country: entity.detail?.country,
        venue: entity.detail?.venue,
      },
      allowedTagSlugs,
    );

    await this.discoveryRepository.setEventTags(entity.id, classification.tagSlugs, classification.confidence);
  }
}
