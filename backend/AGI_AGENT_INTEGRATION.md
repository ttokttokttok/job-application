# AGI Agent Integration

This document describes the AGI Agent integration that has been added to the project.

## What Was Created

### 1. Type Definitions (`src/types/agiAgent.ts`)
Complete TypeScript type definitions for all AGI Agent Sessions API endpoints:
- Session management types
- Message types
- Control operation types
- Browser control types
- Event streaming types

### 2. AGI Agent Service (`src/services/agiAgent.service.ts`)
Full implementation of the AGI Agent Sessions API with:
- ✅ Session creation and deletion
- ✅ Message sending and polling
- ✅ Status checking
- ✅ Execution control (pause, resume, cancel)
- ✅ Browser navigation
- ✅ Screenshot capture
- ✅ Wait for completion helper
- ✅ Poll messages helper
- ✅ Comprehensive error handling
- ✅ Mock mode support for development

### 3. Updated AGI Client (`src/services/agiClient.service.ts`)
Updated to use the new AGI Agent Service while maintaining **100% backward compatibility**:
- Existing `executeAction()` method still works
- Automatically creates sessions, sends messages, and waits for completion
- Handles session lifecycle automatically
- Falls back to mock mode when `USE_MOCK_AGI=true`

### 4. Documentation
- `src/services/README_AGI_AGENT.md` - Complete usage guide
- `src/services/agiAgent.example.ts` - Code examples
- Updated `README.md` with new API URL

## API Endpoints Implemented

All endpoints from the AGI Agent Sessions API are implemented:

| Endpoint | Method | Status |
|----------|--------|--------|
| `POST /sessions` | Create session | ✅ |
| `GET /sessions/{id}/status` | Get status | ✅ |
| `POST /sessions/{id}/message` | Send message | ✅ |
| `GET /sessions/{id}/messages` | Get messages | ✅ |
| `POST /sessions/{id}/pause` | Pause | ✅ |
| `POST /sessions/{id}/resume` | Resume | ✅ |
| `POST /sessions/{id}/cancel` | Cancel | ✅ |
| `POST /sessions/{id}/navigate` | Navigate | ✅ |
| `GET /sessions/{id}/screenshot` | Screenshot | ✅ |
| `DELETE /sessions/{id}` | Delete | ✅ |
| `GET /sessions/{id}/events` | SSE events | ⚠️ (Placeholder) |

## Environment Variables

Add these to your `.env` file:

```env
# AGI Agent API Configuration
AGI_API_KEY=your_api_key_here
AGI_API_URL=https://api.agi.tech/v1
USE_MOCK_AGI=true  # Set to false when ready to use real API
AGI_AGENT_NAME=agi-0-fast  # Use 'agi-0-fast' (default) to save Claude credits, or 'agi-0' for more capable agent
```

**Note on Agent Selection:**
- `agi-0-fast` (default): Faster and cheaper, perfect for web traversal and API operations. This saves Claude credits.
- `agi-0`: More capable but uses Claude, better for complex reasoning tasks.
- For web automation tasks (job search, applying), `agi-0-fast` is recommended to avoid using Claude credits.

## Usage

### Option 1: Use Existing AGIClient (Recommended)

No changes needed! Your existing code continues to work:

```typescript
const client = new AGIClient();
const result = await client.executeAction({
  url: 'https://example.com',
  task: 'search_jobs',
  instructions: 'Find software engineering jobs',
  data: { position: 'engineer', locations: ['SF'] }
});
```

### Option 2: Use AGIAgentService Directly (Advanced)

For more control, use the agent service directly:

```typescript
import { AGIAgentService } from './services/agiAgent.service';

const agent = new AGIAgentService();
const session = await agent.createSession();
await agent.sendMessage(session.session_id, 'Your task here');
const result = await agent.waitForCompletion(session.session_id);
await agent.deleteSession(session.session_id);
```

## Mock Mode

When `USE_MOCK_AGI=true`, the service returns mock responses without making API calls. This is perfect for:
- Development and testing
- When you don't have API access yet
- Avoiding API costs during development

## Migration Guide

### No Migration Needed!

The existing code continues to work without any changes. The `AGIClient` class now uses the new AGI Agent Sessions API under the hood.

### When Ready to Use Real API

1. Get your API key from https://api.agi.tech
2. Set `AGI_API_KEY` in `.env`
3. Set `USE_MOCK_AGI=false` in `.env`
4. Test with a simple task first

## Features

### Automatic Session Management
- Sessions are created automatically for each task
- Sessions are cleaned up after completion
- Error handling ensures cleanup even on failures

### Smart Message Building
- Automatically formats instructions and data into agent messages
- Includes context from task parameters
- Handles different task types appropriately

### Result Parsing
- Extracts structured results from agent messages
- Maintains backward compatibility with existing response format
- Handles different message types (THOUGHT, DONE, ERROR, etc.)

### Error Handling
- Comprehensive error handling at all levels
- Automatic session cleanup on errors
- Detailed logging for debugging

## Testing

The integration includes:
- Mock mode for testing without API access
- Example code in `agiAgent.example.ts`
- Comprehensive error handling
- Type safety with TypeScript

## Next Steps

1. **Test in Mock Mode**: Verify everything works with `USE_MOCK_AGI=true`
2. **Get API Access**: Sign up at https://api.agi.tech
3. **Test Real API**: Set `USE_MOCK_AGI=false` and test with a simple task
4. **Monitor Usage**: Watch for any issues or improvements needed

## Support

- API Documentation: https://api.agi.tech/docs
- Quickstart Guide: https://api.agi.tech/docs/quickstart
- Service Documentation: `src/services/README_AGI_AGENT.md`
- Examples: `src/services/agiAgent.example.ts`

## Notes

- The SSE (Server-Sent Events) endpoint is not fully implemented yet. Use `pollMessages()` or `waitForCompletion()` instead.
- Session cleanup is automatic, but you can also manage sessions manually if needed.
- The service includes comprehensive logging for debugging.

