// types/models.ts

export interface UserProfile {
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

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string; // "2020-01"
  endDate: string | "Present";
  description: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string; // "Bachelor's", "Master's", etc.
  field: string; // "Computer Science"
  graduationDate: string; // "2020-05"
  gpa?: string;
}

export interface JobApplication {
  id: string;
  userId: string;

  // Job Details (from NetworkIn)
  jobTitle: string;
  company: string;
  location: string;
  jobUrl: string; // NetworkIn job URL
  jobDescription: string; // Brief description from search results

  // Detailed job info (scraped from individual job page)
  detailedDescription?: string; // Full "About the job" section
  requirements?: string[]; // Required qualifications
  responsibilities?: string[]; // Key responsibilities
  skills?: string[]; // Required/preferred skills
  salary?: string; // Salary range if available

  // Application Materials (generated)
  coverLetter: string;
  coverLetterStatus?: 'pending' | 'approved' | 'rejected'; // User approval status
  coverLetterHistory?: Array<{ // Track previous drafts
    letter: string;
    feedback?: string;
    timestamp: Date;
  }>;

  // Application Status
  status: 'pending' | 'applied' | 'interviewing' | 'rejected' | 'accepted';

  appliedAt: Date;

  // Networking (sub-items)
  networkingContacts: NetworkingContact[];
}

export interface NetworkingContact {
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

// Conversation tracking for agent interactions
export interface ConversationMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'voice' | 'text';
    callSid?: string; // Telnyx call SID if voice
    jobsFound?: any[]; // If presenting jobs
    coverLetterDraft?: string; // If presenting cover letter
    contactsFound?: any[]; // If presenting networking contacts
    messageDraft?: string; // If presenting networking message
    pendingAction?: 'approve_jobs' | 'approve_cover_letter' | 'approve_contacts' | 'approve_messages';
  };
}

export interface ConversationState {
  userId: string;
  stage: 'profile_collection' | 'job_search' | 'job_review' | 'cover_letter_review' | 'application' | 'networking_search' | 'networking_review' | 'networking_message_review' | 'complete';
  profileData?: Partial<UserProfile>;
  selectedJobs?: string[]; // Job IDs user wants to apply to
  coverLetterDrafts?: { [jobId: string]: string };
  approvedCoverLetters?: { [jobId: string]: string };
  selectedContacts?: { [applicationId: string]: string[] }; // Contact IDs to reach out to
  messageDrafts?: { [contactId: string]: string };
  approvedMessages?: { [contactId: string]: string };
  lastUpdated: Date;
}

// AGI webhook events
export interface AGIWebhookEvent {
  event: 'session.created' | 'session.status_changed' | 'session.deleted' | 'task.started' | 'task.completed' | 'task.question' | 'task.error';
  timestamp: string;
  session: {
    id: string;
    status: string;
    agent_name: string;
    created_at: string;
    vnc_url: string;
  };
  message?: string;
  result?: any;
  question?: string;
  error?: string;
  old_status?: string;
  new_status?: string;
}
