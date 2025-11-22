# JobAgent - AI-Powered Job Application Assistant

## Project Overview

JobAgent is an AI-powered job application assistant that automates the entire job application process using the AGI API for browser automation. Users upload their resume, and the agent automatically searches for jobs on NetworkIn (LinkedIn clone), applies with tailored cover letters, and reaches out to employees for referrals and coffee chats.

**Tech Stack:**
- **Frontend:** React + TypeScript (Lovable)
- **Backend:** Node.js + Express + TypeScript
- **AI Services:** AGI API (browser automation), Anthropic Claude API (content generation)
- **Database:** JSON file storage (simple for 2-day hackathon)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                 │
│  - Resume Upload & Parsing UI                           │
│  - Profile Questionnaire Form                           │
│  - Applications Dashboard                               │
│  - Networking Dashboard (Coffee Chats/Referrals)        │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express + TS)                  │
│                                                          │
│  Route Handlers → Services → AGI Client                 │
│  Resume Parser, Cover Letter Generator, Networking      │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    ┌─────────┐           ┌─────────────┐
    │ AGI API │           │ Claude API  │
    │ (Browse)│           │ (Generate)  │
    └─────────┘           └─────────────┘
```

---

## User Workflow

### Phase 1: Resume Upload & Profile Setup
1. User uploads resume (PDF/DOCX)
2. Backend parses resume using Claude API → extracts structured data
3. Frontend displays pre-filled questionnaire form
4. User reviews/edits: work experience, education, skills
5. User adds job preferences: position (e.g., "engineer"), locations, current location
6. Profile saved to database

### Phase 2: Automatic Job Search & Application
1. Backend triggers job search on NetworkIn
2. AGI API navigates to `https://real-networkin.vercel.app/platform/jobs/`
3. Searches by user's desired position
4. For each job found:
   - Click on job to view details
   - Extract: job title, company, location, description, requirements
   - Click "Easy Apply" button
   - Generate tailored cover letter using Claude API
   - Fill form: cover letter, full name, email, phone
   - Submit application
   - Save to applications database

### Phase 3: Networking & Referrals
1. User views application dashboard
2. For each application, user can trigger "Reach Out for Referrals"
3. AGI API navigates to `https://real-networkin.vercel.app/platform/search/people/`
4. Filters by "current company" = target company
5. Finds 1st, 2nd, 3rd degree connections
6. For 1st degree connections:
   - Click "Message" button
   - Send coffee chat request message
7. For 2nd/3rd degree connections:
   - Click "Connect" button
   - Click "Add a note"
   - Send connection request with note about position
8. Save all contacts with metadata to database

### Phase 4: Response Tracking
1. User manually triggers "Check Responses"
2. AGI API navigates to messaging threads: `https://real-networkin.vercel.app/platform/messaging/?thread={namealllowercasenospace}`
3. Checks for new messages from contacts
4. Updates contact status: "pending" → "responded" or "no_response"
5. Dashboard updates with response status and thread links

---

## Data Models

```typescript
// types/models.ts

interface UserProfile {
  id: string;
  
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  
  // Resume Data (parsed)
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  
  // Job Search Preferences
  desiredPosition: string; // e.g., "engineer"
  locations: string[]; // ["San Francisco", "New York", "Remote"]
  currentLocation: string;
  
  // Metadata
  resumeUrl?: string; // Path to uploaded resume
  createdAt: Date;
  updatedAt: Date;
}

interface WorkExperience {
  company: string;
  title: string;
  startDate: string; // "2020-01"
  endDate: string | "Present";
  description: string;
  highlights: string[];
}

interface Education {
  institution: string;
  degree: string; // "Bachelor's", "Master's", etc.
  field: string; // "Computer Science"
  graduationDate: string; // "2020-05"
  gpa?: string;
}

interface JobApplication {
  id: string;
  userId: string;
  
  // Job Details (from NetworkIn)
  jobTitle: string;
  company: string;
  location: string;
  jobUrl: string; // NetworkIn job URL
  jobDescription: string;
  requirements: string[];
  
  // Application Materials (generated)
  coverLetter: string;
  
  // Application Status
  status: 'applied' | 'interviewing' | 'rejected' | 'accepted';
  appliedAt: Date;
  
  // Networking (sub-items)
  networkingContacts: NetworkingContact[];
}

interface NetworkingContact {
  id: string;
  applicationId: string; // Parent job application
  
  // Person Info (from NetworkIn)
  name: string;
  title: string;
  company: string;
  connectionDegree: '1st' | '2nd' | '3rd';
  profileUrl: string;
  description?: string; // Bio/tagline under their name
  
  // Outreach
  outreachType: 'message' | 'connection_request';
  messageText: string; // What we sent
  messagingThreadUrl?: string; // https://real-networkin.vercel.app/platform/messaging/?thread={name}
  
  // Status
  status: 'pending' | 'responded' | 'no_response';
  sentAt: Date;
  lastCheckedAt?: Date;
  responseText?: string; // If they replied
}
```

---

## Backend Structure

