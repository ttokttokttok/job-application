// services/agiAgent.service.ts
// AGI Agent Sessions API client implementation

import axios, { AxiosInstance } from 'axios';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionStatusResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesResponse,
  Message,
  ControlResponse,
  NavigateRequest,
  NavigateResponse,
  ScreenshotResponse,
  AgentName,
  SessionStatus,
  ExecutionStatus,
} from '../types/agiAgent';
import logger from '../utils/logger';

export class AGIAgentService {
  private apiKey: string;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;
  private useMock: boolean;

  constructor() {
    this.apiKey = process.env.AGI_API_KEY || '';
    this.baseUrl = process.env.AGI_API_URL || 'https://api.agi.tech/v1';
    this.useMock = process.env.USE_MOCK_AGI === 'true';

    // Create axios instance with default headers
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug(`AGI API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('AGI API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          logger.error(
            `AGI API Error: ${error.response.status} - ${error.response.statusText}`,
            error.response.data
          );
        } else if (error.request) {
          logger.error('AGI API Network Error: No response received');
        } else {
          logger.error('AGI API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new agent session
   */
  async createSession(
    options: CreateSessionRequest = {}
  ): Promise<CreateSessionResponse> {
    if (this.useMock) {
      return this.mockCreateSession(options.agent_name);
    }

    // Default to agi-0-fast if not specified to save Claude credits
    const defaultAgentName = (process.env.AGI_AGENT_NAME as AgentName) || 'agi-0-fast';
    const agentName = options.agent_name || defaultAgentName;

    const response = await this.axiosInstance.post<CreateSessionResponse>(
      '/sessions',
      {
        agent_name: agentName,
        save_on_exit: options.save_on_exit ?? false,
      }
    );

    logger.info(`Created AGI session: ${response.data.session_id} with agent: ${agentName}`);
    return response.data;
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    if (this.useMock) {
      return this.mockGetSessionStatus(sessionId);
    }

    const response = await this.axiosInstance.get<SessionStatusResponse>(
      `/sessions/${sessionId}/status`
    );

    return response.data;
  }

  /**
   * Send a message to the agent
   */
  async sendMessage(
    sessionId: string,
    message: string,
    startUrl?: string
  ): Promise<SendMessageResponse> {
    if (this.useMock) {
      return this.mockSendMessage();
    }

    const payload: SendMessageRequest = { message };
    if (startUrl) {
      payload.start_url = startUrl;
    }

    const response = await this.axiosInstance.post<SendMessageResponse>(
      `/sessions/${sessionId}/message`,
      payload
    );

    logger.info(`Sent message to session ${sessionId}`);
    return response.data;
  }

  /**
   * Get messages from a session
   */
  async getMessages(
    sessionId: string,
    afterId: number = 0
  ): Promise<GetMessagesResponse> {
    if (this.useMock) {
      return this.mockGetMessages(afterId);
    }

    const response = await this.axiosInstance.get<GetMessagesResponse>(
      `/sessions/${sessionId}/messages`,
      {
        params: { after_id: afterId },
      }
    );

    return response.data;
  }

  /**
   * Poll for new messages (convenience method)
   */
  async pollMessages(
    sessionId: string,
    afterId: number = 0,
    maxWaitTime: number = 60000
  ): Promise<Message[]> {
    const startTime = Date.now();
    let currentAfterId = afterId;
    const allMessages: Message[] = [];

    while (Date.now() - startTime < maxWaitTime) {
      const response = await this.getMessages(sessionId, currentAfterId);
      
      if (response.messages && response.messages.length > 0) {
        allMessages.push(...response.messages);
        currentAfterId = Math.max(
          ...response.messages.map((m) => m.id),
          currentAfterId
        );
      }

      // Check if we should continue polling
      const status = await this.getSessionStatus(sessionId);
      if (
        status.execution_status === 'finished' ||
        status.execution_status === 'error' ||
        status.status === 'completed' ||
        status.status === 'error'
      ) {
        break;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return allMessages;
  }

  /**
   * Wait for task completion
   */
  async waitForCompletion(
    sessionId: string,
    timeout: number = 300000, // 5 minutes default
    pollInterval: number = 2000 // 2 seconds
  ): Promise<{ status: SessionStatus; executionStatus: ExecutionStatus; messages: Message[] }> {
    const startTime = Date.now();
    let afterId = 0;
    const allMessages: Message[] = [];

    while (Date.now() - startTime < timeout) {
      const status = await this.getSessionStatus(sessionId);
      
      // Get new messages
      const messagesResponse = await this.getMessages(sessionId, afterId);
      if (messagesResponse.messages && messagesResponse.messages.length > 0) {
        allMessages.push(...messagesResponse.messages);
        afterId = Math.max(
          ...messagesResponse.messages.map((m) => m.id),
          afterId
        );
      }

      // Check if completed
      if (
        status.execution_status === 'finished' ||
        status.execution_status === 'error' ||
        status.status === 'completed' ||
        status.status === 'error'
      ) {
        return {
          status: status.status,
          executionStatus: status.execution_status || 'finished',
          messages: allMessages,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timeout waiting for session ${sessionId} to complete`);
  }

