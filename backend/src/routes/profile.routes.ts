import { Router, Request, Response } from 'express';
import { DataStore } from '../data/store';
import { UserProfile } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const router = Router();
const dataStore = new DataStore();

/**
 * POST /api/profile
 * Create user profile with questionnaire data
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = req.body;

    const profile: UserProfile = {
      id: uuidv4(),
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await dataStore.saveProfile(profile);
    logger.info(`Profile created: ${profile.id}`);

    return res.json({
      success: true,
      profileId: profile.id,
      profile
    });
  } catch (error: any) {
    logger.error('Profile creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create profile'
    });
  }
});

/**
 * GET /api/profile/:id
 * Get user profile
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const profile = await dataStore.getProfile(req.params.id);

    return res.json({
      success: true,
      profile
    });
  } catch (error: any) {
    logger.error('Profile retrieval error:', error);
    return res.status(404).json({
      success: false,
      error: error.message || 'Profile not found'
    });
  }
});

/**
 * PATCH /api/profile/:id
 * Update profile fields
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const profile = await dataStore.updateProfile(req.params.id, updates);

    logger.info(`Profile updated: ${req.params.id}`);

    return res.json({
      success: true,
      profile
    });
  } catch (error: any) {
    logger.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
});

/**
 * GET /api/profile
 * Get all profiles
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await dataStore.getAllProfiles();

    return res.json({
      success: true,
      profiles
    });
  } catch (error: any) {
    logger.error('Profiles retrieval error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve profiles'
    });
  }
});

export default router;
