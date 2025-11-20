# JobAgent - AI-Powered Job Application Assistant

An AI-powered job application assistant that automates the entire job application process using the AGI API for browser automation. Users upload their resume, and the agent automatically searches for jobs on NetworkIn (LinkedIn clone), applies with tailored cover letters, and reaches out to employees for referrals and coffee chats.

## Features

- **Resume Parsing**: Upload resume (PDF/DOCX) and extract structured data using Claude API
- **Profile Management**: Store and manage user profiles with job search preferences
- **Automated Job Search**: Search jobs on NetworkIn using AGI browser automation
- **Smart Applications**: Auto-generate tailored cover letters and submit applications
- **Networking Automation**: Find employees at target companies and send personalized messages
- **Response Tracking**: Monitor networking outreach responses

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **AI Services**:
  - Anthropic Claude API (resume parsing, cover letter generation)
  - AGI API (browser automation)
- **Database**: JSON file storage

### Frontend (To be built)
- **Framework**: React + TypeScript (Lovable)
- **State**: React hooks
- **API Client**: Fetch/Axios

## Project Structure

```
job-application/
├── backend/                          # Backend server (COMPLETED ✓)
│   ├── src/
│   │   ├── server.ts                # Express app setup
│   │   ├── routes/                  # API route handlers
│   │   │   ├── resume.routes.ts
│   │   │   ├── profile.routes.ts
│   │   │   ├── jobs.routes.ts
│   │   │   └── networking.routes.ts
│   │   ├── services/                # Business logic
│   │   │   ├── resumeParser.service.ts
│   │   │   ├── coverLetter.service.ts
│   │   │   ├── agiClient.service.ts
│   │   │   ├── jobApplication.service.ts
│   │   │   └── networking.service.ts
│   │   ├── data/                    # JSON data store
│   │   │   └── store.ts
│   │   ├── types/                   # TypeScript interfaces
│   │   │   └── models.ts
│   │   └── utils/                   # Utilities
│   │       ├── claudeClient.ts
│   │       ├── logger.ts
│   │       └── fileUpload.ts
│   ├── data/                        # JSON database files
│   ├── uploads/                     # Uploaded resume files
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── frontend/                        # Frontend app (TODO)
└── context.md                       # Project specification
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (required)
- AGI API key (optional - can use mock mode)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   PORT=3000
   NODE_ENV=development

   # Required: Get from https://console.anthropic.com/
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Optional: For real browser automation
   AGI_API_KEY=your_agi_api_key_here
   AGI_API_URL=https://api.theagi.company/v1

   # Use mock mode for development (set to 'true')
   USE_MOCK_AGI=true

   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:3000`

5. **Test the API**
   ```bash
   curl http://localhost:3000/health
   ```

## API Documentation

### Resume & Profile Management

#### Upload Resume
```bash
POST /api/resume/upload
Content-Type: multipart/form-data

# Example
curl -X POST http://localhost:3000/api/resume/upload \
  -F "resumeFile=@/path/to/resume.pdf"
```

#### Create Profile
```bash
POST /api/profile
Content-Type: application/json

# Example
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
    "locations": ["San Francisco", "Remote"],
    "currentLocation": "San Francisco"
  }'
```

#### Get Profile
```bash
GET /api/profile/:id
```

### Job Search & Applications

#### Search and Apply
```bash
POST /api/jobs/search-and-apply
Content-Type: application/json

# Example
curl -X POST http://localhost:3000/api/jobs/search-and-apply \
  -H "Content-Type: application/json" \
  -d '{"profileId": "YOUR_PROFILE_ID"}'
```

#### Get Applications
```bash
GET /api/jobs/applications/:profileId
GET /api/jobs/application/:id
```

### Networking

#### Reach Out for Referrals
```bash
POST /api/networking/reach-out
Content-Type: application/json

# Example
curl -X POST http://localhost:3000/api/networking/reach-out \
  -H "Content-Type: application/json" \
  -d '{"applicationId": "YOUR_APP_ID", "maxContacts": 5}'
```

#### Check Responses
```bash
POST /api/networking/check-responses
Content-Type: application/json

# Example
curl -X POST http://localhost:3000/api/networking/check-responses \
  -H "Content-Type: application/json" \
  -d '{"contactIds": ["contact_1", "contact_2"]}'
```

## Mock Mode

By default, the backend uses **mock AGI responses** for development:

- ✓ Mock job searches return 3 sample jobs (Anthropic, OpenAI, Stripe)
- ✓ Mock applications succeed automatically
- ✓ Mock networking finds 3 sample contacts
- ✓ Mock response checking randomly simulates responses

This allows you to test the full workflow without the AGI API. Set `USE_MOCK_AGI=false` to use the real AGI API.

## User Workflow

### Phase 1: Resume Upload & Profile Setup
1. User uploads resume (PDF/DOCX)
2. Backend parses resume using Claude API → extracts structured data
3. User reviews/edits: work experience, education, skills
4. User adds job preferences: position, locations
5. Profile saved to database

### Phase 2: Automatic Job Search & Application
1. User triggers "Find Jobs"
2. AGI navigates to NetworkIn jobs page
3. Searches by desired position
4. For each job:
   - Extracts job details
   - Generates tailored cover letter with Claude
   - Fills and submits application form
   - Saves to database

### Phase 3: Networking & Referrals
1. User views applications
2. User triggers "Reach Out for Referrals"
3. AGI finds employees at target company
4. Sends personalized messages/connection requests
5. Saves contacts to database

### Phase 4: Response Tracking
1. User triggers "Check Responses"
2. AGI checks messaging threads
3. Updates contact status and extracts responses
4. Dashboard displays results

## Next Steps

### Frontend Development (using Lovable)
1. Resume upload & parsing UI
2. Profile questionnaire form
3. Applications dashboard
4. Networking dashboard
5. Real-time progress indicators

### Production Deployment
- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel or Netlify (via Lovable)
- **Database**: Upgrade to PostgreSQL/MongoDB

## Development Notes

- Built for a 2-day hackathon
- Mock mode enabled by default for rapid development
- All services are modular and testable
- TypeScript for type safety
- Comprehensive error handling and logging

## License

MIT
