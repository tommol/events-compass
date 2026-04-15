import { createHash, randomBytes } from "crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Event as EventEntity, EventStatus, Prisma } from "@prisma/client";

export type EventWithDetail = Prisma.EventGetPayload<{
  include: {
    detail: true;
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

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  public async save(event: Prisma.EventCreateInput): Promise<EventEntity> {
    return this.prisma.event.create({
      data: event,
    });
  }

  public async findById(
    id: string,
    onlyActive: boolean = true,
  ): Promise<EventWithDetail | null> {
    return this.prisma.event.findUnique({
      where: {
        id,
        status: onlyActive ? "active" : undefined,
      },
      include: {
        detail: true,
      },
    });
  }

  public async exists(id: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        detail: true,
      },
    });
    return !!event;
  }

  public async findAll(
    page: number,
    limit: number,
  ): Promise<EventWithDetail[]> {
    const skip = (page - 1) * limit;
    return this.prisma.event.findMany({
      skip,
      take: limit,
      include: {
        detail: true,
      },
    });
  }

  public async update(
    id: string,
    eventData: UpdateEventData,
    detailData: UpdateEventDetailsData,
  ): Promise<EventWithDetail> {
    const hasDetailData = Object.values(detailData).some(
      (value) => value !== undefined,
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id },
        data: {
          description: eventData.description,
          status: eventData.status,
        },
      });

      if (hasDetailData) {
        await tx.eventDetail.upsert({
          where: { id },
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
            id,
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
        where: { id },
        include: { detail: true },
      });

      if (!updated) {
        throw new Error("Event not found after update");
      }

      return updated;
    });
  }

  public async searchOwnedEvent(email: string, eventId: string): Promise<EventEntity | null> {
    return this.prisma.event.findFirst({
      where: {
        id: eventId,
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

    const token = randomBytes(32).toString("hex");
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
