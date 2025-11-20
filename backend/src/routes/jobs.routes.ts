import { Router, Request, Response } from 'express';
import { JobApplicationService } from '../services/jobApplication.service';
import { DataStore } from '../data/store';
import logger from '../utils/logger';

const router = Router();
const jobApplicationService = new JobApplicationService();
const dataStore = new DataStore();

/**
 * POST /api/jobs/search-and-apply
 * Main workflow: Search jobs on NetworkIn and auto-apply to all matches
 */
router.post('/search-and-apply', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'profileId is required'
      });
    }

    logger.info(`Starting job search and apply for profile: ${profileId}`);

    const result = await jobApplicationService.searchAndApply(profileId);

    logger.info(`Job search completed: ${result.applicationsSubmitted} applications submitted`);

    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Job search and apply error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to search and apply for jobs'
    });
  }
});

/**
 * GET /api/applications/:profileId
 * Get all applications for a user
 */
router.get('/applications/:profileId', async (req: Request, res: Response) => {
  try {
    const applications = await dataStore.getApplicationsByUser(req.params.profileId);

    return res.json({
      success: true,
      applications
    });
  } catch (error: any) {
    logger.error('Applications retrieval error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve applications'
    });
  }
});

/**
 * GET /api/application/:id
 * Get single application with networking contacts
 */
router.get('/application/:id', async (req: Request, res: Response) => {
  try {
    const application = await dataStore.getApplication(req.params.id);
    const contacts = await dataStore.getContactsByApplication(req.params.id);

    return res.json({
      success: true,
      application: {
        ...application,
        networkingContacts: contacts
      }
    });
  } catch (error: any) {
    logger.error('Application retrieval error:', error);
    return res.status(404).json({
      success: false,
      error: error.message || 'Application not found'
    });
  }
});

export default router;
