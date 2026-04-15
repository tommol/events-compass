import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UpdateEventRequestCommand } from "../update-event-request.command";
import { EventsRepository } from "../../repository/events.repository";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { EditTokenRequestedEvent } from "../../events/edit-token-requested.event";

@CommandHandler(UpdateEventRequestCommand)
export class UpdateEventRequestCommandHandler implements ICommandHandler<UpdateEventRequestCommand> {
    constructor(
        private readonly eventsRepository: EventsRepository,
        private readonly eventBus: EventBus,
    ) {}
    async execute(command: UpdateEventRequestCommand): Promise<void> {
        const { email, eventSlug } = command;
        const eventExists = await this.eventsRepository.existsBySlug(eventSlug);
        if (!eventExists) {
            throw new NotFoundException("Event not found");
        }

        const ownedEvent = await this.eventsRepository.searchOwnedEventBySlug(email, eventSlug);
        if (!ownedEvent) {
            throw new ForbiddenException("Event not owned by user");
        }

        const editToken = await this.eventsRepository.createEditToken(email, ownedEvent.id);
        this.eventBus.publish(new EditTokenRequestedEvent(email, ownedEvent.id, editToken.token));
    }
}
