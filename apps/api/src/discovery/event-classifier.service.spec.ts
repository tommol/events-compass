import { LlmClientService } from './llm-client.service';
import { EventClassifierService } from './event-classifier.service';

describe('EventClassifierService', () => {
  it('filters invalid tags and enforces max 5 tags', async () => {
    const llmClient = {
      chatJson: jest.fn().mockResolvedValue(
        JSON.stringify({
          tagSlugs: ['ai', 'tech', 'meetup', 'conference', 'data', 'extra', 'ai'],
          confidence: 0.91,
        }),
      ),
    };

    const service = new EventClassifierService(llmClient as unknown as LlmClientService);

    const result = await service.classify(
      {
        name: 'AI Meetup',
        description: 'Production AI',
      },
      ['ai', 'tech', 'meetup', 'conference', 'data'],
    );

    expect(result).toEqual({
      tagSlugs: ['ai', 'tech', 'meetup', 'conference', 'data'],
      confidence: 0.91,
    });
  });

  it('returns fallback on invalid payload', async () => {
    const llmClient = {
      chatJson: jest.fn().mockResolvedValue('oops'),
    };

    const service = new EventClassifierService(llmClient as unknown as LlmClientService);

    await expect(service.classify({ name: 'Event' }, ['ai'])).resolves.toEqual({
      tagSlugs: [],
      confidence: null,
    });
  });
});