```
backend/
├── src/
│   ├── server.ts                     # Express app setup
│   │
│   ├── routes/
│   │   ├── resume.routes.ts          # Resume upload & parsing
│   │   ├── profile.routes.ts         # User profile CRUD
│   │   ├── jobs.routes.ts            # Job search & apply
│   │   └── networking.routes.ts      # Reach out & check responses
│   │
│   ├── services/
│   │   ├── resumeParser.service.ts       # Parse resume with Claude
│   │   ├── agiAgent.service.ts           # AGI Agent Sessions API client
│   │   ├── agiClient.service.ts          # High-level AGI wrapper (uses agiAgent)
│   │   ├── coverLetter.service.ts        # Generate cover letters
│   │   ├── jobApplication.service.ts     # Orchestrate job apply flow
│   │   └── networking.service.ts         # Orchestrate networking flow
│   │
│   ├── agents/                            # (Directory exists but not used yet)
│   │
│   ├── data/
│   │   └── store.ts                  # JSON file database
│   │
│   ├── types/
│   │   ├── models.ts                 # TypeScript interfaces
│   │   └── agiAgent.ts               # AGI Agent API types
│   │
│   └── utils/
│       ├── claudeClient.ts           # Anthropic API wrapper
│       ├── fileUpload.ts             # Multer configuration
│       └── logger.ts                 # Winston logger
│
├── uploads/                          # Temp storage for uploaded resumes
├── data/                             # JSON database files
│   ├── profiles.json
│   ├── applications.json
│   └── contacts.json
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## API Endpoints

### 1. Resume & Profile Management

#### `POST /api/resume/upload`
Upload resume file, parse it with Claude, return structured data.

**Request:**
- `Content-Type: multipart/form-data`
- `resumeFile`: File (PDF or DOCX)

**Response:**
```json
{
  "success": true,
  "parsedData": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "workExperience": [
      {
        "company": "Tech Corp",
        "title": "Software Engineer",
        "startDate": "2020-01",
        "endDate": "Present",
        "description": "Built scalable systems...",
        "highlights": ["Led team of 5", "Increased performance by 40%"]
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor's",
        "field": "Computer Science",
        "graduationDate": "2019-06"
      }
    ],
    "skills": ["Python", "JavaScript", "React", "Node.js"]
  }
}
```

#### `POST /api/profile`
Create user profile with questionnaire data.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "workExperience": [...],
  "education": [...],
  "skills": ["Python", "JavaScript"],
  "desiredPosition": "engineer",
  "locations": ["San Francisco", "New York", "Remote"],
  "currentLocation": "San Francisco"
}
```

**Response:**
```json
{
  "success": true,
  "profileId": "prof_abc123"
}
```

#### `GET /api/profile/:id`
Get user profile.

**Response:**
```json
{
  "success": true,
  "profile": { ...UserProfile }
}
```

#### `PATCH /api/profile/:id`
Update profile fields.

**Request:**
```json
{
  "desiredPosition": "senior engineer",
  "locations": ["Remote"]
}
```

---

### 2. Job Search & Application

#### `POST /api/jobs/search-and-apply`
Main workflow: Search jobs on NetworkIn and auto-apply to all matches.

**Request:**
```json
{
  "profileId": "prof_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "jobsFound": 5,
  "applicationsSubmitted": 5,
  "applications": [
    {
      "id": "app_xyz789",
      "jobTitle": "Senior Software Engineer",
      "company": "Anthropic",
      "location": "San Francisco, CA",
      "jobUrl": "https://real-networkin.vercel.app/platform/jobs/123",
      "coverLetter": "Dear Hiring Manager...",
      "status": "applied",
      "appliedAt": "2025-11-18T10:30:00Z"
    }
  ]
}
```

**Workflow:**
1. Retrieve user profile
2. AGI: Navigate to `https://real-networkin.vercel.app/platform/jobs/`
3. AGI: Search by `desiredPosition`
4. AGI: For each job:
   - Click job to view details
   - Extract job info (title, company, location, description, requirements)
   - Click "Easy Apply"
   - Generate cover letter with Claude
   - Fill form fields (cover letter, name, email, phone)
   - Submit application
5. Save each application to database
6. Return list of applications

#### `GET /api/applications/:profileId`
Get all applications for a user.

**Response:**
```json
{
  "success": true,
  "applications": [...]
}
```

#### `GET /api/applications/:id`
Get single application with networking contacts.

**Response:**
```json
{
  "success": true,
  "application": {
    ...JobApplication,
    "networkingContacts": [...]
  }
}
```

---

### 3. Networking (Coffee Chats / Referrals)

#### `POST /api/networking/reach-out`
Find people at company and send outreach messages.

**Request:**
```json
{
  "applicationId": "app_xyz789",
  "maxContacts": 5
}
```

**Response:**
```json
{
  "success": true,
  "contactsReachedOut": [
    {
      "id": "contact_123",
      "name": "Sarah Chen",
      "title": "Staff ML Engineer",
      "company": "Anthropic",
      "connectionDegree": "1st",
      "profileUrl": "https://real-networkin.vercel.app/platform/profile/sarahchen",
      "description": "ML @ Anthropic | Stanford CS",
      "outreachType": "message",
      "messageText": "Hi Sarah! I noticed you work at Anthropic...",
      "messagingThreadUrl": "https://real-networkin.vercel.app/platform/messaging/?thread=sarahchen",
      "status": "pending",
      "sentAt": "2025-11-18T11:00:00Z"
    }
  ]
}
```

