import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { EventDto } from "../../dtos/event.dto";
import { EventsRepository } from "../../repository/events.repository";
import { GetEventsQuery } from "../get-events.query";

@QueryHandler(GetEventsQuery)
export class GetEventsQueryHandler implements IQueryHandler<GetEventsQuery> {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(query: GetEventsQuery): Promise<EventDto[]> {
    const entities = await this.eventsRepository.findAll(
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
