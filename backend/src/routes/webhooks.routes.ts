import { Router, Request, Response } from 'express';
import { AGIWebhookEvent } from '../types/models';
import logger from '../utils/logger';

const router = Router();

// Store webhook events in memory for now (in production, use a proper queue)
const webhookEvents: { [sessionId: string]: AGIWebhookEvent[] } = {};

/**
 * POST /api/webhooks/agi
 * Handle AGI webhooks
 */
router.post('/agi', async (req: Request, res: Response) => {
  try {
    const event: AGIWebhookEvent = req.body;

    logger.info(`AGI webhook received: ${event.event} for session ${event.session.id}`);

    // Store the event
    if (!webhookEvents[event.session.id]) {
      webhookEvents[event.session.id] = [];
    }
    webhookEvents[event.session.id].push(event);

    // Handle different event types
    switch (event.event) {
      case 'session.created':
        logger.info(`AGI session created: ${event.session.id}`);
        break;

      case 'task.started':
        logger.info(`AGI task started: ${event.message}`);
        break;

      case 'task.completed':
        logger.info(`AGI task completed: ${JSON.stringify(event.result)}`);
        // Notify user via conversation system
        // This would trigger a message to the user through the chatbot
        break;

      case 'task.question':
        logger.info(`AGI has a question: ${event.question}`);
        // Forward question to user via conversation system
        break;

      case 'task.error':
        logger.error(`AGI task error: ${event.error}`);
        // Notify user of error via conversation system
        break;

      case 'session.status_changed':
        logger.info(`AGI session status changed: ${event.old_status} -> ${event.new_status}`);
        break;

      case 'session.deleted':
        logger.info(`AGI session deleted: ${event.session.id}`);
        // Clean up stored events
        delete webhookEvents[event.session.id];
        break;

      default:
        logger.warn(`Unknown AGI webhook event: ${event.event}`);
    }

    // Always return 200 to acknowledge receipt
    return res.json({ status: 'received' });
  } catch (error: any) {
    logger.error('AGI webhook error:', error);
    // Still return 200 to prevent retries
    return res.json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/webhooks/agi/:sessionId
 * Get webhook events for a session (for debugging)
 */
router.get('/agi/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const events = webhookEvents[sessionId] || [];

    return res.json({
      success: true,
      sessionId,
      events
    });
  } catch (error: any) {
    logger.error('Get webhook events error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
