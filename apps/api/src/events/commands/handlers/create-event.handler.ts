import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateEventCommand } from "../create-event.command";
import { EventsRepository } from "../../repository/events.repository";
import { Event as EventEntity, Prisma } from "@prisma/client";

@CommandHandler(CreateEventCommand)
export class CreateEventCommandHandler implements ICommandHandler<CreateEventCommand> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(command: CreateEventCommand): Promise<EventEntity> {
    const { title, authorEmail, description } = command;

    const entity: Prisma.EventCreateInput = {
      name: title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      author: {
        connectOrCreate: {
          where: {
            email: authorEmail,
          },
          create: {
            email: authorEmail,
          },
        },
      },
      description: description,
    };
    const event = await this.eventsRepository.save(entity);
    return event;
  }
}
