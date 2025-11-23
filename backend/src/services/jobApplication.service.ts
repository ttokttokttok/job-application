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
      instructions: `IMPORTANT: This is a LinkedIn-like platform. The search field FILTERS existing jobs on the page - it doesn't fetch new jobs.

1. Find the job search button at the top of the page and click it ONCE
2. Wait for the search interface to appear
3. Find the job search input field (says "Search jobs by title, company, location, or skills...")
4. Click on the search input field to focus it
5. Type "${profile.desiredPosition}" into the search field - this FILTERS the visible jobs to show only matching ones
6. The filtering is instant - you'll see something like "2 of 10 jobs" which is completely normal and expected
7. Extract ONLY the job listings that remain visible after filtering (for example, if it shows 2 of 10, extract those 2)
8. List each visible job in this format: "Job Title - Company Name - Location - Salary (if shown)"
9. After listing the filtered jobs (even if it's just 2-3 jobs), STOP immediately - you're done, do not click anything else`,
      data: {
        position: profile.desiredPosition,
        locations: profile.locations
      }
    });

    console.log(`✅ Found ${jobsResult.jobs.length} jobs`);

    // Step 2: Create application records (but don't apply yet - user will select which ones)
    for (const job of jobsResult.jobs) {
      // Build description from job details
      let description = job.description || 'Job found via search';
      if (job.salary) {
        description = `Salary: ${job.salary}`;
      }

      const application: JobApplication = {
        id: uuidv4(),
        userId: profile.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        jobUrl: job.url || 'https://real-networkin.vercel.app/platform/jobs/',
        jobDescription: description,
        requirements: job.requirements || [],
        coverLetter: '', // Will be generated when user selects this job
        status: 'pending', // Changed from 'applied' to 'pending'
        appliedAt: new Date(), // Will be set when actually applied
        networkingContacts: []
      };

      await this.dataStore.saveApplication(application);
      applications.push(application);
    }

    console.log(`✅ Created ${applications.length} pending applications`);

    return {
      jobsFound: jobsResult.jobs.length,
      applicationsSubmitted: 0, // Haven't submitted any yet
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
