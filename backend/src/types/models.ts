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
