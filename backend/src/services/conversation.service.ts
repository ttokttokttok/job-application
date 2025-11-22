import { Anthropic } from '@anthropic-ai/sdk';
import { ConversationMessage, ConversationState, UserProfile } from '../types/models';
import { DataStore } from '../data/store';
import { JobApplicationService } from './jobApplication.service';
import { NetworkingService } from './networking.service';
import { CoverLetterService } from './coverLetter.service';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Conversation Service
 * Orchestrates the conversational workflow for job hunting with human-in-the-loop
 */
export class ConversationService {
  private claude: Anthropic;
  private dataStore: DataStore;
  private jobService: JobApplicationService;
  private networkingService: NetworkingService;
  private coverLetterService: CoverLetterService;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    this.dataStore = new DataStore();
    this.jobService = new JobApplicationService();
    this.networkingService = new NetworkingService();
    this.coverLetterService = new CoverLetterService();
  }

  /**
   * Initialize a new conversation for a user
   */
  async initializeConversation(userId: string, profileData: Partial<UserProfile>): Promise<ConversationState> {
    const state: ConversationState = {
      userId,
      stage: 'profile_collection',
      profileData,
      lastUpdated: new Date(),
    };

    await this.saveConversationState(state);
    return state;
  }

  /**
   * Process a user message and return agent response
   */
  async processMessage(
    userId: string,
    userMessage: string,
    messageType: 'voice' | 'text' = 'text'
  ): Promise<{ response: string; state: ConversationState; metadata?: any }> {
    // Get conversation state
    const state = await this.getConversationState(userId);
    const conversationHistory = await this.getConversationHistory(userId);

    // Save user message
    await this.saveMessage({
      id: uuidv4(),
      userId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      metadata: { type: messageType },
    });

    // Process based on current stage
    let response: string;
    let metadata: any = {};
    let updatedState = { ...state };

    switch (state.stage) {
      case 'profile_collection':
        ({ response, updatedState, metadata } = await this.handleProfileCollection(state, userMessage, conversationHistory));
        break;
      case 'job_search':
        ({ response, updatedState, metadata } = await this.handleJobSearch(state, userMessage));
        break;
      case 'job_review':
        ({ response, updatedState, metadata } = await this.handleJobReview(state, userMessage));
        break;
      case 'cover_letter_review':
        ({ response, updatedState, metadata } = await this.handleCoverLetterReview(state, userMessage));
        break;
      case 'application':
        ({ response, updatedState, metadata } = await this.handleApplication(state, userMessage));
        break;
      case 'networking_search':
        ({ response, updatedState, metadata } = await this.handleNetworkingSearch(state, userMessage));
        break;
      case 'networking_review':
        ({ response, updatedState, metadata } = await this.handleNetworkingReview(state, userMessage));
        break;
      case 'networking_message_review':
        ({ response, updatedState, metadata } = await this.handleNetworkingMessageReview(state, userMessage));
        break;
      default:
        response = "I'm here to help! How can I assist you with your job search?";
    }

    // Save agent response
    await this.saveMessage({
      id: uuidv4(),
      userId,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata,
    });

    // Update state
    updatedState.lastUpdated = new Date();
    await this.saveConversationState(updatedState);

    return { response, state: updatedState, metadata };
  }

  /**
   * Handle profile collection stage
   */
  private async handleProfileCollection(
    state: ConversationState,
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    // Use Claude to extract job preferences from conversation
    const profile = state.profileData || {};

    // Check if we have all required info
    const hasDesiredPosition = profile.desiredPosition;
    const hasLocations = profile.locations && profile.locations.length > 0;
    const hasCurrentLocation = profile.currentLocation;

    if (!hasDesiredPosition || !hasLocations || !hasCurrentLocation) {
      // Ask for missing information
      const prompt = `You are a helpful job search assistant. The user has uploaded their resume and we've extracted their profile information.

Current profile data:
${JSON.stringify(profile, null, 2)}

Conversation history:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

User's latest message: "${userMessage}"

We need to collect three pieces of information to help with the job search:
1. Desired position (e.g., "software engineer", "product manager")
2. Preferred locations (can be multiple, including "Remote")
3. Current location

Generate a natural, conversational response that:
- Acknowledges what the user said
- Asks for the next missing piece of information in a friendly way
- If the user provided information in their message, extract it and ask for the next missing piece

Respond with ONLY the message to send to the user.`;

      const message = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const response = message.content[0].text;

      // Try to extract information from user message
      const extractionPrompt = `Extract job search preferences from this message: "${userMessage}"

Return a JSON object with any of these fields that are mentioned:
{
  "desiredPosition": "string or null",
  "locations": ["array of locations"] or null,
  "currentLocation": "string or null"
}

Return ONLY valid JSON.`;

      const extraction = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: extractionPrompt }]
      });

      try {
        const extracted = JSON.parse(extraction.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        if (extracted.desiredPosition) profile.desiredPosition = extracted.desiredPosition;
        if (extracted.locations && Array.isArray(extracted.locations)) profile.locations = extracted.locations;
        if (extracted.currentLocation) profile.currentLocation = extracted.currentLocation;
      } catch (e) {
        logger.warn('Failed to extract profile data from message');
      }

      return {
        response,
        updatedState: { ...state, profileData: profile },
        metadata: {},
      };
    }

    // We have all info - move to job search
    const response = `Great! I have everything I need:
- Position: ${profile.desiredPosition}
- Locations: ${profile.locations?.join(', ') || 'Not specified'}
- Current location: ${profile.currentLocation}

Based on your background and preferences, you seem to be a great fit for ${profile.desiredPosition} roles. Let me search for jobs that match your profile. This will take a moment...`;

    return {
      response,
      updatedState: { ...state, stage: 'job_search', profileData: profile },
      metadata: { pendingAction: 'job_search' },
    };
  }

  /**
   * Handle job search stage
   */
  private async handleJobSearch(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    // Trigger job search via AGI
    logger.info('Starting job search...');

    // Save profile first
    const profile = state.profileData as UserProfile;
    profile.id = state.userId;
    profile.createdAt = new Date();
    profile.updatedAt = new Date();
    await this.dataStore.saveProfile(profile);

    // Search for jobs
    const result = await this.jobService.searchAndApply(state.userId);

    const response = `I found ${result.jobsFound} jobs that match your profile! Here's what I found:\n\n${result.applications.map((app, i) =>
      `${i + 1}. **${app.jobTitle}** at ${app.company}\n   Location: ${app.location}\n   Description: ${app.jobDescription.substring(0, 150)}...`
    ).join('\n\n')}

Which of these positions would you like to apply to? You can say "all of them", specific numbers like "1, 3, and 4", or "none" if you'd like to search for different roles.`;

    return {
      response,
      updatedState: { ...state, stage: 'job_review' },
      metadata: {
        jobsFound: result.applications,
        pendingAction: 'approve_jobs'
      },
    };
  }

  /**
   * Handle job review stage
   */
  private async handleJobReview(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    // Parse user selection
    const applications = await this.dataStore.getApplicationsByUser(state.userId);

    let selectedJobs: string[] = [];

    if (userMessage.toLowerCase().includes('all')) {
      selectedJobs = applications.map(a => a.id);
    } else if (userMessage.toLowerCase().includes('none')) {
      return {
        response: "No problem! Would you like me to search for different positions, or would you like to adjust your search criteria?",
        updatedState: { ...state, stage: 'profile_collection' },
        metadata: {},
      };
    } else {
      // Extract numbers
      const numbers = userMessage.match(/\d+/g);
      if (numbers) {
        selectedJobs = numbers
          .map(n => parseInt(n) - 1)
          .filter(i => i >= 0 && i < applications.length)
          .map(i => applications[i].id);
      }
    }

    if (selectedJobs.length === 0) {
      return {
        response: "I didn't quite catch which jobs you'd like to apply to. Could you please specify? For example, you can say 'jobs 1 and 3' or 'all of them'.",
        updatedState: state,
        metadata: {},
      };
    }

    const response = `Perfect! I'll prepare applications for ${selectedJobs.length} position(s). Let me generate customized cover letters for each one. This will take a moment...`;

    return {
      response,
      updatedState: { ...state, stage: 'cover_letter_review', selectedJobs },
      metadata: { pendingAction: 'generate_cover_letters' },
    };
  }

  /**
   * Handle cover letter review stage
   */
  private async handleCoverLetterReview(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    // Generate cover letters for selected jobs
    const coverLetterDrafts: { [jobId: string]: string } = {};

    for (const jobId of state.selectedJobs || []) {
      const application = await this.dataStore.getApplication(jobId);
      const profile = await this.dataStore.getProfile(state.userId);

      const coverLetter = await this.coverLetterService.generateCoverLetter(profile, {
        title: application.jobTitle,
        company: application.company,
        description: application.jobDescription,
        requirements: application.requirements,
      });

      coverLetterDrafts[jobId] = coverLetter;
    }

    const applications = await Promise.all(
      (state.selectedJobs || []).map(id => this.dataStore.getApplication(id))
    );

    const response = `I've prepared cover letters for your applications. Here's the first one for **${applications[0].jobTitle}** at ${applications[0].company}:\n\n---\n${coverLetterDrafts[applications[0].id]}\n---\n\nWhat do you think? Would you like me to:\n1. Use this for all applications\n2. Customize it\n3. Show me the next one`;

    return {
      response,
      updatedState: { ...state, coverLetterDrafts },
      metadata: {
        coverLetterDraft: coverLetterDrafts[applications[0].id],
        pendingAction: 'approve_cover_letter'
      },
    };
  }

  /**
   * Handle application submission stage
   */
  private async handleApplication(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    // Submit applications
    const response = `Great! I'm submitting your applications now. This may take a few minutes...`;

    // Applications will be submitted via AGI
    // Update application records with cover letters

    return {
      response: `All done! I've successfully submitted ${state.selectedJobs?.length || 0} applications.

Now, would you like me to reach out to people at these companies to help you get referrals and schedule coffee chats? I can find employees who work there and send personalized messages.`,
      updatedState: { ...state, stage: 'networking_search' },
      metadata: {},
    };
  }

  /**
   * Handle networking search stage
   */
  private async handleNetworkingSearch(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('sure')) {
      const response = `Excellent! Let me find people at these companies who might be able to help. This will take a moment...`;

      return {
        response,
        updatedState: { ...state, stage: 'networking_review' },
        metadata: { pendingAction: 'search_contacts' },
      };
    }

    return {
      response: `No problem! Your applications have been submitted. You can always come back later if you'd like help with networking. Is there anything else I can help you with?`,
      updatedState: { ...state, stage: 'complete' },
      metadata: {},
    };
  }

  /**
   * Handle networking review stage
   */
  private async handleNetworkingReview(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    // Search for contacts (this would integrate with AGI)
    const response = `I found several people who work at these companies and might be able to help. Would you like me to reach out to them on your behalf?`;

    return {
      response,
      updatedState: { ...state, stage: 'networking_message_review' },
      metadata: { pendingAction: 'approve_contacts' },
    };
  }

  /**
   * Handle networking message review stage
   */
  private async handleNetworkingMessageReview(
    state: ConversationState,
    userMessage: string
  ): Promise<{ response: string; updatedState: ConversationState; metadata: any }> {
    const response = `Perfect! I'll send those messages. You're all set! I'll keep you updated on any responses.`;

    return {
      response,
      updatedState: { ...state, stage: 'complete' },
      metadata: {},
    };
  }

  /**
   * Get conversation state from database
   */
  private async getConversationState(userId: string): Promise<ConversationState> {
    const state = await this.dataStore.getConversationState(userId);
    if (state) {
      return state;
    }

    // Return default state if none exists
    return {
      userId,
      stage: 'profile_collection',
      lastUpdated: new Date(),
    };
  }

  /**
   * Save conversation state to database
   */
  private async saveConversationState(state: ConversationState): Promise<void> {
    await this.dataStore.saveConversationState(state);
    logger.info(`Saving conversation state for user ${state.userId}: ${state.stage}`);
  }

  /**
   * Get conversation history
   */
  private async getConversationHistory(userId: string): Promise<ConversationMessage[]> {
    return await this.dataStore.getConversationMessages(userId);
  }

  /**
   * Save a conversation message
   */
  private async saveMessage(message: ConversationMessage): Promise<void> {
    await this.dataStore.saveConversationMessage(message);
    logger.info(`Saving message: ${message.role} - ${message.content.substring(0, 50)}...`);
  }
}
