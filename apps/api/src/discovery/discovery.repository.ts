import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscoveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findEventForClassification(eventId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    detail: {
      city: string | null;
      country: string | null;
      venue: string | null;
    } | null;
  } | null> {
    return this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        detail: {
          select: {
            city: true,
            country: true,
            venue: true,
          },
        },
      },
    });
  }

  public async listTagSlugs(): Promise<string[]> {
    const tags = await this.prisma.tag.findMany({
      select: { slug: true },
      orderBy: { slug: 'asc' },
    });

    return tags.map((tag) => tag.slug);
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
}
