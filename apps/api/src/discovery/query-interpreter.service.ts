import { Injectable } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { QueryIntent, QueryInterpretation } from './discovery.types';

const ALLOWED_INTENTS: QueryIntent[] = [
  'general_search',
  'event_lookup',
  'tag_search',
  'location_search',
  'date_search',
  'hybrid',
];

@Injectable()
export class QueryInterpreterService {
  constructor(private readonly llmClient: LlmClientService) {}

  private inferFallback(query: string, allowedTagSlugs: string[]): QueryInterpretation {
    const normalized = query.trim();
    const normalizedLower = normalized.toLowerCase();
    const tokens = normalizedLower.split(/\s+/).filter(Boolean);

    const tags = allowedTagSlugs.filter((slug) => {
      const slugPattern = slug.toLowerCase();
      return (
        normalizedLower.includes(slugPattern) ||
        normalizedLower.includes(slugPattern.replace(/-/g, ' '))
      );
    });

    let dateHint: string | null = null;
    if (/\b(today|dzis|dziś)\b/i.test(normalizedLower)) {
      dateHint = 'today';
    } else if (/\b(tomorrow|jutro)\b/i.test(normalizedLower)) {
      dateHint = 'tomorrow';
    } else if (/\b(this week|ten tydzien|ten tydzień)\b/i.test(normalizedLower)) {
      dateHint = 'this_week';
    } else if (/\b(this month|ten miesiac|ten miesiąc)\b/i.test(normalizedLower)) {
      dateHint = 'this_month';
    } else {
      const isoDateMatch = normalized.match(/\b\d{4}-\d{2}-\d{2}\b/);
      if (isoDateMatch) {
        dateHint = isoDateMatch[0];
      }
    }

    const locationMarkerIndex = tokens.findIndex((token) => token === 'in' || token === 'w');
    const location =
      locationMarkerIndex >= 0 && tokens[locationMarkerIndex + 1]
        ? tokens[locationMarkerIndex + 1]
        : null;

    const hasStructuredData = tags.length > 0 || !!dateHint || !!location;

    return {
      location,
      eventName: normalized || null,
      tags: Array.from(new Set(tags)).slice(0, 5),
      dateHint,
      intent: hasStructuredData ? 'hybrid' : 'general_search',
    };
  }

  public async interpret(query: string, allowedTagSlugs: string[]): Promise<QueryInterpretation> {
    const term = query.trim();
    if (!term) {
      return {
        location: null,
        eventName: null,
        tags: [],
        dateHint: null,
        intent: 'general_search',
      };
    }

    const systemPrompt =
      'You are a search query interpreter. Return strict JSON with exactly these fields: location (string|null), eventName (string|null), tags (string[]), dateHint (string|null), intent (string).';

    const userPrompt = [
      `Query: ${term}`,
      `Allowed tag slugs: ${allowedTagSlugs.join(', ')}`,
      'Rules:',
      '- tags can only contain allowed tag slugs',
      '- intent must be one of: general_search,event_lookup,tag_search,location_search,date_search,hybrid',
      '- if no value is present, use null for location/eventName/dateHint and [] for tags',
    ].join('\n');

    const raw = await this.llmClient.chatJson(systemPrompt, userPrompt);
    if (!raw) {
      return this.inferFallback(term, allowedTagSlugs);
    }

    try {
      const parsed = JSON.parse(raw) as {
        location?: unknown;
        eventName?: unknown;
        tags?: unknown;
        dateHint?: unknown;
        intent?: unknown;
      };

      const location = typeof parsed.location === 'string' ? parsed.location.trim() || null : null;
      const eventName = typeof parsed.eventName === 'string' ? parsed.eventName.trim() || null : null;
      const dateHint = typeof parsed.dateHint === 'string' ? parsed.dateHint.trim() || null : null;
      const tags = Array.isArray(parsed.tags)
        ? parsed.tags
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim())
            .filter((value) => allowedTagSlugs.includes(value))
        : [];
      const intent =
        typeof parsed.intent === 'string' &&
        ALLOWED_INTENTS.includes(parsed.intent as QueryIntent)
          ? (parsed.intent as QueryIntent)
          : 'general_search';

      return {
        location,
        eventName,
        tags: Array.from(new Set(tags)).slice(0, 5),
        dateHint,
        intent,
      };
    } catch {
      return this.inferFallback(term, allowedTagSlugs);
    }
  }
}
