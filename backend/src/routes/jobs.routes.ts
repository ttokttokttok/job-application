import { Router, Request, Response } from 'express';
import { JobApplicationService } from '../services/jobApplication.service';
import { TelnyxAgentService } from '../services/telnyxAgent.service';
import { DataStore } from '../data/store';
import logger from '../utils/logger';

const router = Router();
const jobApplicationService = new JobApplicationService();
const telnyxAgentService = new TelnyxAgentService();
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

/**
 * POST /api/jobs/fetch-job-details/:applicationId
 * Fetch detailed job information for a specific application
 */
router.post('/fetch-job-details/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    logger.info(`Fetching detailed job information for application: ${applicationId}`);

    const result = await jobApplicationService.fetchJobDetails(applicationId);

    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Fetch job details error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job details'
    });
  }
});

/**
 * POST /api/jobs/generate-cover-letter/:applicationId
 * Generate cover letter for a specific application
 */
router.post('/generate-cover-letter/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { feedback } = req.body; // Optional user feedback for regeneration

    logger.info(`Generating cover letter for application: ${applicationId}`);

    const result = await jobApplicationService.generateCoverLetterForJob(applicationId, feedback);

    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Generate cover letter error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate cover letter'
    });
  }
});

/**
 * POST /api/jobs/approve-cover-letter/:applicationId
 * Approve the cover letter for a specific application
 */
router.post('/approve-cover-letter/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    logger.info(`Approving cover letter for application: ${applicationId}`);

    await jobApplicationService.approveCoverLetter(applicationId);

    return res.json({
      success: true
    });
  } catch (error: any) {
    logger.error('Approve cover letter error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to approve cover letter'
    });
  }
});

/**
 * POST /api/jobs/apply/:applicationId
 * Submit the application (after cover letter is approved)
 */
router.post('/apply/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    logger.info(`Submitting application: ${applicationId}`);

    const result = await jobApplicationService.submitApplication(applicationId);

    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Submit application error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit application'
    });
  }
});

/**
 * POST /api/jobs/interview-practice/:applicationId
 * Start an AI-powered interview practice call
 */
router.post('/interview-practice/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber is required'
      });
    }

    logger.info(`Starting interview practice call for application: ${applicationId}`);

    const application = await dataStore.getApplication(applicationId);

    const result = await telnyxAgentService.startInterviewPractice(phoneNumber, {
      company: application.company,
      position: application.jobTitle
    });

    return res.json({
      success: true,
      callSid: result.callSid,
      message: `Interview practice call started for ${application.jobTitle} at ${application.company}`
    });
  } catch (error: any) {
    logger.error('Interview practice error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to start interview practice call'
    });
  }
});

export default router;
