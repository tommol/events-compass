type EventStatus = 'active' | 'archived' | 'deleted';

type StoredEvent = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: EventStatus;
  classifiedAt?: Date;
  classificationConfidence?: number | null;
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
  const tags = [{ slug: 'tech' }, { slug: 'meetup' }, { slug: 'conference' }];
  let counter = 0;
  const findEventBySlug = (slug: string): StoredEvent | undefined =>
    [...events.values()].find((event) => event.slug === slug);

  const containsIgnoreCase = (value: string | undefined, expected: string): boolean => {
    if (!value) {
      return false;
    }

    return value.toLowerCase().includes(expected.toLowerCase());
  };

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
      findUnique: jest.fn(async ({ where, select }: any) => {
        const event = where.id ? events.get(where.id) : findEventBySlug(where.slug);
        if (!event) {
          return null;
        }
        if (where.status && event.status !== where.status) {
          return null;
        }

        if (select) {
          const selected: Record<string, unknown> = {};
          Object.entries(select).forEach(([key, value]) => {
            if (value) {
              selected[key] = (event as unknown as Record<string, unknown>)[key];
            }
          });
          return selected;
        }

        return mapEventWithDetail(event);
      }),
      findMany: jest.fn(async ({ skip = 0, take = 10, where }: any) => {
        const all = [...events.values()].map(mapEventWithDetail);

        const filtered = all.filter((event) => {
          if (where?.status && event.status !== where.status) {
            return false;
          }

          if (!where?.OR || !Array.isArray(where.OR) || where.OR.length === 0) {
            return true;
          }

          return where.OR.some((condition: any) => {
            if (condition.name?.contains) {
              return containsIgnoreCase(event.name, condition.name.contains);
            }

            if (condition.description?.contains) {
              return containsIgnoreCase(event.description, condition.description.contains);
            }

            const detail = event.detail;
            const detailIs = condition.detail?.is;

            if (detailIs?.city?.contains) {
              return containsIgnoreCase(detail?.city, detailIs.city.contains);
            }

            if (detailIs?.venue?.contains) {
              return containsIgnoreCase(detail?.venue, detailIs.venue.contains);
            }

            if (detailIs?.country?.contains) {
              return containsIgnoreCase(detail?.country, detailIs.country.contains);
            }

            return false;
          });
        });

        return filtered.slice(skip, skip + take);
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const existing = where.id ? events.get(where.id) : findEventBySlug(where.slug);
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
          classifiedAt:
            data.classifiedAt === undefined ? existing.classifiedAt : data.classifiedAt,
          classificationConfidence:
            data.classificationConfidence === undefined
              ? existing.classificationConfidence
              : data.classificationConfidence,
        };
        events.set(existing.id, next);
        return next;
      }),
    },
    tag: {
      findMany: jest.fn(async () => tags),
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
