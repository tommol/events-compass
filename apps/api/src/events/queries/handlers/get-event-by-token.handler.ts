import { NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { EventDto } from "../../dtos/event.dto";
import { EventsRepository } from "../../repository/events.repository";
import { GetEventByTokenQuery } from "../get-event-by-token.query";

@QueryHandler(GetEventByTokenQuery)
export class GetEventByTokenQueryHandler implements IQueryHandler<GetEventByTokenQuery> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(query: GetEventByTokenQuery): Promise<EventDto> {
    const entity = await this.eventsRepository.findByEditToken(query.token);
    if (!entity) {
      throw new NotFoundException("Event not found or token expired");
    }

    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description ?? undefined,
      country: entity.detail?.country ?? undefined,
      city: entity.detail?.city ?? undefined,
      region: entity.detail?.region ?? undefined,
      postalCode: entity.detail?.postalCode ?? undefined,
      address: entity.detail?.address ?? undefined,
      venue: entity.detail?.venue ?? undefined,
      startAt: entity.detail?.startAt ?? undefined,
      endAt: entity.detail?.endsAt ?? undefined,
    };
  }
}
