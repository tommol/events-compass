import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  EventWithDetail,
  EventsRepository,
  UpdateEventData,
  UpdateEventDetailsData,
} from "../../repository/events.repository";
import { UpdateEventDetailsCommand } from "../update-event-details.command";
import { ForbiddenException } from "@nestjs/common";

@CommandHandler(UpdateEventDetailsCommand)
export class UpdateEventDetailsCommandHandler implements ICommandHandler<UpdateEventDetailsCommand> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(command: UpdateEventDetailsCommand): Promise<EventWithDetail> {
    const {
      id,
      token,
      description,
      startAt,
      endAt,
      country,
      city,
      region,
      postalCode,
      address,
      venue,
    } = command;

    const editToken = await this.eventsRepository.findValidEditToken(token);
    if (!editToken) {
      throw new ForbiddenException("Invalid or expired edit token");
    }

    if (editToken.eventId !== id) {
      throw new ForbiddenException("Edit token does not match event");
    }

    if (editToken.userId !== editToken.event.authorId) {
      throw new ForbiddenException("Edit token is not valid for event owner");
    }

    const entity: UpdateEventData = {
      description: description,
    };

    const details: UpdateEventDetailsData = {
      startAt: startAt,
      endsAt: endAt,
      country: country,
      city: city,
      region: region,
      postalCode: postalCode,
      address: address,
      venue: venue,
    };

    const event = await this.eventsRepository.update(id, entity, details);
    await this.eventsRepository.invalidateEditToken(token);
    return event;
  }
}
