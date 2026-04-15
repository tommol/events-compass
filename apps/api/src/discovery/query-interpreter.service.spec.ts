import { LlmClientService } from './llm-client.service';
import { QueryInterpreterService } from './query-interpreter.service';

describe('QueryInterpreterService', () => {
  it('maps valid LLM JSON into structured query interpretation', async () => {
    const llmClient = {
      chatJson: jest.fn().mockResolvedValue(
        JSON.stringify({
          location: 'Warsaw',
          eventName: 'Frontend Summit',
          tags: ['frontend', 'tech', 'unknown'],
          dateHint: 'this_week',
          intent: 'hybrid',
        }),
      ),
    };

    const service = new QueryInterpreterService(llmClient as unknown as LlmClientService);

    await expect(service.interpret('frontend warsaw this week', ['frontend', 'tech'])).resolves.toEqual({
      location: 'Warsaw',
      eventName: 'Frontend Summit',
      tags: ['frontend', 'tech'],
      dateHint: 'this_week',
      intent: 'hybrid',
    });
  });

  it('falls back to plain interpretation on malformed JSON', async () => {
    const llmClient = {
      chatJson: jest.fn().mockResolvedValue('not-json'),
    };

    const service = new QueryInterpreterService(llmClient as unknown as LlmClientService);

    await expect(service.interpret('backend meetup tomorrow in warsaw', ['backend'])).resolves.toEqual({
      location: 'warsaw',
      eventName: 'backend meetup tomorrow in warsaw',
      tags: ['backend'],
      dateHint: 'tomorrow',
      intent: 'hybrid',
    });
  });

  it('falls back to deterministic parser when model is unavailable', async () => {
    const llmClient = {
      chatJson: jest.fn().mockResolvedValue(null),
    };

    const service = new QueryInterpreterService(llmClient as unknown as LlmClientService);

    await expect(service.interpret('ai conference this week in krakow', ['ai', 'conference'])).resolves.toEqual({
      location: 'krakow',
      eventName: 'ai conference this week in krakow',
      tags: ['ai', 'conference'],
      dateHint: 'this_week',
      intent: 'hybrid',
    });
  });
});
