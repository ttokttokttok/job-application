# API Reference

> Complete reference for the AGI Agent Sessions API.

## Overview

The AGI Agent is a productivity assistant that can take actions and make purchases on behalf of users. The API allows you to create browser agent sessions to perform tasks such as:

* Internet research
* Filling out forms
* Making purchases with guest checkout
* General web automation

Our clients use the API across many domains, including agentic commerce, GTM research, sales, marketing, and productivity.

## Base URL

All API requests should be made to:

```
https://api.agi.tech/v1
```

## Authentication

All API endpoints require authentication using a Bearer token. Include your API key in the `Authorization` header of every request:

```bash  theme={null}
Authorization: Bearer <AGI_API_KEY>
Content-Type: application/json
```

<Warning>
  If authentication fails, endpoints will return 401 or 403 status codes.
</Warning>

## Getting Started

1. **Create a session** - Start by creating a new agent session
2. **Send a message** - Give the agent a task by sending a message
3. **Monitor progress** - Poll for status updates or stream events in real-time
4. **Control execution** - Pause, resume, or cancel tasks as needed
5. **Clean up** - Delete the session when you're done

<Card title="Quickstart Guide" icon="rocket" href="/api-reference/quickstart">
  Follow our step-by-step guide to get started
</Card>

## Key Concepts

### Sessions

A session represents a single browser environment with an agent. Each session has its own isolated browser state and can execute one task at a time.

### Agent Models

Different agent models are available with varying capabilities and performance characteristics:

* `agi-0` - Default agent model with full capabilities
* `agi-0-fast` - Optimized for faster response times

### Message Types

The agent communicates through structured messages:

* `THOUGHT` - Agent's reasoning or actions
* `QUESTION` - Questions requiring user input
* `DONE` - Task completion
* `ERROR` - Error notifications
* `LOG` - Additional context or debugging information

### Session Status vs Execution Status

* **Session Status**: Lifecycle state (`initializing`, `ready`, `running`, `paused`, `completed`, `error`, `terminated`)
* **Execution Status**: Current task state (`running`, `waiting_for_input`, `finished`, `error`)

## Interaction Patterns

### Polling

Use the `/messages` endpoint with the `after_id` parameter to poll for new messages:

```bash  theme={null}
GET /v1/sessions/{session_id}/messages?after_id=0
```

### Server-Sent Events (SSE)

For real-time updates, connect to the `/events` endpoint:

```bash  theme={null}
GET /v1/sessions/{session_id}/events
Accept: text/event-stream
```

## Risk Prevention

* All clients have rate limits to prevent abuse
* Our agent screens for abusive behavior or malicious intent before executing commands
* Secure 1-time-use payment tokens are recommended for purchases

## Support

For issues or questions, please contact our support team or refer to the detailed endpoint documentation below.

# Quickstart

> Get started with the AGI Agent Sessions API in under 5 minutes.

## Quick Example

Here's a complete example of creating a session, sending a task, and monitoring its progress:

```bash  theme={null}
# Set your API key
export AGI_API_KEY="your_api_key_here"

# 1. Create a session
curl -X POST https://api.agi.tech/v1/sessions \
  -H "Authorization: Bearer $AGI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"agi-0"}'

# Response: {"session_id":"f6a7b0e6-7f46-4a0d-9a47-92b7f0a4d2d3", ...}

# 2. Send a message to start a task
curl -X POST https://api.agi.tech/v1/sessions/<session_id>/message \
  -H "Authorization: Bearer $AGI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Find three nonstop SFO→JFK options next month under $450"}'

# 3. Check execution status
curl https://api.agi.tech/v1/sessions/<session_id>/status \
  -H "Authorization: Bearer $AGI_API_KEY"

# 4. Poll for messages
curl "https://api.agi.tech/v1/sessions/<session_id>/messages?after_id=0" \
  -H "Authorization: Bearer $AGI_API_KEY"

# 5. Delete the session when done
curl -X DELETE https://api.agi.tech/v1/sessions/<session_id> \
  -H "Authorization: Bearer $AGI_API_KEY"
```

## Step-by-Step Guide

