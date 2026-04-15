import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventDto } from '../../dtos/event.dto';
import { EventsRepository } from '../../repository/events.repository';
import { SearchEventsQuery } from '../search-events.query';
import { QueryInterpreterService } from '../../../discovery/query-interpreter.service';

@QueryHandler(SearchEventsQuery)
export class SearchEventsQueryHandler implements IQueryHandler<SearchEventsQuery> {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly queryInterpreterService: QueryInterpreterService,
  ) {}

  async execute(query: SearchEventsQuery): Promise<EventDto[]> {
    const tags = await this.eventsRepository.listTags();
    const allowedTagSlugs = tags.map((tag) => tag.slug);

    const interpreted = await this.queryInterpreterService.interpret(query.term, allowedTagSlugs);
    const normalizedTerm = [interpreted.eventName, interpreted.location]
      .filter((value): value is string => !!value && value.trim().length > 0)
      .join(' ')
      .trim();

    const entities = await this.eventsRepository.search(
      normalizedTerm || query.term,
      query.page,
      query.limit,
      true,
      {
        location: interpreted.location,
        eventName: interpreted.eventName,
        tags: interpreted.tags,
        dateHint: interpreted.dateHint,
        intent: interpreted.intent,
      },
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
