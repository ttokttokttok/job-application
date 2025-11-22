# JobAgent - Human-in-the-Loop Implementation Summary

## Overview

This document summarizes the changes made to implement a conversational, human-in-the-loop workflow for the JobAgent application. The agent now guides users through the entire job hunting process via an AI chatbot interface with optional voice integration.

## Key Changes

### 1. New Workflow

**Before:**
- Resume upload → Profile form → Dashboard → Manual "Start Job Search" button → Manual "Reach Out" button

**After:**
- Resume upload → Dashboard with AI chatbot → Conversational job search with human approval at each step

### 2. Architecture Changes

#### Backend

**New Services:**
- `telnyxAgent.service.ts` - Telnyx voice/SMS integration
- `conversation.service.ts` - Orchestrates conversational workflow with Claude AI

**New Routes:**
- `/api/agent/*` - Agent conversation endpoints
- `/api/webhooks/*` - AGI webhook handlers for async updates

**Updated Data Models:**
- Added `ConversationMessage` - Tracks chat history
- Added `ConversationState` - Tracks user's progress through workflow
- Added `AGIWebhookEvent` - Handles AGI async notifications

**Data Store Updates:**
- Added conversation message storage
- Added conversation state persistence
- New JSON files: `conversations.json`, `conversation_states.json`

#### Frontend

**New Components:**
- `NewDashboard.tsx` - Main chatbot interface with split-pane design
  - Left: Chat messages with agent
  - Right: Applications sidebar

**Updated Flow:**
- Resume upload now redirects directly to Dashboard
- Dashboard initializes conversation automatically
- All interactions happen through chat

### 3. Conversation Stages

The agent guides users through these stages:

1. **profile_collection** - Gather job preferences (position, locations, current location)
2. **job_search** - Search for jobs using AGI API
3. **job_review** - Present jobs, get user approval on which to apply
4. **cover_letter_review** - Generate & review cover letters with user
5. **application** - Submit approved applications
6. **networking_search** - Find people at companies
7. **networking_review** - Get user approval on contacts to reach out to
8. **networking_message_review** - Review & approve outreach messages
9. **complete** - Workflow complete

### 4. Human-in-the-Loop Points

**Job Selection:**
- Agent finds jobs and presents them in chat
- User selects which jobs to apply to: "all", "1 and 3", "none", etc.

**Cover Letter Approval:**
- Agent generates custom cover letters
- Shows them one by one for review
- User can approve, customize, or regenerate

**Networking Contacts:**
- Agent finds employees at target companies
- Presents list with details (name, title, connection degree)
- User selects who to reach out to

**Message Customization:**
- Agent drafts personalized messages
- User reviews and can edit before sending
- Approval required before sending

### 5. API Integration

**Telnyx (Optional):**
- Voice call support for talking to the agent
- SMS support for text-based interaction
- Webhooks for handling call events

**AGI API:**
- Webhooks now supported for async task updates
- Agent receives notifications when tasks complete
- Can notify user via chat when jobs are found, etc.

**Claude API:**
- Powers conversational intelligence
- Extracts job preferences from natural language
- Generates cover letters and networking messages

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── telnyxAgent.service.ts       # NEW: Telnyx integration
│   │   ├── conversation.service.ts      # NEW: Conversation orchestration
│   │   ├── [existing services...]
│   │
│   ├── routes/
│   │   ├── agent.routes.ts              # NEW: Agent endpoints
│   │   ├── webhooks.routes.ts           # NEW: Webhook handlers
│   │   ├── [existing routes...]
│   │
│   ├── types/
│   │   └── models.ts                    # UPDATED: New interfaces
│   │
│   ├── data/
│   │   └── store.ts                     # UPDATED: Conversation methods
│   │
│   └── server.ts                        # UPDATED: New routes
│
├── data/                                # NEW JSON files created
│   ├── conversations.json
│   └── conversation_states.json
│
└── .env.example                         # UPDATED: Telnyx vars

frontend/
├── src/
│   ├── pages/
│   │   ├── NewDashboard.tsx             # NEW: Chatbot interface
│   │   ├── ResumeUpload.tsx             # UPDATED: Direct to dashboard
│   │   └── [existing pages...]
│   │
│   ├── types/
│   │   └── models.ts                    # UPDATED: Conversation types
│   │
│   ├── api/
│   │   └── client.ts                    # UPDATED: Agent endpoints
│   │
│   └── App.tsx                          # UPDATED: NewDashboard route
```

## Environment Variables

### New Variables (`.env`)

```bash
# Telnyx API (Optional - for voice/SMS)
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_API_URL=https://api.telnyx.com/v2
TELNYX_AGENT_ID=your_agent_id
TELNYX_PHONE_NUMBER=+1234567890

