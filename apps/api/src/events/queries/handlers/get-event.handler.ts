import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventQuery } from "../get-event.query";
import { EventsRepository } from "../../repository/events.repository";
import { EventDto } from "../../dtos/event.dto";
import { NotFoundException } from "@nestjs/common";

@QueryHandler(GetEventQuery)
export class GetEventQueryHandler implements IQueryHandler<GetEventQuery> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(query: GetEventQuery): Promise<EventDto> {
    const entity = await this.eventsRepository.findBySlug(query.slug);
    if (!entity) {
      throw new NotFoundException("Event not found");
    }

    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description ?? undefined,
      tags: entity.tags.map((tag) => tag.slug),
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
