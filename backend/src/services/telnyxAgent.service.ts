import axios from 'axios';
import logger from '../utils/logger';
import { ConversationMessage, ConversationState } from '../types/models';

/**
 * Telnyx Agent Service
 * Handles voice and text-based agent interactions using Telnyx API
 */
export class TelnyxAgentService {
  private apiKey: string;
  private apiUrl: string;
  private agentId: string;

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY || '';
    this.apiUrl = process.env.TELNYX_API_URL || 'https://api.telnyx.com/v2';
    this.agentId = process.env.TELNYX_AGENT_ID || '';

    if (!this.apiKey) {
      logger.warn('TELNYX_API_KEY not configured. Telnyx agent will not work.');
    }
  }

  /**
   * Start a voice call session with the agent
   */
  async startVoiceSession(phoneNumber: string, userId: string): Promise<{ callSid: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/calls`,
        {
          connection_id: this.agentId,
          to: phoneNumber,
          from: process.env.TELNYX_PHONE_NUMBER,
          webhook_url: `${process.env.BACKEND_URL}/api/agent/voice-webhook`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { callSid: response.data.data.call_control_id };
    } catch (error: any) {
      logger.error('Telnyx voice session error:', error.response?.data || error.message);
      throw new Error('Failed to start voice session');
    }
  }

  /**
   * Start an interview practice call with AI assistant
   *
   * Uses Telnyx TeXML calls endpoint
   */
  async startInterviewPractice(
    phoneNumber: string,
    jobContext: { company: string; position: string }
  ): Promise<{ callSid: string }> {
    const callId = process.env.TELNYX_CALL_ID || '';
    const fromNumber = process.env.TELNYX_PHONE_NUMBER || '';

    try {
      if (!callId) {
        throw new Error('TELNYX_CALL_ID not configured.');
      }

      if (!fromNumber) {
        throw new Error('TELNYX_PHONE_NUMBER not configured');
      }

      // Clean the job title - remove markdown and numbering
      const cleanPosition = jobContext.position
        .replace(/^\d+\.\s*/, '')  // Remove "1. " or "2. " prefix
        .replace(/\*\*/g, '')       // Remove ** markdown bold
        .trim();

      logger.info(`Initiating interview practice call to ${phoneNumber} for ${cleanPosition} at ${jobContext.company}`);
      logger.info(`Using Call ID: ${callId}, From: ${fromNumber}`);

      // Use EXACT format from your curl example
      const payload = {
        From: fromNumber,
        To: phoneNumber,
        AIAssistantDynamicVariables: {
          // job_context: `${cleanPosition} at ${jobContext.company}`
          job_context: `hi melvin this is a call from ${jobContext.company}. I hear that you want to interview prep for the position of ${cleanPosition} at ${jobContext.company}. Would you like to get started?`
        }
      };

      logger.info(`Request payload:`, JSON.stringify(payload, null, 2));
      logger.info(`Calling endpoint: ${this.apiUrl}/texml/calls/${callId}`);

      const response = await axios.post(
        `${this.apiUrl}/texml/calls/${callId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`Interview practice call initiated successfully`);
      logger.info(`Response:`, JSON.stringify(response.data, null, 2));

      return { callSid: response.data.call_control_id || response.data.call_session_id || response.data.id || 'success' };
    } catch (error: any) {
      // Log detailed error information
      logger.error('Telnyx interview practice error - Full details:');
      logger.error(`Status: ${error.response?.status}`);
      logger.error(`Status Text: ${error.response?.statusText}`);
      logger.error(`Error Data: ${JSON.stringify(error.response?.data, null, 2)}`);
      logger.error(`Error Message: ${error.message}`);
      logger.error(`Request URL: ${error.config?.url}`);
      logger.error(`Request Method: ${error.config?.method}`);
      logger.error(`Full error: ${JSON.stringify(error, null, 2)}`);

      if (error.response?.status === 404) {
        throw new Error(`TeXML Call not found. URL: ${error.config?.url}. Please verify your TELNYX_CALL_ID (${callId}) is correct.`);
      }

      // Extract the actual error message
      const telnyxError = error.response?.data?.errors?.[0];
      const errorDetail = telnyxError?.detail || error.response?.data?.message || error.message;
      const errorCode = telnyxError?.code;

      if (error.response?.status === 401) {
        throw new Error('Telnyx authentication failed. Please check your TELNYX_API_KEY.');
      }

      if (error.response?.status === 403) {
        if (errorDetail?.includes('Busy Here')) {
          throw new Error(`Phone line is busy or unavailable. Error: ${errorDetail}. Make sure you're calling a different number than the "From" number.`);
        }
        throw new Error(`Telnyx API error (403): ${errorDetail}${errorCode ? ` (Code: ${errorCode})` : ''}`);
      }

      const errorMessage = errorDetail || 'Failed to start interview practice call';
      throw new Error(errorMessage);
    }
  }

  /**
   * Send a text message via Telnyx
   */
  async sendTextMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/messages`,
        {
          from: process.env.TELNYX_PHONE_NUMBER,
          to: phoneNumber,
          text: message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      logger.error('Telnyx text message error:', error.response?.data || error.message);
      throw new Error('Failed to send text message');
    }
  }

  /**
   * Process incoming voice webhook from Telnyx
   */
  async handleVoiceWebhook(payload: any): Promise<any> {
    const eventType = payload.data?.event_type;

    logger.info(`Telnyx voice webhook: ${eventType}`);

    switch (eventType) {
      case 'call.initiated':
        return this.handleCallInitiated(payload);
      case 'call.answered':
        return this.handleCallAnswered(payload);
      case 'call.hangup':
        return this.handleCallHangup(payload);
      case 'call.speak.ended':
        return this.handleSpeakEnded(payload);
      default:
        logger.info(`Unhandled voice event: ${eventType}`);
        return null;
    }
  }

  private async handleCallInitiated(payload: any) {
    logger.info('Call initiated');
    return null;
  }

  private async handleCallAnswered(payload: any) {
    const callControlId = payload.data.payload.call_control_id;

    // Speak welcome message
    return {
      command: 'speak',
      call_control_id: callControlId,
      payload: 'Hello! I\'m your JobAgent assistant. I can help you find and apply to jobs, and connect with people at companies you\'re interested in. How can I help you today?',
      voice: 'female',
      language: 'en-US',
    };
  }

  private async handleCallHangup(payload: any) {
    logger.info('Call ended');
    return null;
  }

  private async handleSpeakEnded(payload: any) {
    const callControlId = payload.data.payload.call_control_id;

    // Start listening for user speech
    return {
      command: 'gather_using_speech',
      call_control_id: callControlId,
      payload: {
        language: 'en-US',
        timeout_millis: 5000,
      },
    };
  }

  /**
   * Process incoming SMS webhook from Telnyx
   */
  async handleSMSWebhook(payload: any): Promise<void> {
    const eventType = payload.data?.event_type;

    logger.info(`Telnyx SMS webhook: ${eventType}`);

    if (eventType === 'message.received') {
      const from = payload.data.payload.from.phone_number;
      const text = payload.data.payload.text;

      logger.info(`SMS received from ${from}: ${text}`);

      // Process the message through the agent conversation system
      // This will be handled by the conversation service
    }
  }

  /**
   * Generate agent response using Claude
   */
  async generateResponse(
    conversationHistory: ConversationMessage[],
    conversationState: ConversationState
  ): Promise<{ message: string; updatedState: ConversationState }> {
    // This will integrate with Claude API to generate contextual responses
    // For now, return a placeholder
    return {
      message: 'I understand. Let me help you with that.',
      updatedState: conversationState,
    };
  }
}
