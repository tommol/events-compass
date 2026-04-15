import { ICommandHandler, EventBus } from "@nestjs/cqrs";
import { UpdateEventRequestCommand } from "../update-event-request.command";
import { EventsRepository } from "../../repository/events.repository";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { EditTokenRequestedEvent } from "../../events/edit-token-requested.event";

export class UpdateEventRequestCommandHandler implements ICommandHandler<UpdateEventRequestCommand> {
    constructor(
        private readonly eventsRepository: EventsRepository,
        private readonly eventBus: EventBus,
    ) {}
    async execute(command: UpdateEventRequestCommand): Promise<void> {
        const { email, eventId } = command;
        const eventExists = await this.eventsRepository.exists(eventId);
        if (!eventExists) {
            throw new NotFoundException("Event not found");
        }

        const ownedEvent = await this.eventsRepository.searchOwnedEvent(email, eventId);
        if (!ownedEvent) {
            throw new ForbiddenException("Event not owned by user");
        }

        const editToken = await this.eventsRepository.createEditToken(email, eventId);
        this.eventBus.publish(new EditTokenRequestedEvent(email, eventId, editToken.token));
    }
}