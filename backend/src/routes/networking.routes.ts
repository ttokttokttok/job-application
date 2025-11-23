import { Router, Request, Response } from 'express';
import { NetworkingService } from '../services/networking.service';
import { DataStore } from '../data/store';
import logger from '../utils/logger';

const router = Router();
const networkingService = new NetworkingService();
const dataStore = new DataStore();

/**
 * POST /api/networking/auto-outreach
 * Automatically find and reach out to people at a company (simplified for demo)
 */
router.post('/auto-outreach', async (req: Request, res: Response) => {
  try {
    const { applicationId, maxContacts = 3 } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'applicationId is required'
      });
    }

    logger.info(`Auto-networking for application: ${applicationId} (max: ${maxContacts} contacts)`);

    const contacts = await networkingService.findAndReachOutToAll(applicationId, maxContacts);

    logger.info(`Successfully reached out to ${contacts.length} contacts`);

    return res.json({
      success: true,
      contactsReachedOut: contacts
    });
  } catch (error: any) {
    logger.error('Auto-outreach error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete automated outreach'
    });
  }
});

/**
 * POST /api/networking/reach-out
 * Send outreach messages to selected contacts
 */
router.post('/reach-out', async (req: Request, res: Response) => {
  try {
    const { applicationId, selectedIndexes, allPeople } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'applicationId is required'
      });
    }

    if (!selectedIndexes || !Array.isArray(selectedIndexes)) {
      return res.status(400).json({
        success: false,
        error: 'selectedIndexes array is required'
      });
    }

    if (!allPeople || !Array.isArray(allPeople)) {
      return res.status(400).json({
        success: false,
        error: 'allPeople array is required (pass the people data from search-contacts)'
      });
    }

    logger.info(`Starting networking reach-out for application: ${applicationId}, contacts: ${selectedIndexes.join(', ')}`);

    const contacts = await networkingService.reachOut(applicationId, selectedIndexes, allPeople);

    logger.info(`Reached out to ${contacts.length} contacts`);

    return res.json({
      success: true,
      contactsReachedOut: contacts
    });
  } catch (error: any) {
    logger.error('Networking reach-out error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reach out to contacts'
    });
  }
});

/**
 * POST /api/networking/check-responses
 * Check if contacts responded to messages
 */
router.post('/check-responses', async (req: Request, res: Response) => {
  try {
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({
        success: false,
        error: 'contactIds array is required'
      });
    }

    logger.info(`Checking responses for ${contactIds.length} contacts`);

    const contacts = await networkingService.checkResponses(contactIds);

    return res.json({
      success: true,
      contacts
    });
  } catch (error: any) {
    logger.error('Check responses error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to check responses'
    });
  }
});

/**
 * GET /api/networking/:applicationId
 * Get all networking contacts for a job application
 */
router.get('/:applicationId', async (req: Request, res: Response) => {
  try {
    const contacts = await dataStore.getContactsByApplication(req.params.applicationId);

    return res.json({
      success: true,
      contacts
    });
  } catch (error: any) {
    logger.error('Contacts retrieval error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve contacts'
    });
  }
});

export default router;
