import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class LlmClientService {
  private readonly logger = new Logger(LlmClientService.name);

  constructor(private readonly configService: ConfigService) {}

  public async chatJson(systemPrompt: string, userPrompt: string): Promise<string | null> {
    const configuredBaseUrl = this.configService.get<string>('SCW_GENAI_BASE_URL');
    const projectId = this.configService.get<string>('SCW_GENAI_PROJECT_ID');
    const apiKey = this.configService.get<string>('SCW_GENAI_API_KEY');
    const model =
      this.configService.get<string>('SCW_GENAI_MODEL') ?? 'mistral-small-3.2-24b-instruct-2506';

    const baseUrl =
      configuredBaseUrl ??
      (projectId ? `https://api.scaleway.ai/${projectId}/v1` : 'https://api.scaleway.ai/v1');

    if (!apiKey) {
      this.logger.warn(
        'SCW GenAI disabled: missing API key. Set SCW_GENAI_API_KEY.',
      );
      return null;
    }

    const timeoutMs = Number(this.configService.get<string>('SCW_GENAI_TIMEOUT_MS') ?? '7000');
    const retries = Number(this.configService.get<string>('SCW_GENAI_RETRIES') ?? '1');

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      timeout: timeoutMs,
    });

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await client.chat.completions.create({
          model,
          temperature: 0,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: {
            type: 'json_object',
          },
        });

        const content = response.choices?.[0]?.message?.content;
        return typeof content === 'string' ? content : null;
      } catch (error) {
        lastError = error;
      }
    }

    this.logger.warn(
      `LLM request failed after retries: ${String(
        lastError,
      )}. baseURL=${baseUrl} model=${model}. Check key permissions (Generative API access) and project-scoped endpoint.`,
    );
    return null;
  }
}
