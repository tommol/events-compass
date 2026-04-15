import { ForbiddenException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { EventsRepository } from '../../repository/events.repository';
import { UpdateEventDetailsCommand } from '../update-event-details.command';
import { UpdateEventDetailsCommandHandler } from './update-event-details.handler';
import { EventClassifyRequestedEvent } from '../../events/event-classify-requested.event';

describe('UpdateEventDetailsCommandHandler', () => {
  it('updates event data and detail data when the event exists', async () => {
    const startAt = new Date('2026-06-15T18:00:00.000Z');
    const endAt = new Date('2026-06-15T22:00:00.000Z');
    const updatedEvent = { id: 'evt-2', detail: { endsAt: endAt }, tags: [] };
    const eventsRepository = {
      findValidEditToken: jest.fn().mockResolvedValue({
        eventId: 'evt-2',
        userId: 'usr-1',
        event: { id: 'evt-2', authorId: 'usr-1' },
      }),
      findBySlug: jest.fn().mockResolvedValue({ id: 'evt-2', slug: 'frontend-meetup' }),
      updateBySlug: jest.fn().mockResolvedValue(updatedEvent),
      invalidateEditToken: jest.fn().mockResolvedValue(undefined),
    };
    const eventBus = {
      publish: jest.fn(),
    };

    const handler = new UpdateEventDetailsCommandHandler(
      eventsRepository as unknown as EventsRepository,
      eventBus as unknown as EventBus,
    );
    const result = await handler.execute(
      new UpdateEventDetailsCommand(
        'frontend-meetup',
        'tok-123',
        'Updated description',
        startAt,
        endAt,
        'Poland',
        'Warsaw',
        'Mazowieckie',
        '00-001',
        'Marszalkowska 1',
        'PGE Narodowy',
      ),
    );

    expect(eventsRepository.findValidEditToken).toHaveBeenCalledWith('tok-123');
    expect(eventsRepository.findBySlug).toHaveBeenCalledWith('frontend-meetup', false);
    expect(eventsRepository.updateBySlug).toHaveBeenCalledWith('frontend-meetup', { description: 'Updated description' }, {
      startAt,
      endsAt: endAt,
      country: 'Poland',
      city: 'Warsaw',
      region: 'Mazowieckie',
      postalCode: '00-001',
      address: 'Marszalkowska 1',
      venue: 'PGE Narodowy',
    });
    expect(eventsRepository.invalidateEditToken).toHaveBeenCalledWith('tok-123');
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(EventClassifyRequestedEvent));
    expect(result).toBe(updatedEvent);
  });

  it('throws ForbiddenException when token is invalid', async () => {
    const eventsRepository = {
      findValidEditToken: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn(),
      updateBySlug: jest.fn(),
      invalidateEditToken: jest.fn(),
    };
    const eventBus = {
      publish: jest.fn(),
    };

    const handler = new UpdateEventDetailsCommandHandler(
      eventsRepository as unknown as EventsRepository,
      eventBus as unknown as EventBus,
    );

    await expect(handler.execute(new UpdateEventDetailsCommand('missing-slug', 'bad-token'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(eventsRepository.updateBySlug).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
