export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  desiredPosition: string;
  locations: string[];
  currentLocation: string;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  location: string;
  jobUrl: string;
  jobDescription: string;
  requirements: string[];
  coverLetter: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'accepted';
  appliedAt: Date;
  networkingContacts: NetworkingContact[];
}

export interface NetworkingContact {
  id: string;
  applicationId: string;
  name: string;
  title: string;
  company: string;
  connectionDegree: '1st' | '2nd' | '3rd';
  profileUrl: string;
  description?: string;
  outreachType: 'message' | 'connection_request';
  messageText: string;
  messagingThreadUrl?: string;
  status: 'pending' | 'responded' | 'no_response';
  sentAt: Date;
  lastCheckedAt?: Date;
  responseText?: string;
}
