import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  EventWithDetail,
  EventsRepository,
} from "../../repository/events.repository";
import { UpdateEventStatusCommand } from "../update-event-status.command";

@CommandHandler(UpdateEventStatusCommand)
export class UpdateEventStatusCommandHandler implements ICommandHandler<UpdateEventStatusCommand> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(command: UpdateEventStatusCommand): Promise<EventWithDetail> {
    const { slug, status } = command;

    const existingEvent = await this.eventsRepository.existsBySlug(slug);
    if (!existingEvent) {
      throw new NotFoundException("Event not found");
    }

    return this.eventsRepository.updateBySlug(slug, { status }, {});
  }
}