**Workflow:**
1. Get application details (company name)
2. AGI: Navigate to `https://real-networkin.vercel.app/platform/search/people/`
3. AGI: Filter by "current company" = {company}
4. AGI: For each person (up to maxContacts):
   - Extract: name, title, connectionDegree, description
   - If 1st degree:
     - Click "Message" button
     - Send coffee chat message
   - If 2nd/3rd degree:
     - Click "Connect" button
     - Click "Add a note"
     - Send connection request with note
5. Store contact info in database with messaging thread URL
6. Return list of contacts

#### `POST /api/networking/check-responses`
Check if contacts responded to messages.

**Request:**
```json
{
  "contactIds": ["contact_123", "contact_456"]
}
```

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "contact_123",
      "status": "responded",
      "responseText": "Hi John! I'd be happy to chat...",
      "lastCheckedAt": "2025-11-18T14:00:00Z"
    },
    {
      "id": "contact_456",
      "status": "no_response",
      "lastCheckedAt": "2025-11-18T14:00:00Z"
    }
  ]
}
```

**Workflow:**
1. For each contactId:
   - Get contact from database
   - AGI: Navigate to `messagingThreadUrl`
   - AGI: Check for new messages from the other person
   - If new message: update status to "responded", extract response text
   - If no new message: update status to "no_response"
   - Update `lastCheckedAt` timestamp
2. Return updated contacts

#### `GET /api/networking/:applicationId`
Get all networking contacts for a job application.

**Response:**
```json
{
  "success": true,
  "contacts": [...]
}
```

---

## Service Implementations

### resumeParser.service.ts

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { UserProfile } from '../types/models';

export class ResumeParserService {
  private claude: Anthropic;
  
  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }
  
  async parseResume(resumeText: string): Promise<Partial<UserProfile>> {
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Parse this resume and extract structured data. Return ONLY valid JSON with no markdown formatting.

Resume:
${resumeText}

Return JSON in this exact format:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "workExperience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "YYYY-MM"
    }
  ],
  "skills": ["string"]
}`
      }]
    });
    
    const responseText = message.content[0].text;
    // Clean markdown code blocks if present
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(jsonText);
  }
}
```

---

### coverLetter.service.ts

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { UserProfile } from '../types/models';

export class CoverLetterService {
  private claude: Anthropic;
  
  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }
  
  async generateCoverLetter(
    profile: UserProfile,
    jobDetails: {
      title: string;
      company: string;
      description: string;
      requirements: string[];
    }
  ): Promise<string> {
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a professional cover letter for this job application.

Job Details:
- Title: ${jobDetails.title}
- Company: ${jobDetails.company}
- Description: ${jobDetails.description}
- Requirements: ${jobDetails.requirements.join(', ')}

Candidate Profile:
- Name: ${profile.fullName}
- Current Location: ${profile.currentLocation}
- Skills: ${profile.skills.join(', ')}
- Recent Experience: ${profile.workExperience[0]?.company} - ${profile.workExperience[0]?.title}
- Education: ${profile.education[0]?.degree} in ${profile.education[0]?.field} from ${profile.education[0]?.institution}

Write a concise, enthusiastic cover letter (max 250 words). Focus on:
1. Why I'm excited about this specific role
2. How my skills match their requirements
3. Relevant experience that demonstrates capability
4. Professional and genuine tone

Do not use overly formal or generic language. Be authentic and specific.`
      }]
    });
    
    return message.content[0].text;
  }
}
```

---

### agiAgent.service.ts

Full implementation of the AGI Agent Sessions API. Provides session management, message sending, browser control, and execution control.

**Key Features:**
- Session lifecycle management (create, delete, status)
- Message sending and polling
- Browser navigation and screenshots
- Execution control (pause, resume, cancel)
- Wait for completion helper
- Comprehensive error handling
- Mock mode support

**API Endpoints Implemented:**
- `POST /sessions` - Create session
- `GET /sessions/{id}/status` - Get status
- `POST /sessions/{id}/message` - Send message
- `GET /sessions/{id}/messages` - Get messages
- `POST /sessions/{id}/pause` - Pause execution
- `POST /sessions/{id}/resume` - Resume execution
- `POST /sessions/{id}/cancel` - Cancel execution
- `POST /sessions/{id}/navigate` - Navigate browser
- `GET /sessions/{id}/screenshot` - Get screenshot
- `DELETE /sessions/{id}` - Delete session

See `src/services/README_AGI_AGENT.md` for complete documentation.

### agiClient.service.ts

High-level wrapper that uses `AGIAgentService` under the hood. Maintains backward compatibility with existing code while using the new AGI Agent Sessions API.

**Key Features:**
- Backward compatible `executeAction()` method
- Automatic session management
- Smart message building from task parameters
- Result parsing from agent messages
- Falls back to mock mode when `USE_MOCK_AGI=true`

**Usage:**
```typescript
const client = new AGIClient();
const result = await client.executeAction({
  url: 'https://example.com',
  task: 'search_jobs',
  instructions: 'Find software engineering jobs',
  data: { position: 'engineer', locations: ['SF'] }
});
```

The client automatically:
1. Creates a new AGI Agent session
2. Navigates to the URL if provided
3. Sends a formatted message to the agent
4. Waits for completion
5. Parses results based on task type
6. Cleans up the session

**Mock Mode:**
When `USE_MOCK_AGI=true`, returns mock responses without making API calls. Mock responses match the expected format for each task type.

---

### jobApplication.service.ts

```typescript
import { AGIClient } from './agiClient.service';
import { CoverLetterService } from './coverLetter.service';
import { DataStore } from '../data/store';
import { UserProfile, JobApplication } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export class JobApplicationService {
  private agiClient: AGIClient;
  private coverLetterService: CoverLetterService;
  private dataStore: DataStore;
  
  constructor() {
    this.agiClient = new AGIClient();
    this.coverLetterService = new CoverLetterService();
    this.dataStore = new DataStore();
  }
  
  /**
   * Main orchestration: Search jobs and auto-apply
   */
  async searchAndApply(profileId: string): Promise<{
    jobsFound: number;
    applicationsSubmitted: number;
    applications: JobApplication[];
  }> {
    const profile = await this.dataStore.getProfile(profileId);
    const applications: JobApplication[] = [];
    
    // Step 1: Navigate to jobs page and search
    console.log(`🔍 Searching for ${profile.desiredPosition} jobs...`);
    const jobsResult = await this.agiClient.executeAction({
      url: 'https://real-networkin.vercel.app/platform/jobs/',
      task: 'search_jobs',
      instructions: `Search for "${profile.desiredPosition}" jobs in ${profile.locations.join(', ')}`,
      data: {
        position: profile.desiredPosition,
        locations: profile.locations
      }
    });
    
    console.log(`✅ Found ${jobsResult.jobs.length} jobs`);
    
    // Step 2: For each job, apply
    for (const job of jobsResult.jobs) {
      try {
        console.log(`📝 Applying to ${job.title} at ${job.company}...`);
        const application = await this.applyToJob(profile, job);
        applications.push(application);
        console.log(`✅ Applied to ${job.title}`);
      } catch (error) {
        console.error(`❌ Failed to apply to ${job.title}:`, error);
      }
    }
    
    return {
      jobsFound: jobsResult.jobs.length,
      applicationsSubmitted: applications.length,
      applications
    };
  }
  
  /**
   * Apply to a single job
   */
  private async applyToJob(
    profile: UserProfile,
    jobDetails: any
  ): Promise<JobApplication> {
    // Generate cover letter
    console.log('  📄 Generating cover letter...');
    const coverLetter = await this.coverLetterService.generateCoverLetter(
      profile,
      jobDetails
    );
    
    // Click Easy Apply and fill form
    console.log('  🤖 Filling application form...');
    await this.agiClient.executeAction({
      url: jobDetails.url,
      task: 'apply_to_job',
      instructions: 'Click Easy Apply button, fill form, and submit',
      data: {
        coverLetter,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone
      }
    });
    
    // Save application to database
    const application: JobApplication = {
      id: uuidv4(),
      userId: profile.id,
      jobTitle: jobDetails.title,
      company: jobDetails.company,
      location: jobDetails.location,
      jobUrl: jobDetails.url,
      jobDescription: jobDetails.description,
      requirements: jobDetails.requirements,
      coverLetter,
      status: 'applied',
      appliedAt: new Date(),
      networkingContacts: []
    };
    
    await this.dataStore.saveApplication(application);
    return application;
  }
}
```

---

### networking.service.ts

```typescript
import { AGIClient } from './agiClient.service';
import { DataStore } from '../data/store';
import { JobApplication, NetworkingContact } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export class NetworkingService {
  private agiClient: AGIClient;
  private dataStore: DataStore;
  
  constructor() {
    this.agiClient = new AGIClient();
    this.dataStore = new DataStore();
  }
  
  /**
   * Find people at company and reach out
   */
  async reachOut(
    applicationId: string,
    maxContacts: number = 5
  ): Promise<NetworkingContact[]> {
    const application = await this.dataStore.getApplication(applicationId);
    const contacts: NetworkingContact[] = [];
    
    console.log(`🔍 Finding people at ${application.company}...`);
    
    // Step 1: Navigate to people search
    const peopleResult = await this.agiClient.executeAction({
      url: 'https://real-networkin.vercel.app/platform/search/people/',
      task: 'search_people',
      instructions: `Filter by current company: "${application.company}". Find up to ${maxContacts} people.`,
      data: {
        company: application.company,
        limit: maxContacts
      }
    });
    
    console.log(`✅ Found ${peopleResult.people.length} people`);
    
    // Step 2: For each person, send message or connection request
    for (const person of peopleResult.people) {
      try {
        console.log(`📤 Reaching out to ${person.name}...`);
        const contact = await this.sendOutreach(application, person);
        contacts.push(contact);
        console.log(`✅ Sent to ${person.name}`);
      } catch (error) {
        console.error(`❌ Failed to reach out to ${person.name}:`, error);
      }
    }
    
    // Update application with new contacts
    application.networkingContacts.push(...contacts);
    await this.dataStore.saveApplication(application);
    
    return contacts;
  }
  
  /**
   * Send message or connection request to a person
   */
  private async sendOutreach(
    application: JobApplication,
    person: any
  ): Promise<NetworkingContact> {
    const messageText = this.generateOutreachMessage(
      application.jobTitle,
      application.company,
      person.connectionDegree
    );
    
    if (person.connectionDegree === '1st') {
      // Send direct message
      await this.agiClient.executeAction({
        url: person.profileUrl,
        task: 'send_message',
        instructions: 'Click Message button, type message, and send',
        data: { message: messageText }
      });
    } else {
      // Send connection request with note
      await this.agiClient.executeAction({
        url: person.profileUrl,
        task: 'send_connection_request',
        instructions: 'Click Connect, click Add Note, type message, and send',
        data: { note: messageText }
      });
    }
    
    // Create contact record
    const threadUrl = `https://real-networkin.vercel.app/platform/messaging/?thread=${person.name.toLowerCase().replace(/\s+/g, '')}`;
    
    const contact: NetworkingContact = {
      id: uuidv4(),
      applicationId: application.id,
      name: person.name,
      title: person.title,
      company: application.company,
      connectionDegree: person.connectionDegree,
      profileUrl: person.profileUrl,
      description: person.description,
      outreachType: person.connectionDegree === '1st' ? 'message' : 'connection_request',
      messageText,
      messagingThreadUrl: threadUrl,
      status: 'pending',
      sentAt: new Date()
    };
    
    await this.dataStore.saveContact(contact);
    return contact;
  }
  
  /**
   * Generate personalized outreach message
   */
  private generateOutreachMessage(
    jobTitle: string,
    company: string,
    connectionDegree: string
  ): string {
    if (connectionDegree === '1st') {
      return `Hi! I noticed you work at ${company}. I recently applied for the ${jobTitle} role and would love to chat about your experience at the company. Would you be open to a quick coffee chat?`;
    } else {
      return `Hi! I'm interested in the ${jobTitle} position at ${company}. Would you be open to connecting and sharing your insights about the company?`;
    }
  }
  
  /**
   * Check if people responded
   */
  async checkResponses(contactIds: string[]): Promise<NetworkingContact[]> {
    const updatedContacts: NetworkingContact[] = [];
    
    console.log(`🔍 Checking responses for ${contactIds.length} contacts...`);
    
    for (const contactId of contactIds) {
      const contact = await this.dataStore.getContact(contactId);
      
      console.log(`  Checking ${contact.name}...`);
      
      // Navigate to messaging thread
      const threadResult = await this.agiClient.executeAction({
        url: contact.messagingThreadUrl!,
        task: 'check_messages',
        instructions: 'Check if there are new messages from the other person'
      });
      
      // Update contact status
      if (threadResult.hasNewMessages) {
        contact.status = 'responded';
        contact.responseText = threadResult.latestMessage;
        console.log(`  ✅ ${contact.name} responded!`);
      } else {
        contact.status = 'no_response';
        console.log(`  ⏳ ${contact.name} hasn't responded yet`);
      }
      
      contact.lastCheckedAt = new Date();
      await this.dataStore.saveContact(contact);
      updatedContacts.push(contact);
    }
    
    return updatedContacts;
  }
}
```

---

## package.json

```json
{
  "name": "jobagent-backend",
  "version": "1.0.0",
  "description": "AI-powered job application assistant backend",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-fileupload": "^1.4.3",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/express-fileupload": "^1.4.4",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.0",
    "@types/uuid": "^9.0.7",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## .env.example

```bash
# Server
PORT=3000
NODE_ENV=development

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# AGI Agent API (Sessions API)
# Get your API key from https://api.agi.tech
AGI_API_KEY=your_agi_api_key_here
AGI_API_URL=https://api.agi.tech/v1

# Mock Mode (for development without AGI API)
USE_MOCK_AGI=true

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## Frontend Integration (React + TypeScript)

### API Client Example

```typescript
// frontend/src/api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Resume
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resumeFile', file);
    
    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  },
  
  // Profile
  async createProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return response.json();
  },
  
  async getProfile(id: string) {
    const response = await fetch(`${API_BASE_URL}/profile/${id}`);
    return response.json();
  },
  
  // Jobs
  async searchAndApply(profileId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/search-and-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    });
    
    return response.json();
  },
  
  async getApplications(profileId: string) {
    const response = await fetch(`${API_BASE_URL}/applications/${profileId}`);
    return response.json();
  },
  
  // Networking
  async reachOut(applicationId: string, maxContacts: number = 5) {
    const response = await fetch(`${API_BASE_URL}/networking/reach-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, maxContacts })
    });
    
    return response.json();
  },
  
  async checkResponses(contactIds: string[]) {
    const response = await fetch(`${API_BASE_URL}/networking/check-responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds })
    });
    
    return response.json();
  }
};
```

---

## Setup Instructions

### Backend Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd jobagent/backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your API keys

# 4. Run in development mode
npm run dev

# Server will run on http://localhost:3000
```

