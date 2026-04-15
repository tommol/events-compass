import { Injectable } from '@nestjs/common';
import { EventClassification, EventClassificationInput } from './discovery.types';
import { LlmClientService } from './llm-client.service';

@Injectable()
export class EventClassifierService {
  constructor(private readonly llmClient: LlmClientService) {}

  public async classify(
    input: EventClassificationInput,
    allowedTagSlugs: string[],
  ): Promise<EventClassification> {
    const systemPrompt =
      'You classify events into tags. Return strict JSON with tagSlugs (array) and confidence (number 0..1 or null).';

    const userPrompt = [
      `Allowed tag slugs: ${allowedTagSlugs.join(', ')}`,
      'Pick up to 5 tags only from the allowed list.',
      `Event name: ${input.name}`,
      `Event description: ${input.description ?? ''}`,
      `Event city: ${input.city ?? ''}`,
      `Event country: ${input.country ?? ''}`,
      `Event venue: ${input.venue ?? ''}`,
    ].join('\n');

    const raw = await this.llmClient.chatJson(systemPrompt, userPrompt);
    if (!raw) {
      return { tagSlugs: [], confidence: null };
    }

    try {
      const parsed = JSON.parse(raw) as {
        tagSlugs?: unknown;
        confidence?: unknown;
      };

      const tagSlugs = Array.isArray(parsed.tagSlugs)
        ? parsed.tagSlugs
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim())
            .filter((value) => allowedTagSlugs.includes(value))
        : [];

      const confidence =
        typeof parsed.confidence === 'number' && parsed.confidence >= 0 && parsed.confidence <= 1
          ? parsed.confidence
          : null;

      return {
        tagSlugs: Array.from(new Set(tagSlugs)).slice(0, 5),
        confidence,
      };
    } catch {
      return { tagSlugs: [], confidence: null };
    }
  }
}