<Steps>
  <Step title="Get your API key">
    Contact the AGI team to obtain your API key. Store it securely as it provides access to create and manage agent sessions.
  </Step>

  <Step title="Create a session">
    Start by creating a new agent session. You can optionally specify an agent model:

    ```bash  theme={null}
    curl -X POST https://api.agi.tech/v1/sessions \
      -H "Authorization: Bearer $AGI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "agent_name": "agi-0"
      }'
    ```

    The response includes a `session_id` and `vnc_url` to view the browser:

    ```json  theme={null}
    {
      "session_id": "f6a7b0e6-7f46-4a0d-9a47-92b7f0a4d2d3",
      "vnc_url": "https://...",
      "agent_name": "agi-0",
      "status": "ready",
      "created_at": "2025-10-05T18:04:34.281Z"
    }
    ```

    <Tip>
      Open the `vnc_url` in a browser to watch the agent work in real-time!
    </Tip>
  </Step>

  <Step title="Send a task message">
    Give the agent a task by sending a message:

    ```bash  theme={null}
    curl -X POST https://api.agi.tech/v1/sessions/<session_id>/message \
      -H "Authorization: Bearer $AGI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "message": "Search for the top 3 articles about AI agents and summarize them"
      }'
    ```

    The agent will begin executing your task immediately.
  </Step>

  <Step title="Monitor progress">
    You have two options for monitoring progress:

    **Option A: Polling** (Simple)

    Poll the `/messages` endpoint periodically:

    ```bash  theme={null}
    curl "https://api.agi.tech/v1/sessions/<session_id>/messages?after_id=0" \
      -H "Authorization: Bearer $AGI_API_KEY"
    ```

    Track the highest `id` you've seen and use it as `after_id` in the next poll.

    **Option B: Server-Sent Events** (Real-time)

    Connect to the event stream for real-time updates:

    ```bash  theme={null}
    curl -N https://api.agi.tech/v1/sessions/<session_id>/events \
      -H "Authorization: Bearer $AGI_API_KEY" \
      -H "Accept: text/event-stream"
    ```
  </Step>

  <Step title="Respond to questions">
    If the agent asks a question (message type `QUESTION`), respond using the same `/message` endpoint:

    ```bash  theme={null}
    curl -X POST https://api.agi.tech/v1/sessions/<session_id>/message \
      -H "Authorization: Bearer $AGI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"message":"Yes, evening flights are preferred"}'
    ```
  </Step>

  <Step title="Clean up">
    When the task is complete or you want to stop, delete the session:

    ```bash  theme={null}
    curl -X DELETE https://api.agi.tech/v1/sessions/<session_id> \
      -H "Authorization: Bearer $AGI_API_KEY"
    ```
  </Step>
</Steps>

## Python Client Example

Here's a minimal Python client implementation:

```python  theme={null}
import time
import requests

BASE_URL = "https://api.agi.tech/v1"
API_KEY = "your_api_key_here"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_session(agent_name="agi-0"):
    r = requests.post(
        f"{BASE_URL}/sessions",
        headers=HEADERS,
        json={"agent_name": agent_name},
        timeout=20
    )
    r.raise_for_status()
    return r.json()["session_id"]

def send_message(session_id, text):
    r = requests.post(
        f"{BASE_URL}/sessions/{session_id}/message",
        headers=HEADERS,
        json={"message": text},
        timeout=30
    )
    r.raise_for_status()
    return r.json()

def get_status(session_id):
    r = requests.get(
        f"{BASE_URL}/sessions/{session_id}/status",
        headers=HEADERS,
        timeout=20
    )
    r.raise_for_status()
    return r.json()["status"]

def poll_messages(session_id, after_id=0):
    r = requests.get(
        f"{BASE_URL}/sessions/{session_id}/messages",
        headers=HEADERS,
        params={"after_id": after_id},
        timeout=60
    )
    r.raise_for_status()
    data = r.json()

    # Track highest message ID
    for msg in data.get("messages", []):
        after_id = max(after_id, msg["id"])

    return after_id, data

def delete_session(session_id):
    r = requests.delete(
        f"{BASE_URL}/sessions/{session_id}",
        headers=HEADERS,
        timeout=20
    )
    r.raise_for_status()
    return r.json()

# Main execution
if __name__ == "__main__":
    session_id = create_session()
    print(f"Created session: {session_id}")

    try:
        # Start a task
        send_message(
            session_id,
            "Find three nonstop SFO→JFK options next month under $450"
        )

        # Poll for updates
        after_id = 0
        while True:
            status = get_status(session_id)
            after_id, data = poll_messages(session_id, after_id)

            # Print new messages
            for msg in data.get("messages", []):
                print(f"[{msg['type']}] #{msg['id']}: {msg['content']}")

            # Check if done
            if status in ("finished", "error"):
                break

            time.sleep(1)

    finally:
        # Clean up
        delete_session(session_id)
        print("Session deleted")
```

## Additional Operations

### Control Execution

Pause, resume, or cancel a running task:

```bash  theme={null}
# Pause
curl -X POST https://api.agi.tech/v1/sessions/<session_id>/pause \
  -H "Authorization: Bearer $AGI_API_KEY"

# Resume
curl -X POST https://api.agi.tech/v1/sessions/<session_id>/resume \
  -H "Authorization: Bearer $AGI_API_KEY"

# Cancel
curl -X POST https://api.agi.tech/v1/sessions/<session_id>/cancel \
  -H "Authorization: Bearer $AGI_API_KEY"
```

