# JobAgent Backend

AI-powered job application assistant backend built with Node.js, Express, and TypeScript.

## Features

- **Resume Parsing**: Upload resume (PDF/DOCX) and extract structured data using Claude API
- **Profile Management**: Store and manage user profiles with job preferences
- **Automated Job Search**: Search jobs on NetworkIn using AGI browser automation
- **Smart Applications**: Auto-generate tailored cover letters and submit applications
- **Networking Automation**: Find employees at target companies and send personalized messages
- **Response Tracking**: Monitor networking outreach responses

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **AI Services**:
  - Anthropic Claude API (resume parsing, cover letter generation)
  - AGI API (browser automation)
- **Database**: JSON file storage (simple for hackathon)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
PORT=3000
NODE_ENV=development

# Required: Anthropic Claude API key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: AGI Agent API credentials (use mock mode if not available)
# Get your API key from https://api.agi.tech
AGI_API_KEY=your_agi_api_key_here
AGI_API_URL=https://api.agi.tech/v1

# Set to 'true' to use mock AGI responses (for development)
USE_MOCK_AGI=true

# File upload settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Resume & Profile

- `POST /api/resume/upload` - Upload and parse resume
- `POST /api/profile` - Create user profile
- `GET /api/profile/:id` - Get profile by ID
- `PATCH /api/profile/:id` - Update profile
- `GET /api/profile` - Get all profiles

### Jobs

- `POST /api/jobs/search-and-apply` - Search jobs and auto-apply
- `GET /api/jobs/applications/:profileId` - Get all applications for user
- `GET /api/jobs/application/:id` - Get single application

### Networking

- `POST /api/networking/reach-out` - Find people and send outreach
- `POST /api/networking/check-responses` - Check for message responses
- `GET /api/networking/:applicationId` - Get contacts for application

## Project Structure

```
backend/
├── src/
│   ├── server.ts                     # Express app setup
│   ├── routes/                       # API route handlers
│   ├── services/                     # Business logic services
│   ├── data/                         # JSON data store
│   ├── types/                        # TypeScript interfaces
│   └── utils/                        # Utilities (Claude client, logger, etc.)
├── data/                             # JSON database files
├── uploads/                          # Uploaded resume files
└── package.json
```

## Testing

### Test Resume Upload

```bash
curl -X POST http://localhost:3000/api/resume/upload \
  -F "resumeFile=@/path/to/resume.pdf"
```

### Test Profile Creation

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

### Test Job Search

```bash
curl -X POST http://localhost:3000/api/jobs/search-and-apply \
  -H "Content-Type: application/json" \
  -d '{"profileId": "YOUR_PROFILE_ID"}'
```

## Mock Mode

By default, the backend uses mock AGI responses for development. This allows you to test the full workflow without the AGI API:

- Mock job searches return 3 sample jobs
- Mock applications succeed automatically
- Mock networking finds 3 sample contacts
- Mock response checking randomly simulates responses

To disable mock mode and use the real AGI API, set `USE_MOCK_AGI=false` in `.env`.

## License

MIT
