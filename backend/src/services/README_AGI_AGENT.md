# AGI Agent Service

This service provides a complete implementation of the AGI Agent Sessions API for browser automation.

## Overview

The `AGIAgentService` class implements all endpoints from the AGI Agent Sessions API:
- Session management (create, delete, status)
- Message sending and polling
- Execution control (pause, resume, cancel)
- Browser control (navigate, screenshot)
- Event streaming support

## Usage

### Basic Usage

```typescript
import { AGIAgentService } from './agiAgent.service';

const agentService = new AGIAgentService();

// Create a session
const session = await agentService.createSession({
  agent_name: 'agi-0',
  save_on_exit: false,
});

// Send a task
await agentService.sendMessage(
  session.session_id,
  'Find three nonstop SFO→JFK options next month under $450',
  'https://www.kayak.com/flights' // optional start URL
);

// Wait for completion
const result = await agentService.waitForCompletion(session.session_id);

// Clean up
await agentService.deleteSession(session.session_id);
```

### Advanced Usage

```typescript
// Navigate to a specific URL
await agentService.navigate(session.session_id, 'https://example.com');

// Take a screenshot
const screenshot = await agentService.getScreenshot(session.session_id);
console.log('Current page:', screenshot.title);
console.log('URL:', screenshot.url);

// Control execution
await agentService.pauseSession(session.session_id);
// ... do something ...
await agentService.resumeSession(session.session_id);

// Poll for messages
const messages = await agentService.pollMessages(session.session_id, 0);
messages.forEach(msg => {
  console.log(`[${msg.type}] ${msg.content}`);
});
```

### Using with AGIClient (Backward Compatible)

The existing `AGIClient` class has been updated to use `AGIAgentService` under the hood while maintaining the same interface:

```typescript
import { AGIClient } from './agiClient.service';

const client = new AGIClient();

// This still works as before
const result = await client.executeAction({
  url: 'https://example.com',
  task: 'search_jobs',
  instructions: 'Find software engineering jobs',
  data: {
    position: 'engineer',
    locations: ['San Francisco']
  }
});
```

### Direct Access to Agent Service

If you need direct access to the agent service for advanced features:

```typescript
const client = new AGIClient();
const agentService = client.getAgentService();

// Now you can use all agent service methods directly
const session = await agentService.createSession();
// ... etc
```

## Environment Variables

```env
# Required when not using mock mode
AGI_API_KEY=your_api_key_here

# Optional: Override API URL (defaults to https://api.agi.tech/v1)
AGI_API_URL=https://api.agi.tech/v1

# Set to 'true' to use mock responses (for development)
USE_MOCK_AGI=true
```

## Mock Mode

When `USE_MOCK_AGI=true`, the service returns mock responses without making actual API calls. This is useful for:
- Development and testing
- When you don't have API access yet
- Avoiding API costs during development

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const session = await agentService.createSession();
  // ... use session
} catch (error) {
  if (error.response) {
    // API error with response
    console.error('API Error:', error.response.status, error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## Message Types

The agent returns different message types:
- `THOUGHT` - Agent's reasoning or actions
- `QUESTION` - Questions requiring user input
- `DONE` - Task completion
- `ERROR` - Error notifications
- `LOG` - Additional context or debugging information

## Session Lifecycle

1. **Create** - Create a new session
2. **Send Message** - Give the agent a task
3. **Monitor** - Poll messages or wait for completion
4. **Control** (optional) - Pause, resume, or cancel
5. **Delete** - Clean up when done

## Best Practices

1. **Always clean up**: Delete sessions when done to avoid resource leaks
2. **Handle timeouts**: Use appropriate timeout values for long-running tasks
3. **Poll efficiently**: Use `waitForCompletion()` instead of manual polling when possible
4. **Error recovery**: Implement retry logic for transient errors
5. **Monitor status**: Check session status before sending new messages

## API Reference

For complete API documentation, see:
- [AGI Agent API Reference](https://api.agi.tech/docs)
- [Quickstart Guide](https://api.agi.tech/docs/quickstart)

