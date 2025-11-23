# Telnyx Integration - Required Fixes

## Current Implementation Issues

Our current `telnyxAgent.service.ts` is using the basic Telnyx Call Control API, but according to `telnyx_agent.md`, we should be using the **Telnyx AI Assistants API** instead.

## What Telnyx Provides

According to the documentation, Telnyx offers:

1. **AI Assistants API** (`/v2/ai/assistants`)
   - Voice-enabled conversational AI
   - Built-in speech-to-text and text-to-speech
   - Telephony and messaging support
   - Tools and function calling
   - External webhook integration

2. **Chat Completions API** (`/v2/ai/chat/completions`)
   - OpenAI-compatible LLM API
   - For text-based conversations

## Required Changes

### 1. Create AI Assistant (One-time Setup)

Instead of manually handling calls, we should create an AI Assistant:

```typescript
// NEW: Create an AI Assistant
async createAssistant() {
  const response = await axios.post(
    `${this.apiUrl}/ai/assistants`,
    {
      name: "JobAgent Assistant",
      llm_settings: {
        model: "anthropic/claude-3.5-sonnet", // Use Claude via Telnyx
        temperature: 0.7,
        max_tokens: 1000,
        system_prompt: `You are JobAgent, an AI assistant that helps people find jobs.
You can help with:
- Collecting job preferences (position, location)
- Finding and presenting job opportunities
- Reviewing cover letters
- Suggesting networking contacts

Be conversational, helpful, and guide users through the job search process.`
      },
      voice_settings: {
        voice: "Telnyx.KokoroTTS.af_heart", // Use Telnyx natural voice
        voice_speed: 1.0,
        model: "deepgram/nova-3", // STT model
        language: "auto"
      },
      telephony_settings: {
        supports_unauthenticated_web_calls: true
      },
      enabled_features: ["telephony", "messaging"],
      tools: [
        {
          type: "external",
          function: {
            name: "search_jobs",
            description: "Search for job openings based on user preferences",
            url: `${process.env.BACKEND_URL}/api/agent/tools/search-jobs`,
            method: "POST"
          }
        },
        {
          type: "external",
          function: {
            name: "get_job_applications",
            description: "Get user's current job applications",
            url: `${process.env.BACKEND_URL}/api/agent/tools/get-applications`,
            method: "POST"
          }
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data;
}
```

### 2. Use Chat Completions for Text Chat

For the dashboard chat interface, use the Chat Completions API:

```typescript
async sendChatMessage(userId: string, message: string, history: any[]) {
  const response = await axios.post(
    `${this.apiUrl}/ai/chat/completions`,
    {
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: "You are JobAgent, helping users with job search..."
        },
        ...history,
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      tools: [
        {
          type: "function",
          function: {
            name: "search_jobs",
            description: "Search for jobs",
            parameters: {
              position: { type: "string" },
              locations: { type: "array" }
            }
          }
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}
```

### 3. Handle Tool Calls

When the AI wants to call a function (like search_jobs), we need to:

```typescript
async handleToolCalls(toolCalls: any[], userId: string) {
  const results = [];

  for (const toolCall of toolCalls) {
    if (toolCall.function.name === 'search_jobs') {
      const args = JSON.parse(toolCall.function.arguments);

      // Trigger AGI job search
      const jobService = new JobApplicationService();
      const result = await jobService.searchAndApply(userId);

      results.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        content: JSON.stringify({
          jobs_found: result.jobsFound,
          applications: result.applications.map(app => ({
            title: app.jobTitle,
            company: app.company,
            location: app.location
          }))
        })
      });
    }
  }

  return results;
}
```

### 4. Voice Call Integration

For voice calls, users call the Telnyx phone number directly, and the AI Assistant handles it automatically:

```typescript
// No need to initiate calls programmatically
// Users call the number, and Telnyx AI Assistant answers

// We just need to handle conversation events via webhooks
async handleConversationWebhook(payload: any) {
  const eventType = payload.event_type;

  switch (eventType) {
    case 'assistant.conversation.started':
      logger.info(`Conversation started: ${payload.conversation_id}`);
      break;

    case 'assistant.conversation.ended':
      logger.info(`Conversation ended: ${payload.conversation_id}`);
      break;

    case 'assistant.tool.call':
      // AI wants to call a tool
      const result = await this.handleToolCall(payload.tool_call);
      // Send result back to Telnyx
      await this.sendToolResult(payload.conversation_id, result);
      break;
  }
}
```

## Benefits of Proper Integration

1. **Automatic Voice Handling**: Telnyx handles all speech-to-text and text-to-speech
2. **Built-in Conversation Management**: No manual webhook processing
3. **Tool Integration**: AI can call our backend functions directly
4. **Better Voice Quality**: Uses professional TTS/STT models
5. **Multi-channel**: Same assistant works for voice AND text
6. **Less Code**: Let Telnyx handle the complexity

## Environment Variables Needed

```bash
# Telnyx AI Assistant
TELNYX_API_KEY=your_api_key
TELNYX_ASSISTANT_ID=asst_xxxxx  # Created via API or dashboard
TELNYX_PHONE_NUMBER=+1234567890  # For voice calls

# Backend URL for tool webhooks
BACKEND_URL=https://your-backend.com
```

## Implementation Priority

**Option 1: Quick Fix (Text Only)**
- Use Chat Completions API for dashboard chat
- Skip voice integration for now
- Still better than current implementation

**Option 2: Full Integration (Recommended)**
- Create AI Assistant via API
- Use Chat Completions for text
- Enable voice calls via assistant
- Implement tool calling for job search

## Recommendation

I recommend **Option 2** (Full Integration) because:
- It's what Telnyx is designed for
- Provides the best user experience
- Voice and text use the same AI brain
- Tool calling enables real automation
- Professional-grade voice quality

The current implementation with manual call control is overly complex and won't scale well.
