import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  EventWithDetail,
  EventsRepository,
  UpdateEventData,
  UpdateEventDetailsData,
} from '../../repository/events.repository';
import { UpdateEventDetailsCommand } from '../update-event-details.command';
import { ForbiddenException } from '@nestjs/common';
import { EventClassifyRequestedEvent } from '../../events/event-classify-requested.event';

@CommandHandler(UpdateEventDetailsCommand)
export class UpdateEventDetailsCommandHandler implements ICommandHandler<UpdateEventDetailsCommand> {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateEventDetailsCommand): Promise<EventWithDetail> {
    const { slug, token, description, startAt, endAt, country, city, region, postalCode, address, venue } =
      command;

    const editToken = await this.eventsRepository.findValidEditToken(token);
    if (!editToken) {
      throw new ForbiddenException('Invalid or expired edit token');
    }

    if (editToken.userId !== editToken.event.authorId) {
      throw new ForbiddenException('Edit token is not valid for event owner');
    }

    const ownedEvent = await this.eventsRepository.findBySlug(slug, false);
    if (!ownedEvent || ownedEvent.id !== editToken.eventId) {
      throw new ForbiddenException('Edit token does not match event');
    }

    const entity: UpdateEventData = {
      description,
    };

    const details: UpdateEventDetailsData = {
      startAt,
      endsAt: endAt,
      country,
      city,
      region,
      postalCode,
      address,
      venue,
    };

    const event = await this.eventsRepository.updateBySlug(slug, entity, details);
    await this.eventsRepository.invalidateEditToken(token);
    this.eventBus.publish(new EventClassifyRequestedEvent(event.id));

    return event;
  }
}