### Navigate Browser

Manually navigate the browser to a specific URL:

```bash  theme={null}
curl -X POST https://api.agi.tech/v1/sessions/<session_id>/navigate \
  -H "Authorization: Bearer $AGI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.example.com"}'
```

### Take Screenshot

Get a base64-encoded screenshot of the current browser state:

```bash  theme={null}
curl https://api.agi.tech/v1/sessions/<session_id>/screenshot \
  -H "Authorization: Bearer $AGI_API_KEY"
```

## Next Steps

<CardGroup cols={2}>
  <Card title="API Reference" icon="book" href="/api-reference/introduction">
    Explore all available endpoints and parameters
  </Card>

  <Card title="Authentication" icon="key" href="/api-reference/introduction#authentication">
    Learn about API authentication
  </Card>

  <Card title="Error Handling" icon="triangle-exclamation" href="/guides/best-practices/error-handling">
    Understand error responses and handling
  </Card>

  <Card title="Best Practices" icon="lightbulb" href="/guides/best-practices/session-management">
    Tips for optimal API usage
  </Card>
</CardGroup>

# Webhooks

> Receive real-time notifications about session lifecycle events and task execution status.

## Overview

The Create Sessions API supports webhook notifications to receive real-time updates about session lifecycle events and task execution status. When you provide a `webhook_url` during session creation, the system will automatically send HTTP POST requests to your endpoint when specific events occur.

## Configuration

### Request Parameter

When creating a session via `POST /v1/sessions`, you can optionally include a `webhook_url` parameter:

```json  theme={null}
{
  "agent_name": "agi-0",
  "webhook_url": "https://your-server.com/webhooks/sessions"
}
```

### Validation

* The webhook URL must be a valid HTTP or HTTPS URL
* Maximum length: 2,000 characters
* Must start with `http://` or `https://`

## How It Works

### 1. Session Creation

When you create a session with a `webhook_url`:

1. The webhook URL is stored with the session record
2. A `session.created` webhook is immediately triggered (non-blocking)
3. The session creation API returns immediately without waiting for webhook delivery

### 2. Background Monitoring

After a message is sent to the agent (via `POST /v1/sessions/{session_id}/message`), the system starts a background task that monitors the agent's event stream. This monitoring:

* Runs independently of any active SSE connections
* Automatically triggers webhooks for terminal events
* Stops monitoring after receiving a terminal event (`done`, `question`, or `error`)

### 3. Webhook Delivery

Webhooks are delivered asynchronously using a fire-and-forget pattern:

* **Non-blocking**: Webhook failures never block session operations
* **Automatic retries**: Failed webhooks are retried up to 3 times with exponential backoff
* **Timeout**: Each webhook attempt has a 10-second timeout
* **Total retry window**: Maximum 30 seconds for all retry attempts

## Webhook Events

### Session Lifecycle Events

#### `session.created`

Triggered immediately after a session is successfully created.

**Payload:**

```json  theme={null}
{
  "event": "session.created",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  }
}
```

#### `session.status_changed`

Triggered when a session's status changes (e.g., paused, resumed, cancelled).

**Payload:**

```json  theme={null}
{
  "event": "session.status_changed",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "paused",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  },
  "old_status": "running",
  "new_status": "paused"
}
```

#### `session.deleted`

Triggered when a session is deleted.

**Payload:**

```json  theme={null}
{
  "event": "session.deleted",
  "timestamp": "2024-01-15T11:00:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  }
}
```

### Task Execution Events

#### `task.started`

Triggered when a task starts (after sending a message to the agent).

**Payload:**

```json  theme={null}
{
  "event": "task.started",
  "timestamp": "2024-01-15T10:32:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "running",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  },
  "message": "Navigate to example.com and click the login button"
}
```

#### `task.completed`

Triggered when a task completes successfully.

**Payload:**

```json  theme={null}
{
  "event": "task.completed",
  "timestamp": "2024-01-15T10:40:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  },
  "result": {
    "status": "success",
    "message": "Task completed successfully"
  }
}
```

#### `task.question`

Triggered when the agent needs user input to proceed.

**Payload:**

```json  theme={null}
{
  "event": "task.question",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  },
  "question": "Which email address should I use for login?",
  "context": {}
}
```

#### `task.error`

Triggered when a task encounters an error.

**Payload:**