### Frontend Setup (Lovable)

```bash
# 1. Navigate to frontend directory
cd jobagent/frontend

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env

# 4. Run development server
npm run dev

# Frontend will run on http://localhost:5173
```

---

## Testing the API

### 1. Upload Resume
```bash
curl -X POST http://localhost:3000/api/resume/upload \
  -F "resumeFile=@/path/to/resume.pdf"
```

### 2. Create Profile
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "workExperience": [],
    "education": [],
    "skills": ["Python", "JavaScript"],
    "desiredPosition": "engineer",
    "locations": ["San Francisco"],
    "currentLocation": "San Francisco"
  }'
```

### 3. Search and Apply to Jobs
```bash
curl -X POST http://localhost:3000/api/jobs/search-and-apply \
  -H "Content-Type: application/json" \
  -d '{"profileId": "prof_abc123"}'
```

### 4. Reach Out for Referrals
```bash
curl -X POST http://localhost:3000/api/networking/reach-out \
  -H "Content-Type: application/json" \
  -d '{"applicationId": "app_xyz789", "maxContacts": 5}'
```

### 5. Check Responses
```bash
curl -X POST http://localhost:3000/api/networking/check-responses \
  -H "Content-Type: application/json" \
  -d '{"contactIds": ["contact_123", "contact_456"]}'