  /**
   * Pause session execution
   */
  async pauseSession(sessionId: string): Promise<ControlResponse> {
    if (this.useMock) {
      return this.mockControlResponse('paused');
    }

    const response = await this.axiosInstance.post<ControlResponse>(
      `/sessions/${sessionId}/pause`
    );

    logger.info(`Paused session ${sessionId}`);
    return response.data;
  }

  /**
   * Resume session execution
   */
  async resumeSession(sessionId: string): Promise<ControlResponse> {
    if (this.useMock) {
      return this.mockControlResponse('resumed');
    }

    const response = await this.axiosInstance.post<ControlResponse>(
      `/sessions/${sessionId}/resume`
    );

    logger.info(`Resumed session ${sessionId}`);
    return response.data;
  }

  /**
   * Cancel session execution
   */
  async cancelSession(sessionId: string): Promise<ControlResponse> {
    if (this.useMock) {
      return this.mockControlResponse('cancelled');
    }

    const response = await this.axiosInstance.post<ControlResponse>(
      `/sessions/${sessionId}/cancel`
    );

    logger.info(`Cancelled session ${sessionId}`);
    return response.data;
  }

  /**
   * Navigate browser to URL
   */
  async navigate(sessionId: string, url: string): Promise<NavigateResponse> {
    if (this.useMock) {
      return { current_url: url };
    }

    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://');
    }

    if (url.length > 2000) {
      throw new Error('URL too long (max 2000 characters)');
    }

    const response = await this.axiosInstance.post<NavigateResponse>(
      `/sessions/${sessionId}/navigate`,
      { url } as NavigateRequest
    );

    logger.info(`Navigated session ${sessionId} to ${response.data.current_url}`);
    return response.data;
  }

  /**
   * Get screenshot of current browser state
   */
  async getScreenshot(sessionId: string): Promise<ScreenshotResponse> {
    if (this.useMock) {
      return this.mockScreenshot();
    }

    const response = await this.axiosInstance.get<ScreenshotResponse>(
      `/sessions/${sessionId}/screenshot`
    );

    return response.data;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (this.useMock) {
      logger.info(`Mock: Deleted session ${sessionId}`);
      return;
    }

    await this.axiosInstance.delete(`/sessions/${sessionId}`);
    logger.info(`Deleted session ${sessionId}`);
  }

  /**
   * Stream events using Server-Sent Events (SSE)
   * Note: This is a basic implementation. For production, consider using a proper SSE client.
   */
  async streamEvents(
    sessionId: string,
    onEvent: (event: any) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.useMock) {
      logger.warn('Event streaming not supported in mock mode');
      return;
    }

    // This would require a proper SSE client implementation
    // For now, we'll use polling as an alternative
    logger.warn('SSE streaming not fully implemented. Use pollMessages() instead.');
    throw new Error('SSE streaming not yet implemented. Use pollMessages() for now.');
  }

  // Mock implementations for development
  private mockCreateSession(agentName?: AgentName): CreateSessionResponse {
    const sessionId = `mock_session_${Date.now()}`;
    const defaultAgentName = (process.env.AGI_AGENT_NAME as AgentName) || 'agi-0-fast';
    return {
      session_id: sessionId,
      vnc_url: `https://mock-vnc.agi.tech/${sessionId}`,
      agent_name: agentName || defaultAgentName,
      status: 'ready',
      created_at: new Date().toISOString(),
    };
  }

  private mockGetSessionStatus(sessionId: string): SessionStatusResponse {
    return {
      session_id: sessionId,
      status: 'running',
      execution_status: 'running',
      agent_name: 'agi-0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private mockSendMessage(): SendMessageResponse {
    return {
      success: true,
      message_id: `msg_${Date.now()}`,
    };
  }

  private mockGetMessages(afterId: number): GetMessagesResponse {
    const messages: Message[] = [];
    
    if (afterId === 0) {
      messages.push({
        id: 1,
        type: 'THOUGHT',
        content: 'Starting task...',
        timestamp: new Date().toISOString(),
      });
    }

    return { messages };
  }

  private mockControlResponse(action: string): ControlResponse {
    return {
      success: true,
      message: `Session ${action} successfully`,
    };
  }

  private mockScreenshot(): ScreenshotResponse {
    // Return a minimal base64 placeholder
    const placeholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    return {
      screenshot: placeholder,
      url: 'https://example.com',
      title: 'Mock Page',
    };
  }
}

