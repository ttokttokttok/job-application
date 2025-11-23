import { Router, Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { TelnyxAgentService } from '../services/telnyxAgent.service';
import { DataStore } from '../data/store';
import logger from '../utils/logger';

const router = Router();
const conversationService = new ConversationService();
const telnyxService = new TelnyxAgentService();
const dataStore = new DataStore();

/**
 * POST /api/agent/message
 * Send a text message to the agent
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required'
      });
    }

    logger.info(`Received message from user ${userId}: ${message}`);

    const result = await conversationService.processMessage(userId, message, 'text');

    return res.json({
      success: true,
      response: result.response,
      state: result.state,
      metadata: result.metadata
    });
  } catch (error: any) {
    logger.error('Agent message error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
});

/**
 * GET /api/agent/conversation/:userId
 * Get conversation history for a user
 */
router.get('/conversation/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const messages = await dataStore.getConversationMessages(userId);
    const state = await dataStore.getConversationState(userId);

    return res.json({
      success: true,
      messages,
      state
    });
  } catch (error: any) {
    logger.error('Get conversation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get conversation'
    });
  }
});

/**
 * DELETE /api/agent/conversation/:userId
 * Clear conversation history for a user
 */
router.delete('/conversation/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await dataStore.clearConversationMessages(userId);
    await dataStore.deleteConversationState(userId);

    return res.json({
      success: true
    });
  } catch (error: any) {
    logger.error('Clear conversation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear conversation'
    });
  }
});

/**
 * POST /api/agent/voice/call
 * Initiate a voice call with the agent
 */
router.post('/voice/call', async (req: Request, res: Response) => {
  try {
    const { userId, phoneNumber } = req.body;

    if (!userId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'userId and phoneNumber are required'
      });
    }

    const result = await telnyxService.startVoiceSession(phoneNumber, userId);

    return res.json({
      success: true,
      callSid: result.callSid
    });
  } catch (error: any) {
    logger.error('Voice call error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to start voice call'
    });
  }
});

/**
 * POST /api/agent/voice-webhook
 * Handle Telnyx voice webhooks
 */
router.post('/voice-webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    logger.info('Voice webhook received:', JSON.stringify(payload));

    const response = await telnyxService.handleVoiceWebhook(payload);

    if (response) {
      return res.json(response);
    }

    return res.json({ success: true });
  } catch (error: any) {
    logger.error('Voice webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/sms-webhook
 * Handle Telnyx SMS webhooks
 */
router.post('/sms-webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    logger.info('SMS webhook received:', JSON.stringify(payload));

    await telnyxService.handleSMSWebhook(payload);

    return res.json({ success: true });
  } catch (error: any) {
    logger.error('SMS webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/initialize
 * Initialize conversation for a new user after resume upload
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const { userId, profileData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Save the initial profile data to profiles.json
    if (profileData) {
      const profile = {
        id: userId,
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        workExperience: profileData.workExperience || [],
        education: profileData.education || [],
        skills: profileData.skills || [],
        desiredPosition: profileData.desiredPosition || '',
        locations: profileData.locations || [],
        currentLocation: profileData.currentLocation || '',
        resumeUrl: profileData.resumeUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await dataStore.saveProfile(profile);
      logger.info(`Saved profile for user ${userId} to profiles.json`);
    }

    const state = await conversationService.initializeConversation(userId, profileData || {});

    // Generate initial greeting
    const greeting = `Hey! I've got your resume. Just need a couple quick things to find you some jobs.

What kind of role are you looking for? (Just something general like "engineer" or "designer" is fine)`;

    return res.json({
      success: true,
      state,
      greeting
    });
  } catch (error: any) {
    logger.error('Initialize conversation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize conversation'
    });
  }
});

export default router;