```

---

## Development Roadmap

### Day 1: Backend Core
- ✅ Setup Express + TypeScript
- ✅ Resume upload & parsing (Claude API)
- ✅ Profile CRUD endpoints
- ✅ Mock AGI client
- ✅ Job search & apply workflow
- ✅ Cover letter generation

### Day 2: Networking & Frontend
- ✅ Networking reach-out workflow
- ✅ Response checking workflow
- ✅ Frontend UI in Lovable
- ✅ Integration with backend
- ✅ Replace mock AGI with real API
- ✅ Demo preparation

---

## Production Deployment

### Backend (Railway/Render)

```bash
# Build
npm run build

# Start
npm start
```

### Frontend (Vercel/Netlify via Lovable)

Lovable handles deployment automatically. Just connect your git repository.

---

## Key Features Summary

1. **Resume Parsing**: Upload resume → Claude extracts structured data
2. **Profile Management**: Review/edit parsed data + add job preferences
3. **Automated Job Search**: AGI browses NetworkIn, finds matching jobs
4. **Automated Applications**: AGI fills forms with custom cover letters
5. **Networking Automation**: AGI finds employees, sends personalized messages
6. **Response Tracking**: AGI checks messaging threads for replies
7. **Dashboard**: View all applications and networking activity

---

## AGI Agent Integration

The project now includes a complete implementation of the AGI Agent Sessions API:

1. **AGIAgentService** (`src/services/agiAgent.service.ts`): Full Sessions API client
   - All endpoints implemented
   - Session management
   - Message polling and waiting
   - Browser control (navigate, screenshot)
   - Execution control (pause, resume, cancel)

2. **AGIClient** (`src/services/agiClient.service.ts`): High-level wrapper
   - Backward compatible with existing code
   - Automatic session lifecycle management
   - Smart message formatting
   - Result parsing

3. **Type Definitions** (`src/types/agiAgent.ts`): Complete TypeScript types

4. **Documentation**:
   - `backend/src/services/README_AGI_AGENT.md` - Usage guide
   - `backend/src/services/agiAgent.example.ts` - Code examples
   - `backend/AGI_AGENT_INTEGRATION.md` - Integration guide

**API Base URL**: `https://api.agi.tech/v1`

