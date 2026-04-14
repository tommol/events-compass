import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  EventWithDetail,
  EventsRepository,
  UpdateEventData,
  UpdateEventDetailsData,
} from "../../repository/events.repository";
import { UpdateEventDetailsCommand } from "../update-event-details.command";
import { NotFoundException } from "@nestjs/common";

@CommandHandler(UpdateEventDetailsCommand)
export class UpdateEventDetailsCommandHandler implements ICommandHandler<UpdateEventDetailsCommand> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(command: UpdateEventDetailsCommand): Promise<EventWithDetail> {
    const {
      id,
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

    const existingEvent = await this.eventsRepository.exists(id);
    if (!existingEvent) {
      throw new NotFoundException("Event not found");
    }

    const event = await this.eventsRepository.update(id, entity, details);
    return event;
  }
}
