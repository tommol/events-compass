import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventClassifyRequestedEvent } from '../../events/event-classify-requested.event';
import { EventsRepository } from '../../repository/events.repository';
import { ReclassifyEventCommand } from '../reclassify-event.command';
import { ReclassifyEventCommandHandler } from './reclassify-event.handler';

describe('ReclassifyEventCommandHandler', () => {
  it('publishes reclassification event for existing event', async () => {
    const eventsRepository = {
      findBySlug: jest.fn().mockResolvedValue({ id: 'evt-1', slug: 'ai-meetup' }),
    };
    const eventBus = {
      publish: jest.fn(),
    };

    const handler = new ReclassifyEventCommandHandler(
      eventsRepository as unknown as EventsRepository,
      eventBus as unknown as EventBus,
    );

    await handler.execute(new ReclassifyEventCommand('ai-meetup'));

    expect(eventsRepository.findBySlug).toHaveBeenCalledWith('ai-meetup', false);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(EventClassifyRequestedEvent));
  });

  it('throws when event does not exist', async () => {
    const eventsRepository = {
      findBySlug: jest.fn().mockResolvedValue(null),
    };
    const eventBus = {
      publish: jest.fn(),
    };

    const handler = new ReclassifyEventCommandHandler(
      eventsRepository as unknown as EventsRepository,
      eventBus as unknown as EventBus,
    );

    await expect(handler.execute(new ReclassifyEventCommand('missing'))).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
