import { EventBus } from '@nestjs/cqrs';
import { EventClassifyRequestedEvent } from '../../events/event-classify-requested.event';
import { EventsRepository } from '../../repository/events.repository';
import { ReclassifyUnclassifiedEventsCommand } from '../reclassify-unclassified-events.command';
import { ReclassifyUnclassifiedEventsCommandHandler } from './reclassify-unclassified-events.handler';

describe('ReclassifyUnclassifiedEventsCommandHandler', () => {
  it('publishes reclassification event for each unclassified event', async () => {
    const eventsRepository = {
      findUnclassifiedEvents: jest.fn().mockResolvedValue([
        { id: 'evt-1' },
        { id: 'evt-2' },
      ]),
    };
    const eventBus = {
      publish: jest.fn(),
    };

    const handler = new ReclassifyUnclassifiedEventsCommandHandler(
      eventsRepository as unknown as EventsRepository,
      eventBus as unknown as EventBus,
    );

    const result = await handler.execute(new ReclassifyUnclassifiedEventsCommand());

    expect(result).toBe(2);
    expect(eventsRepository.findUnclassifiedEvents).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledTimes(2);
    expect(eventBus.publish).toHaveBeenNthCalledWith(1, expect.any(EventClassifyRequestedEvent));
    expect(eventBus.publish).toHaveBeenNthCalledWith(2, expect.any(EventClassifyRequestedEvent));
  });

  it('returns 0 when there are no unclassified events', async () => {
    const eventsRepository = {
      findUnclassifiedEvents: jest.fn().mockResolvedValue([]),
    };
    const eventBus = {
      publish: jest.fn(),
    };

    const handler = new ReclassifyUnclassifiedEventsCommandHandler(
      eventsRepository as unknown as EventsRepository,
      eventBus as unknown as EventBus,
    );

    const result = await handler.execute(new ReclassifyUnclassifiedEventsCommand());

    expect(result).toBe(0);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
