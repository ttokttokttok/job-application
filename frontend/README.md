# JobAgent Frontend

React + TypeScript frontend for the JobAgent AI-powered job application assistant.

## Features

- **Resume Upload**: Drag & drop resume upload with automatic parsing
- **Profile Management**: Review and edit parsed profile data
- **Applications Dashboard**: View all job applications in one place
- **Application Details**: Detailed view with cover letters and networking contacts
- **Networking**: Track outreach to employees and responses

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Axios
- CSS (vanilla, no framework)

## Design

- White background (#ffffff)
- Light gray containers (#f8f8f8)
- Red accent color (#dc2626)
- Black text (#000000)
- Clean, minimal design

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

The `.env` file is already created with:
```
VITE_API_URL=http://localhost:3000/api
```

Update this if your backend runs on a different port.

### 3. Run Development Server

```bash
npm run dev
```

The frontend will run on http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Pages

1. **Resume Upload** (`/`)
   - Upload resume (PDF/DOCX)
   - Drag & drop support
   - Automatic parsing with Claude API

2. **Profile Form** (`/profile`)
   - Review parsed resume data
   - Edit personal information
   - Add/remove skills
   - Set job preferences and locations

3. **Dashboard** (`/dashboard`)
   - View all applications
   - Start job search
   - Reach out for referrals
   - Status badges

4. **Application Details** (`/application/:id`)
   - Job description and requirements
   - View cover letter
   - Networking contacts with status
   - Check for responses

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api`.

All API calls are made through the `apiClient` in `src/api/client.ts`.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set the environment variable: `VITE_API_URL=https://your-backend-url.com/api`
3. Deploy

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

## Development Notes

- Profile ID is stored in localStorage after profile creation
- Resume data is passed through localStorage from upload to profile form
- All dates are displayed in local format
- External links (NetworkIn profiles, job postings) open in new tabs
