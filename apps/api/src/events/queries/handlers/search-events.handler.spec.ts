import { QueryInterpreterService } from '../../../discovery/query-interpreter.service';
import { EventsRepository } from '../../repository/events.repository';
import { SearchEventsQuery } from '../search-events.query';
import { SearchEventsQueryHandler } from './search-events.handler';

describe('SearchEventsQueryHandler', () => {
  it('interprets query and searches with structured filters', async () => {
    const startAt = new Date('2026-06-15T18:00:00.000Z');
    const endAt = new Date('2026-06-15T22:00:00.000Z');

    const eventsRepository = {
      listTags: jest.fn().mockResolvedValue([{ slug: 'ai' }, { slug: 'tech' }]),
      search: jest.fn().mockResolvedValue([
        {
          id: 'evt-1',
          name: 'AI Meetup',
          slug: 'ai-meetup',
          description: 'AI in production',
          detail: {
            country: 'Poland',
            city: 'Warsaw',
            region: 'Mazowieckie',
            postalCode: '00-001',
            address: 'Marszalkowska 1',
            venue: 'PGE Narodowy',
            startAt,
            endsAt: endAt,
          },
        },
      ]),
    };

    const queryInterpreterService = {
      interpret: jest.fn().mockResolvedValue({
        location: 'Warsaw',
        eventName: 'AI Meetup',
        tags: ['ai'],
        dateHint: 'this_week',
        intent: 'hybrid',
      }),
    };

    const handler = new SearchEventsQueryHandler(
      eventsRepository as unknown as EventsRepository,
      queryInterpreterService as unknown as QueryInterpreterService,
    );

    const result = await handler.execute(new SearchEventsQuery('ai meetup warsaw', 1, 10));

    expect(eventsRepository.listTags).toHaveBeenCalled();
    expect(queryInterpreterService.interpret).toHaveBeenCalledWith('ai meetup warsaw', ['ai', 'tech']);
    expect(eventsRepository.search).toHaveBeenCalledWith('AI Meetup Warsaw', 1, 10, true, {
      location: 'Warsaw',
      eventName: 'AI Meetup',
      tags: ['ai'],
      dateHint: 'this_week',
      intent: 'hybrid',
    });
    expect(result).toEqual([
      {
        id: 'evt-1',
        name: 'AI Meetup',
        slug: 'ai-meetup',
        description: 'AI in production',
        country: 'Poland',
        city: 'Warsaw',
        region: 'Mazowieckie',
        postalCode: '00-001',
        address: 'Marszalkowska 1',
        venue: 'PGE Narodowy',
        startAt,
        endAt,
      },
    ]);
  });
});
