import axios from 'axios';
import logger from '../utils/logger';
import { ConversationMessage } from '../types/models';

/**
 * Telnyx Chat Service
 * Uses Telnyx Chat Completions API (OpenAI-compatible)
 * Can use Claude, GPT, or other models through Telnyx
 */
export class TelnyxChatService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY || '';
    this.apiUrl = process.env.TELNYX_API_URL || 'https://api.telnyx.com/v2';
    // Use Claude via Telnyx, or fall back to Llama
    this.model = process.env.TELNYX_MODEL || 'anthropic/claude-3.5-sonnet';

    if (!this.apiKey) {
      logger.warn('TELNYX_API_KEY not configured. Falling back to direct Claude API.');
    }
  }

  /**
   * Generate a chat completion using Telnyx
   * This is OpenAI-compatible, so it works just like OpenAI's API
   */
  async createChatCompletion(params: {
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    tools?: Array<{
      type: 'function';
      function: {
        name: string;
        description: string;
        parameters?: any;
      };
    }>;
  }): Promise<{
    content: string;
    toolCalls?: Array<{
      id: string;
      function: {
        name: string;
        arguments: string;
      };
    }>;
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/chat/completions`,
        {
          model: this.model,
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 1000,
          tools: params.tools,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const choice = response.data.choices[0];
      const message = choice.message;

      // Check if there are tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        return {
          content: message.content || '',
          toolCalls: message.tool_calls,
        };
      }

      return {
        content: message.content,
      };
    } catch (error: any) {
      logger.error('Telnyx chat completion error:', error.response?.data || error.message);
      throw new Error('Failed to generate chat completion');
    }
  }

  /**
   * Simple chat - just send messages and get a response
   */
  async chat(
    conversationHistory: ConversationMessage[],
    systemPrompt?: string
  ): Promise<string> {
    const messages = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    const result = await this.createChatCompletion({ messages });
    return result.content;
  }

  /**
   * Chat with tool calling support
   */
  async chatWithTools(params: {
    conversationHistory: ConversationMessage[];
    systemPrompt?: string;
    tools: Array<{
      name: string;
      description: string;
      parameters?: any;
    }>;
  }): Promise<{
    content: string;
    toolCalls?: Array<{
      id: string;
      function: {
        name: string;
        arguments: string;
      };
    }>;
  }> {
    const messages = [];

    // Add system prompt if provided
    if (params.systemPrompt) {
      messages.push({
        role: 'system',
        content: params.systemPrompt,
      });
    }

    // Add conversation history
    for (const msg of params.conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Convert tools to OpenAI format
    const tools = params.tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    return await this.createChatCompletion({ messages, tools });
  }

  /**
   * Extract structured data from text (like job preferences)
   */
  async extractStructuredData(
    text: string,
    schema: any,
    instruction: string
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiUrl}/ai/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: `${instruction}\n\nText: "${text}"\n\nReturn ONLY valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`,
          },
        ],
        temperature: 0.1, // Low temperature for structured output
        max_tokens: 500,
        response_format: { type: 'json_object' }, // Force JSON output
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Check if Telnyx is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/ai/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.data.map((model: any) => model.id);
    } catch (error: any) {
      logger.error('Failed to get models:', error.message);
      return [];
    }
  }
}
