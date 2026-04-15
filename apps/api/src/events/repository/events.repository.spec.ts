import { PrismaService } from '../../prisma/prisma.service';

import { EventsRepository } from './events.repository';

describe('EventsRepository', () => {
  let prisma: {
    event: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    eventDetail: {
      upsert: jest.Mock;
    };
    tag: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let repository: EventsRepository;

  beforeEach(() => {
    prisma = {
      event: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      eventDetail: {
        upsert: jest.fn(),
      },
      tag: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    repository = new EventsRepository(prisma as unknown as PrismaService);
  });

  it('saves a new event through Prisma', async () => {
    const input = { name: 'Frontend Meetup', slug: 'frontend-meetup' };
    const savedEvent = { id: 'evt-1', ...input };
    prisma.event.create.mockResolvedValue(savedEvent);

    await expect(repository.save(input as never)).resolves.toBe(savedEvent);
    expect(prisma.event.create).toHaveBeenCalledWith({
      data: input,
    });
  });

  it('finds an active event by default', async () => {
    prisma.event.findUnique.mockResolvedValue({ slug: 'frontend-meetup' });

    await repository.findBySlug('frontend-meetup');

    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: {
        slug: 'frontend-meetup',
        status: 'active',
      },
      include: {
        detail: true,
        tags: true,
      },
    });
  });

  it('can find an event regardless of status when requested', async () => {
    prisma.event.findUnique.mockResolvedValue({ slug: 'backend-meetup' });

    await repository.findBySlug('backend-meetup', false);

    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: {
        slug: 'backend-meetup',
        status: undefined,
      },
      include: {
        detail: true,
        tags: true,
      },
    });
  });

  it('returns true when an event exists', async () => {
    prisma.event.findUnique.mockResolvedValue({ slug: 'design-systems' });

    await expect(repository.existsBySlug('design-systems')).resolves.toBe(true);
    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: { slug: 'design-systems' },
      include: { detail: true, tags: true },
    });
  });

  it('returns false when an event does not exist', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(repository.existsBySlug('missing')).resolves.toBe(false);
  });

  it('paginates events with calculated skip and take', async () => {
    const events = [{ id: 'evt-5' }];
    prisma.event.findMany.mockResolvedValue(events);

    await expect(repository.findAll(3, 10)).resolves.toBe(events as never);
    expect(prisma.event.findMany).toHaveBeenCalledWith({
      skip: 20,
      take: 10,
      include: {
        detail: true,
        tags: true,
      },
    });
  });

  it('updates an event and its details in a transaction when detail data is present', async () => {
    const updatedEvent = { id: 'evt-6', detail: { city: 'Warsaw' }, tags: [] };
    const tx = {
      event: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValueOnce({ id: 'evt-6' }).mockResolvedValueOnce(updatedEvent),
      },
      eventDetail: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const details = {
      city: 'Warsaw',
      venue: 'PGE Narodowy',
    };

    await expect(
      repository.updateBySlug('design-systems', { description: 'Updated description' }, details),
    ).resolves.toBe(updatedEvent as never);

    expect(tx.event.findUnique).toHaveBeenNthCalledWith(2, {
      where: { slug: 'design-systems' },
      include: { detail: true, tags: true },
    });
  });

  it('updates only the event when no detail fields are provided', async () => {
    const updatedEvent = { id: 'evt-7', detail: null, tags: [] };
    const tx = {
      event: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValueOnce({ id: 'evt-7' }).mockResolvedValueOnce(updatedEvent),
      },
      eventDetail: {
        upsert: jest.fn(),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(repository.updateBySlug('api-summit', { status: 'archived' }, {})).resolves.toBe(
      updatedEvent as never,
    );
    expect(tx.eventDetail.upsert).not.toHaveBeenCalled();
  });

  it('throws when the updated event cannot be loaded after transaction', async () => {
    const tx = {
      event: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValueOnce({ id: 'evt-8' }).mockResolvedValueOnce(null),
      },
      eventDetail: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(repository.updateBySlug('missing-slug', {}, { city: 'Warsaw' })).rejects.toThrow(
      'Event not found after update',
    );
  });

  it('lists tags ordered by slug', async () => {
    const tags = [{ slug: 'ai' }, { slug: 'tech' }];
    prisma.tag.findMany.mockResolvedValue(tags);

    await expect(repository.listTags()).resolves.toBe(tags as never);
    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      orderBy: { slug: 'asc' },
    });
  });

  it('sets tags and classification metadata', async () => {
    prisma.event.update.mockResolvedValue({});

    await repository.setEventTags('evt-1', ['ai', 'ai', 'tech'], 0.8);

    expect(prisma.event.update).toHaveBeenCalledWith({
      where: { id: 'evt-1' },
      data: {
        classificationConfidence: 0.8,
        classifiedAt: expect.any(Date),
        tags: {
          set: [{ slug: 'ai' }, { slug: 'tech' }],
        },
      },
    });
  });

  it('lists events without tags in creation order', async () => {
    const events = [{ id: 'evt-10' }, { id: 'evt-11' }];
    prisma.event.findMany.mockResolvedValue(events);

    await expect(repository.findUnclassifiedEvents()).resolves.toEqual(events);
    expect(prisma.event.findMany).toHaveBeenCalledWith({
      take: 100,
      where: {
        tags: {
          none: {},
        },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
  });
});
