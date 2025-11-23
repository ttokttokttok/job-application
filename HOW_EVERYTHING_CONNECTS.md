# How Everything Connects - Complete Flow Diagram

## 🎯 The Big Picture

```
USER → Frontend (React) → Backend (Express) → External APIs
                                              ↓
                                    - Telnyx/Claude (LLM)
                                    - AGI (Browser Automation)
```

## 📊 Complete Data Flow

### 1. Resume Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER UPLOADS RESUME                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: ResumeUpload.tsx                                      │
│ - User selects PDF/DOCX file                                   │
│ - handleUpload() calls apiClient.uploadResume(file)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    POST /api/resume/upload
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: resume.routes.ts                                       │
│ - Receives file upload                                         │
│ - Extracts text from PDF/DOCX                                  │
│ - Calls ResumeParserService.parseResume(text)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ResumeParserService                                             │
│ - Sends resume text to Claude API                              │
│ - Gets structured JSON back:                                   │
│   {                                                             │
│     fullName, email, phone,                                     │
│     workExperience[], education[], skills[]                     │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: ResumeUpload.tsx                                      │
│ - Receives parsed data                                         │
│ - Generates userId (if new user)                               │
│ - Stores profileData in localStorage                           │
│ - Calls apiClient.initializeConversation(userId, profileData)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   POST /api/agent/initialize
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: agent.routes.ts                                        │
│ - Calls ConversationService.initializeConversation()            │
│ - Creates initial ConversationState:                            │
│   {                                                             │
│     userId, stage: 'profile_collection',                        │
│     profileData: { parsed resume data }                         │
│   }                                                             │
│ - Saves state to conversation_states.json                       │
│ - Returns greeting message                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: ResumeUpload.tsx                                      │
│ - Redirects to /dashboard                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: NewDashboard.tsx                                      │
│ - Component mounts                                              │
│ - initializeDashboard() runs                                   │
│ - Loads conversation history                                   │
│ - Displays greeting from agent                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Conversation Flow (Profile Collection Stage)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER IN DASHBOARD                            │
│ Dashboard shows: "Hi! What type of position are you looking    │
│                  for?"                                          │
│ User types: "software engineer"                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: NewDashboard.tsx                                      │
│ - handleSendMessage() called                                   │
│ - Calls apiClient.sendMessage(userId, "software engineer")     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    POST /api/agent/message
                    { userId, message: "software engineer" }
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: agent.routes.ts                                        │
│ - Receives message                                              │
│ - Calls ConversationService.processMessage(userId, message)     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConversationService.processMessage()                            │
│                                                                 │
│ 1. Load conversation state from DB                              │
│    → DataStore.getConversationState(userId)                     │
│    → Returns: { stage: 'profile_collection', ... }             │
│                                                                 │
│ 2. Load conversation history                                   │
│    → DataStore.getConversationMessages(userId)                  │
│    → Returns: [previous messages]                              │
│                                                                 │
│ 3. Save user's message                                         │
│    → DataStore.saveConversationMessage({                        │
│        userId, role: 'user',                                    │
│        content: "software engineer"                             │
│      })                                                         │
│    → Saved to conversations.json                               │
│                                                                 │
│ 4. Route to appropriate handler based on stage                 │
│    → Since stage = 'profile_collection'                         │
│    → Call handleProfileCollection(state, message, history)     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConversationService.handleProfileCollection()                   │
│                                                                 │
│ 1. Check what's missing from profile                           │
│    profile.desiredPosition = undefined ✓ (will extract from msg)│
│    profile.locations = undefined ✗ (still need to ask)         │
│    profile.currentLocation = undefined ✗ (still need to ask)   │
│                                                                 │
│ 2. Build prompt for LLM:                                       │
│    "You are a job search assistant.                            │
│     User said: 'software engineer'                             │
│     Extract preferences and ask for locations next"            │
│                                                                 │
│ 3. Call LLM (Telnyx or Claude):                                │
│    IF USE_TELNYX_CHAT=true:                                    │
│      → TelnyxChatService.createChatCompletion()                │
│      → POST https://api.telnyx.com/v2/ai/chat/completions      │
│      → { model: "anthropic/claude-3.5-sonnet", messages: [...] }│
│    ELSE:                                                        │
│      → Claude API directly                                     │
│      → Anthropic.messages.create()                             │
│                                                                 │
│ 4. LLM returns:                                                │
│    "Great! You're looking for software engineer roles.         │
│     What locations are you interested in?"                     │
│                                                                 │
│ 5. Extract data from user message:                             │
│    → Call LLM again with extraction prompt                     │
│    → Returns: { desiredPosition: "software engineer" }         │
│    → Update profile.desiredPosition = "software engineer"      │
│                                                                 │
│ 6. Return response to caller                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConversationService.processMessage() (continued)                │
│                                                                 │
│ 7. Save assistant's response                                   │
│    → DataStore.saveConversationMessage({                        │
│        userId, role: 'assistant',                               │
│        content: "Great! What locations..."                      │
│      })                                                         │
│                                                                 │
│ 8. Update conversation state                                   │
│    → state.profileData.desiredPosition = "software engineer"   │
│    → state.lastUpdated = new Date()                            │
│    → DataStore.saveConversationState(state)                     │
│    → Saved to conversation_states.json                         │
│                                                                 │
│ 9. Return to route handler                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: agent.routes.ts                                        │
│ - Returns JSON response:                                       │
│   {                                                             │
│     success: true,                                              │
│     response: "Great! What locations...",                       │
│     state: { stage: 'profile_collection', ... },               │
│     metadata: {}                                                │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: NewDashboard.tsx                                      │
│ - Receives response                                             │
│ - Creates assistant message object                             │
│ - Adds to messages state                                       │
│ - UI updates to show agent's reply                             │
│ - User sees: "Great! What locations are you interested in?"    │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Job Search Flow (After Profile Complete)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER: "San Francisco and Remote"                               │
│ (This completes profile: position + locations + current loc)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        [Same message flow as above...]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConversationService.handleProfileCollection()                   │
│                                                                 │
│ 1. Check profile completeness:                                 │
│    ✓ desiredPosition = "software engineer"                     │
│    ✓ locations = ["San Francisco", "Remote"]                  │
│    ✓ currentLocation = "San Francisco"                         │
│    ALL COMPLETE!                                                │
│                                                                 │
│ 2. Change stage to 'job_search'                                │
│                                                                 │
│ 3. Return response:                                            │
│    "Great! Let me search for jobs... This will take a moment..." │
│                                                                 │
│ 4. Set metadata.pendingAction = 'job_search'                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: NewDashboard.tsx                                      │
│ - Receives response with state.stage = 'job_search'            │
│ - Shows agent's message                                        │
│ - (Frontend could trigger job search, or backend does it       │
│   automatically in next processMessage call)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        [User sends next message or auto-triggered]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConversationService.handleJobSearch()                           │
│                                                                 │
│ 1. Save profile to database                                    │
│    → profile.id = userId                                       │
│    → DataStore.saveProfile(profile)                             │
│    → Saved to profiles.json                                    │
│                                                                 │
│ 2. Trigger job search                                          │
│    → JobApplicationService.searchAndApply(userId)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ JobApplicationService.searchAndApply()                          │
│                                                                 │
│ 1. Load profile                                                │
│    → DataStore.getProfile(userId)                              │
│                                                                 │
│ 2. Call AGI API to search jobs                                 │
│    → AGIClient.executeAction({                                 │
│        url: 'https://real-networkin.vercel.app/platform/jobs/',│
│        task: 'search_jobs',                                    │
│        instructions: "Search for software engineer jobs...",   │
│        data: { position, locations }                           │
│      })                                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGIClient.executeAction()                                       │
│                                                                 │
│ IF USE_MOCK_AGI=true:                                          │
│   → Return mock job data (no API call)                         │
│                                                                 │
│ ELSE (Real AGI):                                               │
│   1. Create AGI session                                        │
│      → POST https://api.agi.tech/v1/sessions                   │
│      → { agent_name: "agi-0-fast" }                            │
│      → Returns: { session_id: "abc123", vnc_url: "..." }       │
│                                                                 │
│   2. Navigate to jobs page                                     │
│      → POST https://api.agi.tech/v1/sessions/abc123/navigate   │
│      → { url: "https://real-networkin.vercel.app/..." }        │
│                                                                 │
│   3. Send task to agent                                        │
│      → POST https://api.agi.tech/v1/sessions/abc123/message    │
│      → {                                                        │
│          message: "Search for software engineer jobs in SF,    │
│                    Remote. Extract job details..."             │
│        }                                                        │
│                                                                 │
│   4. Wait for completion                                       │
│      → AGIAgentService.waitForCompletion(session_id)           │
│      → Polls: GET /sessions/abc123/messages?after_id=0         │
│      → Waits for message.type = 'DONE'                         │
│                                                                 │
│   5. Parse results                                             │
│      → Extract job details from agent's response               │
│      → Returns array of jobs                                   │
│                                                                 │
│   6. Clean up                                                  │
│      → DELETE https://api.agi.tech/v1/sessions/abc123          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ JobApplicationService.searchAndApply() (continued)              │
│                                                                 │
│ 3. For each job found:                                         │
│    → Generate cover letter                                     │
│      → CoverLetterService.generateCoverLetter(profile, job)    │
│      → Uses Claude API to create tailored letter               │
│                                                                 │
│    → Apply to job (via AGI)                                    │
│      → AGIClient.executeAction({                               │
│          task: 'apply_to_job',                                 │
│          data: { coverLetter, fullName, email, phone }         │
│        })                                                       │
│      → AGI fills form and submits                              │
│                                                                 │
│    → Save application                                          │
│      → Create JobApplication object                            │
│      → DataStore.saveApplication(application)                  │
│      → Saved to applications.json                              │
│                                                                 │
│ 4. Return results                                              │
│    {                                                            │
│      jobsFound: 5,                                              │
│      applicationsSubmitted: 5,                                 │
│      applications: [...]                                       │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConversationService.handleJobSearch() (continued)               │
│                                                                 │
│ 5. Format response for user                                    │
│    "I found 5 jobs! Here's what I found:                       │
│     1. Senior SWE at Google - SF                               │
│     2. SWE at Meta - Remote                                    │
│     ...                                                         │
│     Which would you like to apply to?"                         │
│                                                                 │
│ 6. Change stage to 'job_review'                                │
│                                                                 │
│ 7. Return response with metadata                               │
│    { jobsFound: [...], pendingAction: 'approve_jobs' }         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: NewDashboard.tsx                                      │
│                                                                 │
│ 1. Shows agent's message with job list                         │
│                                                                 │
│ 2. Calls loadApplications(userId) because stage changed        │
│    → GET /api/jobs/applications/{userId}                       │
│    → DataStore.getApplicationsByUser(userId)                   │
│    → Returns applications array                                │
│                                                                 │
│ 3. Updates applications sidebar with new jobs                  │
│    → User sees 5 new application cards on the right            │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Component Connection Diagram

```
FRONTEND (React)
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  App.tsx (Router)                                           │
│    │                                                         │
│    ├─► ResumeUpload.tsx                                     │
│    │     └─► apiClient.uploadResume()                       │
│    │          └─► apiClient.initializeConversation()        │
│    │               └─► navigate('/dashboard')               │
│    │                                                         │
│    ├─► NewDashboard.tsx                                     │
│    │     ├─► useEffect → initializeDashboard()              │
│    │     │     ├─► apiClient.getConversation()              │
│    │     │     └─► apiClient.getApplications()              │
│    │     │                                                   │
│    │     ├─► handleSendMessage()                            │
│    │     │     └─► apiClient.sendMessage()                  │
│    │     │                                                   │
│    │     └─► Shows:                                         │
│    │           ├─► Messages (left pane)                     │
│    │           └─► Applications (right sidebar)             │
│    │                                                         │
│    └─► ApplicationDetails.tsx                               │
│          └─► Shows job + networking details                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          ↓ HTTP
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  apiClient (frontend/src/api/client.ts)                     │
│    All API calls go through here                            │
│    - uploadResume(file)                                     │
│    - initializeConversation(userId, profileData)            │
│    - sendMessage(userId, message)                           │
│    - getConversation(userId)                                │
│    - getApplications(profileId)                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          ↓ HTTP
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  BACKEND (Express)                                          │
│                                                              │
│  server.ts → Routes all requests                            │
│    │                                                         │
│    ├─► /api/resume/* → resume.routes.ts                     │
│    │     └─► ResumeParserService                            │
│    │           └─► Claude API                               │
│    │                                                         │
│    ├─► /api/agent/* → agent.routes.ts                       │
│    │     └─► ConversationService                            │
│    │           ├─► TelnyxChatService (if enabled)           │
│    │           │     └─► Telnyx API                         │
│    │           │                                             │
│    │           └─► Claude API (if Telnyx not enabled)       │
│    │                                                         │
│    ├─► /api/jobs/* → jobs.routes.ts                         │
│    │     └─► JobApplicationService                          │
│    │           ├─► AGIClient                                │
│    │           │     └─► AGI API (browser automation)       │
│    │           │                                             │
│    │           └─► CoverLetterService                       │
│    │                 └─► Claude API                         │
│    │                                                         │
│    ├─► /api/networking/* → networking.routes.ts             │
│    │     └─► NetworkingService                              │
│    │           └─► AGIClient                                │
│    │                 └─► AGI API                            │
│    │                                                         │
│    └─► /api/webhooks/* → webhooks.routes.ts                 │
│          └─► Handles AGI webhook callbacks                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  DATA LAYER (DataStore)                                     │
│                                                              │
│  backend/data/                                              │
│    ├─► profiles.json                                        │
│    ├─► applications.json                                    │
│    ├─► contacts.json                                        │
│    ├─► conversations.json          ← Chat messages          │
│    └─► conversation_states.json    ← User workflow state    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 🔌 External API Connections

### Telnyx Chat API (Optional)
```
ConversationService
    ↓
TelnyxChatService.createChatCompletion()
    ↓
POST https://api.telnyx.com/v2/ai/chat/completions
Headers: { Authorization: "Bearer {TELNYX_API_KEY}" }
Body: {
  model: "anthropic/claude-3.5-sonnet",
  messages: [...]
}
    ↓
Response: { choices: [{ message: { content: "..." } }] }
```

### Claude API (Direct or Fallback)
```
ResumeParserService / CoverLetterService / ConversationService
    ↓
new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    ↓
claude.messages.create({
  model: "claude-sonnet-4-20250514",
  messages: [...]
})
    ↓
Response: { content: [{ text: "..." }] }
```

### AGI API (Browser Automation)
```
AGIClient.executeAction()
    ↓
AGIAgentService.createSession()
    ↓
POST https://api.agi.tech/v1/sessions
Headers: { Authorization: "Bearer {AGI_API_KEY}" }
Body: { agent_name: "agi-0-fast" }
    ↓
Response: { session_id: "abc123", vnc_url: "..." }
    ↓
AGIAgentService.navigate(session_id, url)
    ↓
POST https://api.agi.tech/v1/sessions/abc123/navigate
Body: { url: "https://real-networkin.vercel.app/..." }
    ↓
AGIAgentService.sendMessage(session_id, message)
    ↓
POST https://api.agi.tech/v1/sessions/abc123/message
Body: { message: "Search for jobs..." }
    ↓
AGIAgentService.waitForCompletion(session_id)
    ↓
GET https://api.agi.tech/v1/sessions/abc123/messages?after_id=0
(polls until type = 'DONE')
    ↓
AGIAgentService.deleteSession(session_id)
    ↓
DELETE https://api.agi.tech/v1/sessions/abc123
```

## 🔄 State Flow

```
USER STATE PROGRESSION:

1. No state exists
   ↓
2. Upload resume
   ↓
3. ConversationState created:
   {
     userId: "user_123",
     stage: "profile_collection",
     profileData: { fullName, email, ... },
     lastUpdated: Date
   }
   ↓
4. Chat about preferences
   → stage stays "profile_collection"
   → profileData gets updated with each answer
   ↓
5. Profile complete
   → stage = "job_search"
   ↓
6. Jobs found
   → stage = "job_review"
   → Applications saved to applications.json
   ↓
7. User selects jobs
   → selectedJobs: ["app_1", "app_3"]
   → stage = "cover_letter_review"
   ↓
8. Cover letters generated
   → coverLetterDrafts: { "app_1": "Dear...", ... }
   → User approves
   → stage = "application"
   ↓
9. Applications submitted
   → stage = "networking_search"
   ↓
10. Find contacts
    → stage = "networking_review"
    ↓
11. User selects contacts
    → selectedContacts: { "app_1": ["contact_1", "contact_2"] }
    → stage = "networking_message_review"
    ↓
12. Messages approved and sent
    → stage = "complete"
```

## 📦 Data Storage Flow

```
CONVERSATIONS
┌────────────────────────────────────────┐
│ conversations.json                     │
├────────────────────────────────────────┤
│ [                                      │
│   {                                    │
│     id: "msg_1",                       │
│     userId: "user_123",                │
│     role: "user",                      │
│     content: "software engineer",      │
│     timestamp: Date                    │
│   },                                   │
│   {                                    │
│     id: "msg_2",                       │
│     userId: "user_123",                │
│     role: "assistant",                 │
│     content: "Great! What locations?", │
│     timestamp: Date                    │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘

CONVERSATION STATES
┌────────────────────────────────────────┐
│ conversation_states.json               │
├────────────────────────────────────────┤
│ [                                      │
│   {                                    │
│     userId: "user_123",                │
│     stage: "job_review",               │
│     profileData: {...},                │
│     selectedJobs: ["app_1"],           │
│     lastUpdated: Date                  │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘

PROFILES
┌────────────────────────────────────────┐
│ profiles.json                          │
├────────────────────────────────────────┤
│ [                                      │
│   {                                    │
│     id: "user_123",                    │
│     fullName: "John Doe",              │
│     email: "john@example.com",         │
│     desiredPosition: "software eng",   │
│     locations: ["SF", "Remote"],       │
│     createdAt: Date                    │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘

APPLICATIONS
┌────────────────────────────────────────┐
│ applications.json                      │
├────────────────────────────────────────┤
│ [                                      │
│   {                                    │
│     id: "app_1",                       │
│     userId: "user_123",                │
│     jobTitle: "Senior SWE",            │
│     company: "Google",                 │
│     coverLetter: "Dear...",            │
│     status: "applied",                 │
│     appliedAt: Date,                   │
│     networkingContacts: []             │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘

CONTACTS
┌────────────────────────────────────────┐
│ contacts.json                          │
├────────────────────────────────────────┤
│ [                                      │
│   {                                    │
│     id: "contact_1",                   │
│     applicationId: "app_1",            │
│     name: "Sarah Chen",                │
│     title: "Staff Engineer",           │
│     company: "Google",                 │
│     messageText: "Hi Sarah...",        │
│     status: "pending",                 │
│     sentAt: Date                       │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘
```

## 🎯 Summary

**Everything connects through:**

1. **Frontend** → Makes HTTP requests to backend
2. **Backend Routes** → Route to appropriate service
3. **Services** → Orchestrate business logic
4. **LLM APIs** (Telnyx/Claude) → Generate responses
5. **AGI API** → Automate browser tasks
6. **DataStore** → Persist to JSON files

**The key connection point is the `ConversationService`** which:
- Receives user messages
- Maintains conversation state
- Calls LLM for responses
- Triggers AGI for automation
- Saves everything to database
- Returns responses to frontend

It's like a **conductor orchestrating an orchestra** - coordinating all the different services to work together! 🎼
