import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { EventDto } from "../../dtos/event.dto";
import { EventsRepository } from "../../repository/events.repository";
import { SearchEventsQuery } from "../search-events.query";

@QueryHandler(SearchEventsQuery)
export class SearchEventsQueryHandler
  implements IQueryHandler<SearchEventsQuery>
{
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(query: SearchEventsQuery): Promise<EventDto[]> {
    const entities = await this.eventsRepository.search(
      query.term,
      query.page,
      query.limit,
    );

    return entities.map((entity) => ({
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
    }));
  }
}