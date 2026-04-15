import { EventClassifyRequestedEvent } from '../../events/events/event-classify-requested.event';
import { DiscoveryRepository } from '../discovery.repository';
import { EventClassifierService } from '../event-classifier.service';
import { EventClassifyRequestedHandler } from './event-classify-requested.handler';

describe('EventClassifyRequestedHandler', () => {
  it('classifies an event and persists allowed tags', async () => {
    const discoveryRepository = {
      findEventForClassification: jest.fn().mockResolvedValue({
        id: 'evt-1',
        name: 'AI Meetup',
        description: 'Practical AI',
        detail: { city: 'Warsaw', country: 'Poland', venue: 'PGE' },
      }),
      listTagSlugs: jest.fn().mockResolvedValue(['ai', 'tech']),
      setEventTags: jest.fn().mockResolvedValue(undefined),
    };

    const eventClassifierService = {
      classify: jest.fn().mockResolvedValue({ tagSlugs: ['ai'], confidence: 0.8 }),
    };

    const handler = new EventClassifyRequestedHandler(
      discoveryRepository as unknown as DiscoveryRepository,
      eventClassifierService as unknown as EventClassifierService,
    );

    await handler.handle(new EventClassifyRequestedEvent('evt-1'));

    expect(discoveryRepository.listTagSlugs).toHaveBeenCalled();
    expect(eventClassifierService.classify).toHaveBeenCalledWith(
      {
        name: 'AI Meetup',
        description: 'Practical AI',
        city: 'Warsaw',
        country: 'Poland',
        venue: 'PGE',
      },
      ['ai', 'tech'],
    );
    expect(discoveryRepository.setEventTags).toHaveBeenCalledWith('evt-1', ['ai'], 0.8);
  });
});
