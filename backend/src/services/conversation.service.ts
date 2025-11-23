import { Anthropic } from '@anthropic-ai/sdk';
import { ConversationMessage, ConversationState, UserProfile } from '../types/models';
import { DataStore } from '../data/store';
import { JobApplicationService } from './jobApplication.service';
import { NetworkingService } from './networking.service';
import { CoverLetterService } from './coverLetter.service';
import { TelnyxChatService } from './telnyxChat.service';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Conversation Service
 * Orchestrates the conversational workflow for job hunting with human-in-the-loop
 */
export class ConversationService {
  private claude: Anthropic;
  private telnyx: TelnyxChatService;
  private useTelnyx: boolean;
  private dataStore: DataStore;
  private jobService: JobApplicationService;
  private networkingService: NetworkingService;
  private coverLetterService: CoverLetterService;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    this.telnyx = new TelnyxChatService();
    // Use Telnyx if available, otherwise fall back to Claude
    this.useTelnyx = this.telnyx.isAvailable() && process.env.USE_TELNYX_CHAT === 'true';

    if (this.useTelnyx) {
      logger.info('Using Telnyx Chat API for conversations');
    } else {
      logger.info('Using Claude API directly for conversations');
    }

    this.dataStore = new DataStore();
    this.jobService = new JobApplicationService();
    this.networkingService = new NetworkingService();
    this.coverLetterService = new CoverLetterService();
  }

  /**
   * Generate LLM response using either Telnyx or Claude
   */
  private async generateLLMResponse(prompt: string, maxTokens: number = 500): Promise<string> {
    if (this.useTelnyx) {
      // Use Telnyx Chat API
      const result = await this.telnyx.createChatCompletion({
        messages: [{ role: 'user', content: prompt }],
        maxTokens,
      });
      return result.content;
    } else {
      // Use Claude directly
      const message = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });
      return message.content[0].text;
    }
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

    // FIRST: Try to extract ALL possible information from the user's message
    // This prevents asking for information the user already provided
    const hasDesiredPositionBefore = profile.desiredPosition && profile.desiredPosition.trim().length > 0;
    const hasLocationsBefore = profile.locations && profile.locations.length > 0;
    const hasCurrentLocationBefore = profile.currentLocation && profile.currentLocation.trim().length > 0;

    // Try to extract any missing information from the user's message
    if (!hasDesiredPositionBefore || !hasLocationsBefore || !hasCurrentLocationBefore) {
      // Build extraction prompt that tries to extract all missing fields
      const missingFields = [];
      if (!hasDesiredPositionBefore) missingFields.push('desiredPosition');
      if (!hasLocationsBefore) missingFields.push('locations');
      if (!hasCurrentLocationBefore) missingFields.push('currentLocation');

      const extractionPrompt = `The user is in a conversation about job preferences. Their latest message: "${userMessage}"

Conversation context:
${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Current profile data:
- Desired position: ${profile.desiredPosition || 'NOT COLLECTED YET'}
- Preferred job locations: ${profile.locations && profile.locations.length > 0 ? profile.locations.join(', ') : 'NOT COLLECTED YET'}
- Current location: ${profile.currentLocation || 'NOT COLLECTED YET'}

Extract any of the following that you can identify from the user's message: ${missingFields.join(', ')}.

Return JSON with only the fields you can extract:
{
  ${!hasDesiredPositionBefore ? '"desiredPosition": "job type/role (accept broad answers like engineer, designer, manager)"' : ''}
  ${!hasLocationsBefore ? '"locations": ["array of preferred job locations - can be cities or Remote"]' : ''}
  ${!hasCurrentLocationBefore ? '"currentLocation": "city where they currently live"' : ''}
}

Examples:
- "Engineer" → {"desiredPosition": "Engineer"}
- "San Francisco" → {"locations": ["San Francisco"]} or {"currentLocation": "San Francisco"} depending on context
- "SF and Remote" → {"locations": ["San Francisco", "Remote"]}

If you cannot extract a field, do not include it in the response.`;

      try {
        const extractionResponse = await this.generateLLMResponse(extractionPrompt, 200);
        logger.info(`Extraction response: ${extractionResponse}`);
        const extracted = JSON.parse(extractionResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

        if (extracted.desiredPosition && !hasDesiredPositionBefore) {
          profile.desiredPosition = extracted.desiredPosition;
          logger.info(`✓ Extracted desiredPosition: ${extracted.desiredPosition}`);
        }
        if (extracted.locations && Array.isArray(extracted.locations) && !hasLocationsBefore) {
          profile.locations = extracted.locations;
          logger.info(`✓ Extracted locations: ${JSON.stringify(extracted.locations)}`);
        }
        if (extracted.currentLocation && !hasCurrentLocationBefore) {
          profile.currentLocation = extracted.currentLocation;
          logger.info(`✓ Extracted currentLocation: ${extracted.currentLocation}`);
        }

        // Save updated profile to profiles.json immediately if we extracted anything
        if (state.userId && (extracted.desiredPosition || extracted.locations || extracted.currentLocation)) {
          const existingProfile = await this.dataStore.getProfile(state.userId).catch(() => null);
          const profileToSave = {
            ...existingProfile,
            id: state.userId,
            fullName: profile.fullName || existingProfile?.fullName || '',
            email: profile.email || existingProfile?.email || '',
            phone: profile.phone || existingProfile?.phone || '',
            workExperience: profile.workExperience || existingProfile?.workExperience || [],
            education: profile.education || existingProfile?.education || [],
            skills: profile.skills || existingProfile?.skills || [],
            desiredPosition: profile.desiredPosition || existingProfile?.desiredPosition || '',
            locations: profile.locations || existingProfile?.locations || [],
            currentLocation: profile.currentLocation || existingProfile?.currentLocation || '',
            createdAt: existingProfile?.createdAt || new Date(),
            updatedAt: new Date(),
          };
          await this.dataStore.saveProfile(profileToSave);
          logger.info(`Updated profile in profiles.json with new preferences`);
        }
      } catch (e) {
        logger.warn('Failed to extract profile data from message:', e);
      }
    }

    // NOW check what's still missing after extraction
    const hasDesiredPosition = profile.desiredPosition && profile.desiredPosition.trim().length > 0;
    const hasLocations = profile.locations && profile.locations.length > 0;
    const hasCurrentLocation = profile.currentLocation && profile.currentLocation.trim().length > 0;

    logger.info(`Profile collection status: position=${hasDesiredPosition}, locations=${hasLocations}, currentLocation=${hasCurrentLocation}`);
    logger.info(`Profile data: ${JSON.stringify(profile)}`);

    if (!hasDesiredPosition || !hasLocations || !hasCurrentLocation) {
      // Determine what to ask for next
      let nextQuestion = '';
      if (!hasDesiredPosition) {
        nextQuestion = 'desired_position';
      } else if (!hasLocations) {
        nextQuestion = 'locations';
      } else if (!hasCurrentLocation) {
        nextQuestion = 'current_location';
      }

      logger.info(`Next question to ask: ${nextQuestion}`);

      // Generate response asking for what's still missing
      const prompt = `You are a casual, friendly job search assistant. The user uploaded their resume and you're helping them find jobs.

Current profile data:
- Desired position: ${profile.desiredPosition || 'NOT COLLECTED YET'}
- Preferred job locations: ${profile.locations && profile.locations.length > 0 ? profile.locations.join(', ') : 'NOT COLLECTED YET'}
- Current location: ${profile.currentLocation || 'NOT COLLECTED YET'}

Conversation history:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

User's latest message: "${userMessage}"

Next information we need: ${nextQuestion}

Generate a natural, casual response that:
${!hasDesiredPosition ? '- Asks what kind of role they want (accept broad answers like "engineer", "designer", "manager" - no need to be specific!)' : ''}
${hasDesiredPosition && !hasLocations ? '- Asks where they want to work (can be just a city like "SF" or "New York", or "Remote")' : ''}
${hasDesiredPosition && hasLocations && !hasCurrentLocation ? '- Asks where they are based/living now (just the city is fine)' : ''}
- Acknowledges what they said if relevant
- Keep it super brief and conversational - like texting a friend
- Accept general/broad answers and move on immediately
- DO NOT ask follow-up questions about the role (e.g., if they say "engineer", DO NOT ask "what type of engineer?")
- DO NOT ask about job level, seniority, or experience level - we already have that information
- Once you have an answer for the current question, move to the next question immediately
- If the user already provided the information in their message, acknowledge it and move to the next question

Respond with ONLY the message to send to the user.`;

      const response = await this.generateLLMResponse(prompt, 500);

      return {
        response,
        updatedState: { ...state, profileData: profile },
        metadata: {},
      };
    }

    // We have all info - save final profile and move to job search
    logger.info(`✓ All profile data collected! Moving to job_search stage`);

    // Save complete profile to profiles.json
    const existingProfile = await this.dataStore.getProfile(state.userId).catch(() => null);
    const completeProfile = {
      ...existingProfile,
      id: state.userId,
      fullName: profile.fullName || existingProfile?.fullName || '',
      email: profile.email || existingProfile?.email || '',
      phone: profile.phone || existingProfile?.phone || '',
      workExperience: profile.workExperience || existingProfile?.workExperience || [],
      education: profile.education || existingProfile?.education || [],
      skills: profile.skills || existingProfile?.skills || [],
      desiredPosition: profile.desiredPosition || '',
      locations: profile.locations || [],
      currentLocation: profile.currentLocation || '',
      createdAt: existingProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    await this.dataStore.saveProfile(completeProfile);
    logger.info(`✓ Saved complete profile to profiles.json`);

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

    // Update profile with complete information
    const profile = state.profileData as UserProfile;
    profile.id = state.userId;

    // Load existing profile to preserve createdAt
    let existingProfile;
    try {
      existingProfile = await this.dataStore.getProfile(state.userId);
    } catch (e) {
      // Profile doesn't exist yet, that's okay
    }

    if (existingProfile) {
      profile.createdAt = existingProfile.createdAt;
    } else {
      profile.createdAt = new Date();
    }
    profile.updatedAt = new Date();

    await this.dataStore.saveProfile(profile);
    logger.info(`Updated profile for user ${state.userId} with job preferences`);

    // Search for jobs
    const result = await this.jobService.searchAndApply(state.userId);

    const response = `I found ${result.jobsFound} jobs that match your profile! Here's what I found:\n\n${result.applications.map((app, i) => {
      let jobInfo = `${i + 1}. **${app.jobTitle}** at ${app.company}\n   Location: ${app.location}`;
      if (app.jobDescription && app.jobDescription.length > 0) {
        jobInfo += `\n   ${app.jobDescription}`;
      }
      return jobInfo;
    }).join('\n\n')}

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