**Environment Variables**:
- `AGI_API_KEY` - Your AGI API key
- `AGI_API_URL` - API base URL (defaults to https://api.agi.tech/v1)
- `USE_MOCK_AGI` - Set to `true` for mock mode (development)

## Notes for Implementation

1. **AGI API Integration**: ✅ Complete - Full Sessions API implementation ready
2. **Error Handling**: Add try-catch blocks and proper error responses
3. **Rate Limiting**: Add rate limiting for API endpoints
4. **Authentication**: Add user auth if multi-user support needed
5. **Database**: Upgrade to PostgreSQL/MongoDB for production
6. **Logging**: Winston configured for production logs
7. **Testing**: Add Jest tests for critical workflows
8. **Voice Integration**: Add Telnyx voice control (stretch goal)

---

## Demo Script (2 minutes)

**[0:00-0:20] Problem**
"Job hunting is exhausting. Hours searching LinkedIn, tailoring applications, finding connections..."

**[0:20-0:40] Solution**
"JobAgent automates everything. Upload your resume, tell it what you want."

**[0:40-1:20] Live Demo**
- Upload resume → See parsed profile
- Click "Find Jobs" → Agent searches NetworkIn
- Watch real-time: "Found 5 jobs, applying..."
- Dashboard updates: 5 applications submitted

**[1:20-1:50] The Magic**
- Click on Anthropic application
- Expand to show:
  - Custom cover letter
  - Application questions answered
  - 3 employees identified for referrals
  - Personalized messages sent

**[1:50-2:00] Close**
"5 jobs, 15 referral requests, 90 seconds. Built with AGI API."

---

## IMPLEMENTATION UPDATE - Human-in-the-Loop Conversational Workflow

### Overview of Changes

The application has been updated to implement a fully conversational, human-in-the-loop workflow. Instead of manual button clicks, users now interact with an AI chatbot that guides them through the entire job hunting process with approval points at each critical decision.

### New User Workflow

#### Phase 1: Resume Upload → Direct to Dashboard
1. User uploads resume (PDF/DOCX)
2. Backend parses resume using Claude API → extracts structured data
3. **NEW**: User is redirected directly to Dashboard (not profile form)
4. **NEW**: Conversation with AI agent is automatically initialized
5. Dashboard shows AI chatbot interface with applications sidebar

#### Phase 2: Conversational Job Preference Collection
1. Agent greets user with profile information already loaded
2. Agent asks for three missing pieces of information via natural conversation:
   - Desired position (e.g., "software engineer")
   - Preferred locations (can be multiple, including "Remote")
   - Current location
3. User responds in natural language
4. Agent extracts information using Claude and confirms understanding

#### Phase 3: Automatic Job Search with Human Review
1. Agent automatically triggers job search when preferences are complete
2. AGI API navigates to NetworkIn and searches
3. **NEW**: Agent presents found jobs in chat with full details
4. **NEW**: User selects which jobs to apply to:
   - Can say "all of them"
   - Can specify numbers: "1, 3, and 5"
   - Can say "none" to search again
5. Agent confirms selection

#### Phase 4: Cover Letter Review & Approval
1. **NEW**: Agent generates customized cover letters for selected jobs
2. **NEW**: Agent shows each cover letter one by one in chat
3. **NEW**: User reviews and can:
   - Approve ("looks good", "yes")
   - Request changes ("make it more enthusiastic")
   - See next one ("show me the next")
4. Agent iterates through all cover letters
5. Once approved, agent submits applications

#### Phase 5: Networking with Human Approval
1. Agent asks if user wants help with networking
2. If yes, agent searches for people at target companies
3. **NEW**: Agent presents list of contacts with details:
   - Name, title, company
   - Connection degree (1st, 2nd, 3rd)
   - Brief description/bio
4. **NEW**: User selects who to reach out to
5. **NEW**: Agent drafts personalized messages
6. **NEW**: User reviews and approves each message before sending
7. Agent sends approved messages and updates dashboard

#### Phase 6: Continuous Conversation
1. Applications appear in sidebar as they're created
2. User can click on applications to view details
3. User can continue chatting with agent for help
4. User can manually edit profile via separate page

### New Architecture Components

#### Backend Services

**TelnyxAgentService** (`src/services/telnyxAgent.service.ts`)
- Integrates with Telnyx API for voice/SMS capabilities
- Handles voice call sessions (optional feature)
- Processes voice and SMS webhooks
- Enables users to talk to the agent or text

**ConversationService** (`src/services/conversation.service.ts`)
- Orchestrates the entire conversational workflow
- Manages conversation state machine with 9 stages:
  1. `profile_collection` - Gather job preferences
  2. `job_search` - Search for jobs
  3. `job_review` - User selects jobs to apply to
  4. `cover_letter_review` - Review and approve cover letters
  5. `application` - Submit applications
  6. `networking_search` - Find people at companies
  7. `networking_review` - User selects contacts
  8. `networking_message_review` - Review and approve messages
  9. `complete` - Workflow finished
- Uses Claude API for natural language understanding
- Tracks user progress through stages
- Handles human-in-the-loop approval points

#### New Data Models

```typescript
interface ConversationMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'voice' | 'text';
    callSid?: string;
    jobsFound?: any[];
    coverLetterDraft?: string;
    contactsFound?: any[];
    messageDraft?: string;
    pendingAction?: 'approve_jobs' | 'approve_cover_letter' | 'approve_contacts' | 'approve_messages';
  };
}

interface ConversationState {
  userId: string;
  stage: string;
  profileData?: Partial<UserProfile>;
  selectedJobs?: string[];
  coverLetterDrafts?: { [jobId: string]: string };
  approvedCoverLetters?: { [jobId: string]: string };
  selectedContacts?: { [applicationId: string]: string[] };
  messageDrafts?: { [contactId: string]: string };
  approvedMessages?: { [contactId: string]: string };
  lastUpdated: Date;
}

interface AGIWebhookEvent {
  event: 'session.created' | 'task.started' | 'task.completed' | 'task.question' | 'task.error';
  timestamp: string;
  session: { id: string; status: string; /* ... */ };
  message?: string;
  result?: any;
  question?: string;
  error?: string;
}
```

#### New API Endpoints

**Agent Conversation**
- `POST /api/agent/message` - Send message to chatbot
- `GET /api/agent/conversation/:userId` - Get chat history
- `DELETE /api/agent/conversation/:userId` - Clear conversation
- `POST /api/agent/initialize` - Start new conversation

**Voice Integration (Optional)**
- `POST /api/agent/voice/call` - Initiate voice call with agent
- `POST /api/agent/voice-webhook` - Telnyx voice event handler
- `POST /api/agent/sms-webhook` - Telnyx SMS event handler

**Webhooks**
- `POST /api/webhooks/agi` - AGI task completion webhooks
- `GET /api/webhooks/agi/:sessionId` - Debug webhook events

#### Data Storage Updates

**New JSON Files** (in `backend/data/`)
- `conversations.json` - Stores all conversation messages
- `conversation_states.json` - Stores conversation state per user

**DataStore Methods Added**
- `getConversationMessages(userId)` - Load chat history
- `saveConversationMessage(message)` - Store message
- `clearConversationMessages(userId)` - Clear history
- `getConversationState(userId)` - Get user's workflow state
- `saveConversationState(state)` - Update workflow state
- `deleteConversationState(userId)` - Remove state

### Frontend Changes

#### New Dashboard Component

**NewDashboard.tsx** - Complete redesign with split-pane layout:

**Left Pane: AI Chatbot**
- Chat message history (user and assistant messages)
- Real-time message display with timestamps
- Text input area for user messages
- Loading indicator when agent is thinking
- Shows current conversation stage
- Keyboard shortcuts (Enter to send)

**Right Pane: Applications Sidebar**
- Live list of submitted applications
- Shows job title, company, location, status
- Displays networking contact count per application
- Click to view application details
- Auto-updates when new applications are created

**Header**
- JobAgent branding
- "Edit Profile" button to manually update profile

#### Updated Resume Upload Flow

**Before:**
```
Upload → Parse → Redirect to /profile → Fill form → Redirect to /dashboard
```

**After:**
```
Upload → Parse → Initialize conversation → Redirect to /dashboard
```

The profile form is skipped, and conversation starts immediately with profile data pre-loaded.

### Integration Points

#### AGI Webhooks
- AGI sessions can now be created with `webhook_url` parameter
- Backend URL configured: `${BACKEND_URL}/api/webhooks/agi`
- When AGI tasks complete, webhook notifies the backend
- Backend can then notify user via chatbot about task completion
- Enables async job search with real-time updates

#### Telnyx Integration (Optional)
- Telnyx API enables voice calls with the agent
- Users can call a phone number to interact verbally
- Voice is transcribed and processed like text messages
- Agent can speak responses back using text-to-speech
- SMS support for text-based mobile interaction
- Webhooks configured for call and message events

#### Claude API Usage
- **Resume Parsing**: Extract structured data from resumes
- **Cover Letter Generation**: Create tailored cover letters
- **Natural Language Understanding**: Extract job preferences from chat
- **Conversational Responses**: Generate natural, helpful agent responses
- **Context Awareness**: Maintains conversation history for continuity

### Environment Variables

#### New Required Variables

```bash
# Backend URL (for webhooks)
BACKEND_URL=http://localhost:3000

# Telnyx API (Optional - for voice/SMS)
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_API_URL=https://api.telnyx.com/v2
TELNYX_AGENT_ID=your_agent_id
TELNYX_PHONE_NUMBER=+1234567890
```

#### Updated Variables
```bash
# AGI API URL corrected
AGI_API_URL=https://api.agi.tech/v1
```

### Human-in-the-Loop Decision Points

The new workflow includes human approval at these critical points:

1. **Job Selection**
   - Agent finds jobs → presents list → user selects which to apply

2. **Cover Letter Approval**
   - Agent generates drafts → shows each one → user approves or requests changes

3. **Networking Contact Selection**
   - Agent finds employees → presents with details → user selects who to contact

4. **Message Approval**
   - Agent drafts outreach messages → user reviews → user approves before sending

This ensures the user maintains full control while automating the tedious parts.

### File Structure Changes

```
backend/
├── src/
│   ├── services/
│   │   ├── telnyxAgent.service.ts       # NEW
│   │   ├── conversation.service.ts      # NEW
│   │
│   ├── routes/
│   │   ├── agent.routes.ts              # NEW
│   │   ├── webhooks.routes.ts           # NEW
│   │
│   ├── types/
│   │   └── models.ts                    # UPDATED
│   │
│   ├── data/
│   │   └── store.ts                     # UPDATED
│   │
│   └── server.ts                        # UPDATED
│
├── data/
│   ├── conversations.json               # NEW
│   └── conversation_states.json         # NEW
│
└── .env.example                         # UPDATED

frontend/
├── src/
│   ├── pages/
│   │   ├── NewDashboard.tsx             # NEW
│   │   ├── ResumeUpload.tsx             # UPDATED
│   │
│   ├── types/
│   │   └── models.ts                    # UPDATED
│   │
│   ├── api/
│   │   └── client.ts                    # UPDATED
│   │
│   └── App.tsx                          # UPDATED
```

### Testing the New Workflow

1. **Backend Setup**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with API keys
npm run dev
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env
npm run dev
```

3. **Test Flow**:
   - Navigate to http://localhost:5173
   - Upload a resume
   - Chat with the agent about job preferences
   - Review and select jobs
   - Approve cover letters
   - Select networking contacts
   - Approve messages

### Key Benefits

1. **Natural Interaction**: Users communicate in plain English instead of filling forms
2. **Full Control**: Human approval required at every critical decision
3. **Transparency**: User sees exactly what the agent is doing
4. **Flexibility**: Can customize cover letters and messages before sending
5. **Voice Option**: Can interact via phone call (optional Telnyx integration)
6. **Real-time Updates**: AGI webhooks enable async task notifications
7. **Better UX**: All interactions happen in one place (Dashboard)

### Notes for Future Enhancement

1. **Persistent Storage**: Migrate from JSON to PostgreSQL/MongoDB for production
2. **Authentication**: Add user auth for multi-user support
3. **WebSockets**: Real-time updates without polling
4. **Email Integration**: Automated follow-up emails
5. **Calendar Integration**: Schedule interviews and coffee chats
6. **Analytics**: Track success rates and optimize messaging

---

End of Specification Document