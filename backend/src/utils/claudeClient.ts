import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  getClient(): Anthropic {
    return this.client;
  }
}

export const claudeClient = new ClaudeClient();
