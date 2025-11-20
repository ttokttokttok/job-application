// types/agiAgent.ts
// Type definitions for AGI Agent Sessions API

export type AgentName = 'agi-0' | 'agi-0-fast';

export type SessionStatus = 
  | 'initializing' 
  | 'ready' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'error' 
  | 'terminated';

export type ExecutionStatus = 
  | 'running' 
  | 'waiting_for_input' 
  | 'finished' 
  | 'error';

export type MessageType = 
  | 'THOUGHT' 
  | 'QUESTION' 
  | 'DONE' 
  | 'ERROR' 
  | 'LOG';

// Session Management
export interface CreateSessionRequest {
  agent_name?: AgentName;
  save_on_exit?: boolean;
}

export interface CreateSessionResponse {
  session_id: string;
  vnc_url: string;
  agent_name: AgentName;
  status: SessionStatus;
  created_at: string;
}

export interface SessionStatusResponse {
  session_id: string;
  status: SessionStatus;
  execution_status?: ExecutionStatus;
  agent_name: AgentName;
  created_at: string;
  updated_at?: string;
}

// Messages
export interface SendMessageRequest {
  message: string;
  start_url?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
}

export interface Message {
  id: number;
  type: MessageType;
  content: string;
  timestamp: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  has_more?: boolean;
}

// Control Operations
export interface ControlResponse {
  success: boolean;
  message: string;
}

// Browser Control
export interface NavigateRequest {
  url: string;
}

export interface NavigateResponse {
  current_url: string;
}

export interface ScreenshotResponse {
  screenshot: string; // Base64 data URL
  url: string;
  title: string;
}

// Event Streaming (SSE)
export interface EventData {
  type: string;
  data: any;
  timestamp: string;
}