# Backend URL (for webhooks)
BACKEND_URL=http://localhost:3000
```

## API Endpoints

### New Endpoints

#### Agent Conversation
- `POST /api/agent/message` - Send message to agent
- `GET /api/agent/conversation/:userId` - Get conversation history
- `DELETE /api/agent/conversation/:userId` - Clear conversation
- `POST /api/agent/initialize` - Initialize new conversation

#### Voice Integration
- `POST /api/agent/voice/call` - Start voice call
- `POST /api/agent/voice-webhook` - Telnyx voice webhooks
- `POST /api/agent/sms-webhook` - Telnyx SMS webhooks

#### Webhooks
- `POST /api/webhooks/agi` - AGI task completion webhooks
- `GET /api/webhooks/agi/:sessionId` - Get webhook events (debug)

## User Experience Flow

### 1. Upload Resume
```
User uploads PDF/DOCX → Claude parses → Redirects to Dashboard
```

### 2. Conversation Starts
```
Agent: "Hi! I've received your resume. What type of position are you looking for?"
User: "software engineer"
Agent: "Great! What locations are you interested in?"
User: "San Francisco, Remote"
Agent: "Perfect! What's your current location?"
User: "San Francisco"
```

### 3. Job Search
```
Agent: "Let me search for jobs... [searching]"
Agent: "I found 5 jobs! Here they are:
       1. Senior SWE at Google - $200k
       2. SWE at Meta - $180k
       ...
       Which would you like to apply to?"
User: "1, 2, and 4"
```

### 4. Cover Letter Review
```
Agent: "Here's a cover letter for Google:
       [shows letter]
       What do you think?"
User: "Looks good!"
Agent: "Great! Here's the one for Meta..."
```

### 5. Application Submission
```
Agent: "I'm submitting your applications now..."
Agent: "Done! All 3 applications submitted.
       Would you like me to reach out to people at these companies?"
User: "Yes"
```

### 6. Networking
```
Agent: "I found 8 people who work at these companies.
       Here are some at Google:
       - Sarah Chen, Staff ML Engineer, 1st connection
       - John Doe, Senior SWE, 2nd connection
       Who should I reach out to?"
User: "Sarah and John"

Agent: "Here's the message I'll send to Sarah:
       [shows message]
       Sound good?"
User: "Yes"
```

## Testing the Implementation

### Backend Testing

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run backend
npm run dev
```

### Frontend Testing

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Run frontend
npm run dev
```

### Test Workflow

1. Navigate to `http://localhost:5173`
2. Upload a resume (PDF or DOCX)
3. You should be redirected to the Dashboard with a greeting
4. Chat with the agent:
   - Answer questions about job preferences
   - Review job listings
   - Approve cover letters
   - Select networking contacts
   - Approve messages

## Mock Mode

For development without AGI API access, set `USE_MOCK_AGI=true` in `.env`. The system will return mock job data instead of making real API calls.

## Voice Integration (Optional)

To enable voice chat:

1. Sign up for Telnyx account
2. Get API key and phone number
3. Configure webhook URLs in Telnyx dashboard:
   - Voice: `https://your-backend.com/api/agent/voice-webhook`
   - SMS: `https://your-backend.com/api/agent/sms-webhook`
4. Set environment variables in `.env`
5. User can click "Voice Call" button in Dashboard

## Production Deployment

### Backend
- Deploy to Railway, Render, or Heroku
- Set all environment variables
- Ensure webhook URLs are publicly accessible for AGI and Telnyx

### Frontend
- Deploy via Lovable or Vercel
- Set `VITE_API_URL` to production backend URL

## Future Enhancements

1. **Persistent Storage**: Migrate from JSON files to PostgreSQL/MongoDB
2. **Real-time Updates**: Add WebSocket support for live agent updates
3. **Voice Transcription**: Real-time speech-to-text during voice calls
4. **Multi-user Support**: Add authentication and user management
5. **Analytics Dashboard**: Track success rates, response times, etc.
6. **Email Integration**: Send follow-up emails automatically
7. **Calendar Integration**: Schedule coffee chats directly

## Known Limitations

1. JSON file storage not suitable for production scale
2. No user authentication (single user app currently)
3. Voice integration requires Telnyx subscription
4. AGI API required for actual job searching (mock mode for testing)
5. No retry logic for failed API calls
6. No rate limiting on endpoints

## Troubleshooting

### Agent not responding
- Check ANTHROPIC_API_KEY is set
- Check backend logs for errors
- Verify conversation state in `data/conversation_states.json`

### Jobs not found
- If `USE_MOCK_AGI=true`, mock data will be returned
- If using real AGI, check AGI_API_KEY and webhook URL
- Check AGI session status via logs

### Voice calls failing
- Verify TELNYX_API_KEY is set
- Check webhook URLs are publicly accessible
- Review Telnyx dashboard for call logs

## Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check frontend console in browser
3. Review conversation state: `backend/data/conversation_states.json`
4. Check AGI webhook events: `GET /api/webhooks/agi/:sessionId`

---

**Note**: This implementation provides the foundation for a conversational job hunting assistant. The conversation service can be extended to handle more complex scenarios and edge cases as needed.