```json  theme={null}
{
  "event": "task.error",
  "timestamp": "2024-01-15T10:38:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "agent_name": "agi-0",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vnc_url": "http://vnc-instance:5900"
  },
  "error": "Failed to locate element: button.login",
  "details": {}
}
```

## Webhook Request Format

All webhook requests are sent as HTTP POST requests with the following characteristics:

### Headers

```
Content-Type: application/json
X-Event-Type: {event_type}
User-Agent: AgencyAPI-Webhooks/1.0
```

### Body

The request body is a JSON object containing:

* `event`: The event type (e.g., "session.created", "task.completed")
* `timestamp`: ISO 8601 timestamp in UTC
* `session`: Session metadata object
* Additional event-specific data fields

## Implementation Details

### Retry Logic

The webhook client implements automatic retry with exponential backoff:

* **Initial attempt**: Immediate
* **Retry attempts**: Up to 2 additional attempts
* **Backoff strategy**: Exponential (doubles wait time between retries)
* **Maximum retry window**: 30 seconds total
* **Retry triggers**: Network timeouts, HTTP errors, connection failures

### Error Handling

* Webhook failures are logged but **never** raise exceptions
* Session operations continue normally even if webhooks fail
* Failed webhooks are logged with error details for debugging
* After all retries are exhausted, the failure is logged and the system moves on

### Background Processing

* Webhooks are triggered using `asyncio.create_task()` for non-blocking execution
* The `trigger_webhook_background()` method returns immediately
* Webhook delivery happens asynchronously without blocking the API response

## Best Practices

### Webhook Endpoint Implementation

Your webhook endpoint should:

1. **Respond quickly**: Return a 200 status code within 5 seconds
2. **Be idempotent**: Handle duplicate webhook deliveries gracefully
3. **Validate requests**: Verify the request format and required fields
4. **Log events**: Store webhook events for debugging and auditing
5. **Handle failures**: Implement proper error handling and logging

### Example Webhook Handler

```python  theme={null}
from fastapi import FastAPI, Request, HTTPException
import httpx

app = FastAPI()

@app.post("/webhooks/sessions")
async def handle_session_webhook(request: Request):
    try:
        payload = await request.json()
        event_type = payload.get("event")
        session_id = payload.get("session", {}).get("id")
        
        # Process the webhook event
        if event_type == "session.created":
            # Handle session creation
            pass
        elif event_type == "task.completed":
            # Handle task completion
            pass
        # ... handle other event types
        
        # Return 200 to acknowledge receipt
        return {"status": "received"}
    except Exception as e:
        # Log error but return 200 to prevent retries
        # (or return 500 if you want retries)
        return {"status": "error", "message": str(e)}
```

### Security Considerations

* **HTTPS**: Always use HTTPS endpoints for webhook URLs
* **Authentication**: Consider implementing webhook signature verification
* **Rate limiting**: Be prepared to handle multiple webhooks in quick succession
* **Validation**: Validate webhook payloads before processing

## Monitoring

The system logs webhook delivery attempts with the following log events:

* `webhook_delivered`: Successful webhook delivery
* `webhook_retry`: Retry attempt (with attempt number and wait time)
* `webhook_failed_permanently`: All retries exhausted
* `webhook_notification_error`: Unexpected error during webhook processing

You can monitor these logs to track webhook delivery status and troubleshoot issues.

## Example Usage

### Creating a Session with Webhooks

```python  theme={null}
import requests

# Create session with webhook URL
response = requests.post(
    "https://api.agi.tech/v1/sessions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "agent_name": "agi-0",
        "webhook_url": "https://your-server.com/webhooks/sessions"
    }
)

session = response.json()
print(f"Session created: {session['session_id']}")
```

### Handling Webhook Events

```python  theme={null}
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/sessions', methods=['POST'])
def handle_webhook():
    payload = request.json
    event_type = payload.get('event')
    session_id = payload.get('session', {}).get('id')
    
    if event_type == 'session.created':
        print(f"Session {session_id} created")
    elif event_type == 'task.completed':
        print(f"Task completed for session {session_id}")
        # Process results, update database, etc.
    elif event_type == 'task.question':
        question = payload.get('question')
        print(f"Agent asking: {question}")
        # Notify user, queue for response, etc.
    elif event_type == 'task.error':
        error = payload.get('error')
        print(f"Task error: {error}")
        # Log error, notify admins, etc.
    
    return jsonify({'status': 'received'}), 200
```

## Related Documentation

<CardGroup cols={2}>
  <Card title="Create Session" icon="plus" href="/api-reference/endpoints/create-session">
    Learn how to create sessions with webhook URLs
  </Card>

  <Card title="Stream Events" icon="signal" href="/api-reference/endpoints/stream-events">
    Alternative real-time event delivery via SSE
  </Card>
</CardGroup>
