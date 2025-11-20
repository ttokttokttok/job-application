import { AGIClient } from './agiClient.service';
import { CoverLetterService } from './coverLetter.service';
import { DataStore } from '../data/store';
import { UserProfile, JobApplication } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export class JobApplicationService {
  private agiClient: AGIClient;
  private coverLetterService: CoverLetterService;
  private dataStore: DataStore;

  constructor() {
    this.agiClient = new AGIClient();
    this.coverLetterService = new CoverLetterService();
    this.dataStore = new DataStore();
  }

  /**
   * Main orchestration: Search jobs and auto-apply
   */
  async searchAndApply(profileId: string): Promise<{
    jobsFound: number;
    applicationsSubmitted: number;
    applications: JobApplication[];
  }> {
    const profile = await this.dataStore.getProfile(profileId);
    const applications: JobApplication[] = [];

    // Step 1: Navigate to jobs page and search
    console.log(`🔍 Searching for ${profile.desiredPosition} jobs...`);
    const jobsResult = await this.agiClient.executeAction({
      url: 'https://real-networkin.vercel.app/platform/jobs/',
      task: 'search_jobs',
      instructions: `Search for "${profile.desiredPosition}" jobs in ${profile.locations.join(', ')}`,
      data: {
        position: profile.desiredPosition,
        locations: profile.locations
      }
    });

    console.log(`✅ Found ${jobsResult.jobs.length} jobs`);

    // Step 2: For each job, apply
    for (const job of jobsResult.jobs) {
      try {
        console.log(`📝 Applying to ${job.title} at ${job.company}...`);
        const application = await this.applyToJob(profile, job);
        applications.push(application);
        console.log(`✅ Applied to ${job.title}`);
      } catch (error) {
        console.error(`❌ Failed to apply to ${job.title}:`, error);
      }
    }

    return {
      jobsFound: jobsResult.jobs.length,
      applicationsSubmitted: applications.length,
      applications
    };
  }

  /**
   * Apply to a single job
   */
  private async applyToJob(
    profile: UserProfile,
    jobDetails: any
  ): Promise<JobApplication> {
    // Generate cover letter
    console.log('  📄 Generating cover letter...');
    const coverLetter = await this.coverLetterService.generateCoverLetter(
      profile,
      jobDetails
    );

    // Click Easy Apply and fill form
    console.log('  🤖 Filling application form...');
    await this.agiClient.executeAction({
      url: jobDetails.url,
      task: 'apply_to_job',
      instructions: 'Click Easy Apply button, fill form, and submit',
      data: {
        coverLetter,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone
      }
    });

    // Save application to database
    const application: JobApplication = {
      id: uuidv4(),
      userId: profile.id,
      jobTitle: jobDetails.title,
      company: jobDetails.company,
      location: jobDetails.location,
      jobUrl: jobDetails.url,
      jobDescription: jobDetails.description,
      requirements: jobDetails.requirements,
      coverLetter,
      status: 'applied',
      appliedAt: new Date(),
      networkingContacts: []
    };

    await this.dataStore.saveApplication(application);
    return application;
  }
}
