import { createHash, randomBytes } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Event as EventEntity, EventStatus, Prisma, Tag } from '@prisma/client';
import { QueryIntent } from '../../discovery/discovery.types';

export type EventWithDetail = Prisma.EventGetPayload<{
  include: {
    detail: true;
    tags: true;
  };
}>;

export type EditTokenWithOwner = Prisma.EventTokenGetPayload<{
  include: {
    event: {
      select: {
        id: true;
        authorId: true;
      };
    };
  };
}>;

export type CreateEditTokenResult = {
  token: string;
  expiresAt: Date;
};

export type UpdateEventData = {
  description?: string;
  status?: EventStatus;
};

export type UpdateEventDetailsData = {
  startAt?: Date;
  endsAt?: Date;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  address?: string;
  venue?: string;
};

export type SearchFilters = {
  location?: string | null;
  eventName?: string | null;
  tags?: string[];
  dateHint?: string | null;
  intent?: QueryIntent;
};

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveDateRange(dateHint: string | null | undefined): { gte: Date; lte: Date } | null {
    if (!dateHint) {
      return null;
    }

    const normalized = dateHint.trim().toLowerCase();
    const now = new Date();

    if (normalized === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    if (normalized === 'tomorrow') {
      const start = new Date(now);
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    if (normalized === 'this_week') {
      const start = new Date(now);
      const day = start.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    if (normalized === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    const isoDateMatch = normalized.match(/^\d{4}-\d{2}-\d{2}$/);
    if (isoDateMatch) {
      const start = new Date(`${normalized}T00:00:00.000Z`);
      const end = new Date(`${normalized}T23:59:59.999Z`);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        return { gte: start, lte: end };
      }
    }

    return null;
  }

  public async save(event: Prisma.EventCreateInput): Promise<EventEntity> {
    return this.prisma.event.create({
      data: event,
    });
  }

  public async findById(id: string): Promise<EventWithDetail | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        detail: true,
        tags: true,
      },
    });
  }

  public async findBySlug(slug: string, onlyActive: boolean = true): Promise<EventWithDetail | null> {
    return this.prisma.event.findUnique({
      where: {
        slug,
        status: onlyActive ? 'active' : undefined,
      },
      include: {
        detail: true,
        tags: true,
      },
    });
  }

  public async existsBySlug(slug: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: {
        slug,
      },
      include: {
        detail: true,
        tags: true,
      },
    });
    return !!event;
  }

  public async findAll(page: number, limit: number): Promise<EventWithDetail[]> {
    const skip = (page - 1) * limit;
    return this.prisma.event.findMany({
      skip,
      take: limit,
      include: {
        detail: true,
        tags: true,
      },
    });
  }

  public async findUnclassifiedEvents(limit: number = 100): Promise<Array<{ id: string }>> {
    return this.prisma.event.findMany({
      take: limit,
      where: {
        tags: {
          none: {},
        },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async listTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      orderBy: { slug: 'asc' },
    });
  }

  public async search(
    term: string,
    page: number,
    limit: number,
    onlyActive: boolean = true,
    filters: SearchFilters = {},
  ): Promise<EventWithDetail[]> {
    const skip = (page - 1) * limit;
    const effectiveTerm = term.trim();

    const orFilters: Prisma.EventWhereInput[] = [];
    const andFilters: Prisma.EventWhereInput[] = [];

    if (filters.eventName) {
      orFilters.push({
        name: {
          contains: filters.eventName,
          mode: 'insensitive',
        },
      });
    }

    if (filters.location) {
      orFilters.push(
        {
          detail: {
            is: {
              city: {
                contains: filters.location,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          detail: {
            is: {
              country: {
                contains: filters.location,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          detail: {
            is: {
              venue: {
                contains: filters.location,
                mode: 'insensitive',
              },
            },
          },
        },
      );
    }

    if (effectiveTerm) {
      orFilters.push(
        {
          name: {
            contains: effectiveTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: effectiveTerm,
            mode: 'insensitive',
          },
        },
        {
          detail: {
            is: {
              city: {
                contains: effectiveTerm,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          detail: {
            is: {
              venue: {
                contains: effectiveTerm,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          detail: {
            is: {
              country: {
                contains: effectiveTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      andFilters.push({
        tags: {
          some: { slug: { in: filters.tags } },
        },
      });
    }

    const dateRange = this.resolveDateRange(filters.dateHint);
    if (dateRange) {
      andFilters.push({
        detail: {
          is: {
            startAt: {
              gte: dateRange.gte,
              lte: dateRange.lte,
            },
          },
        },
      });
    }

    return this.prisma.event.findMany({
      skip,
      take: limit,
      where: {
        status: onlyActive ? 'active' : undefined,
        AND: andFilters.length > 0 ? andFilters : undefined,
        OR: orFilters.length > 0 ? orFilters : undefined,
      },
      include: {
        detail: true,
        tags: true,
      },
    });
  }

  public async setEventTags(eventId: string, tagSlugs: string[], confidence: number | null): Promise<void> {
    const uniqueTagSlugs = Array.from(new Set(tagSlugs)).slice(0, 5);

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        classificationConfidence: confidence,
        classifiedAt: new Date(),
        tags: {
          set: uniqueTagSlugs.map((slug) => ({ slug })),
        },
      },
    });
  }

  public async updateBySlug(
    slug: string,
    eventData: UpdateEventData,
    detailData: UpdateEventDetailsData,
  ): Promise<EventWithDetail> {
    const hasDetailData = Object.values(detailData).some((value) => value !== undefined);

    return this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { slug },
        data: {
          description: eventData.description,
          status: eventData.status,
        },
      });

      const existing = await tx.event.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) {
        throw new Error('Event not found after update');
      }

      if (hasDetailData) {
        await tx.eventDetail.upsert({
          where: { id: existing.id },
          update: {
            startAt: detailData.startAt,
            endsAt: detailData.endsAt,
            country: detailData.country,
            city: detailData.city,
            region: detailData.region,
            postalCode: detailData.postalCode,
            address: detailData.address,
            venue: detailData.venue,
          },
          create: {
            id: existing.id,
            startAt: detailData.startAt,
            endsAt: detailData.endsAt,
            country: detailData.country,
            city: detailData.city,
            region: detailData.region,
            postalCode: detailData.postalCode,
            address: detailData.address,
            venue: detailData.venue,
          },
        });
      }

      const updated = await tx.event.findUnique({
        where: { slug },
        include: { detail: true, tags: true },
      });

      if (!updated) {
        throw new Error('Event not found after update');
      }

      return updated;
    });
  }

  public async searchOwnedEventBySlug(email: string, eventSlug: string): Promise<EventEntity | null> {
    return this.prisma.event.findFirst({
      where: {
        slug: eventSlug,
        author: {
          email,
        },
      },
    });
  }

  public async createEditToken(email: string, eventId: string): Promise<CreateEditTokenResult> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    await this.prisma.eventToken.create({
      data: {
        tokenHash,
        eventId,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      token,
      expiresAt,
    };
  }

  public async findByEditToken(token: string): Promise<EventWithDetail | null> {
    const tokenHash = this.hashToken(token);
    const eventToken = await this.prisma.eventToken.findUnique({
      where: { tokenHash },
      include: {
        event: {
          include: {
            detail: true,
            tags: true,
          },
        },
      },
    });

    if (!eventToken || eventToken.expiresAt < new Date()) {
      return null;
    }

    return eventToken.event;
  }

  public async findValidEditToken(token: string): Promise<EditTokenWithOwner | null> {
    const tokenHash = this.hashToken(token);
    const eventToken = await this.prisma.eventToken.findUnique({
      where: { tokenHash },
      include: {
        event: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!eventToken || eventToken.expiresAt < new Date()) {
      return null;
    }

    return eventToken;
  }

  public async invalidateEditToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.eventToken.delete({
      where: { tokenHash },
    });
  }
}
