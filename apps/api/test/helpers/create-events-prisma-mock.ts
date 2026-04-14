type EventStatus = 'active' | 'archived' | 'deleted';

type StoredEvent = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: EventStatus;
};

type StoredEventDetail = {
  id: string;
  startAt?: Date;
  endsAt?: Date;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  address?: string;
  venue?: string;
};

export const createEventsPrismaMock = () => {
  const events = new Map<string, StoredEvent>();
  const details = new Map<string, StoredEventDetail>();
  let counter = 0;

  const mapEventWithDetail = (event: StoredEvent) => ({
    ...event,
    detail: details.get(event.id) ?? null,
  });

  const prismaMock = {
    $queryRaw: jest.fn().mockResolvedValue([1]),
    event: {
      create: jest.fn(async ({ data }: any) => {
        counter += 1;
        const event: StoredEvent = {
          id: `evt-${counter}`,
          name: data.name,
          slug: data.slug,
          description: data.description,
          status: 'active',
        };
        events.set(event.id, event);
        return event;
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const event = events.get(where.id);
        if (!event) {
          return null;
        }
        if (where.status && event.status !== where.status) {
          return null;
        }
        return mapEventWithDetail(event);
      }),
      findMany: jest.fn(async ({ skip = 0, take = 10 }: any) => {
        const all = [...events.values()].map(mapEventWithDetail);
        return all.slice(skip, skip + take);
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const existing = events.get(where.id);
        if (!existing) {
          throw new Error('Event not found');
        }
        const next: StoredEvent = {
          ...existing,
          description:
            data.description === undefined
              ? existing.description
              : data.description,
          status: data.status === undefined ? existing.status : data.status,
        };
        events.set(where.id, next);
        return next;
      }),
    },
    eventDetail: {
      upsert: jest.fn(async ({ where, update, create }: any) => {
        const existing = details.get(where.id);
        if (existing) {
          details.set(where.id, {
            ...existing,
            ...update,
          });
          return details.get(where.id);
        }

        details.set(where.id, create);
        return create;
      }),
    },
    $transaction: jest.fn(async (callback: any) => {
      const tx = {
        event: {
          update: prismaMock.event.update,
          findUnique: prismaMock.event.findUnique,
        },
        eventDetail: {
          upsert: prismaMock.eventDetail.upsert,
        },
      };

      return callback(tx);
    }),
  };

  return prismaMock;
};

export type EventsPrismaMock = ReturnType<typeof createEventsPrismaMock>;