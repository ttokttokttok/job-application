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
   * Fetch detailed job information for a specific application
   */
  async fetchJobDetails(applicationId: string): Promise<{
    application: JobApplication;
  }> {
    const application = await this.dataStore.getApplication(applicationId);

    console.log(`🔍 Fetching detailed job info for: ${application.jobTitle} at ${application.company}`);

    // Get detailed job information from the job page
    const jobDetails = await this.agiClient.getJobDetails(application.jobUrl);

    if (jobDetails) {
      // Update application with detailed information
      application.detailedDescription = jobDetails.detailedDescription;
      application.requirements = jobDetails.requirements;
      application.responsibilities = jobDetails.responsibilities;
      application.skills = jobDetails.skills;

      await this.dataStore.saveApplication(application);

      console.log(`✅ Fetched detailed info: ${jobDetails.requirements.length} requirements, ${jobDetails.responsibilities.length} responsibilities, ${jobDetails.skills.length} skills`);
    } else {
      console.log('⚠️  Could not fetch detailed job info, using basic information');
    }

    return { application };
  }

  /**
   * Generate cover letter for a specific application
   */
  async generateCoverLetterForJob(
    applicationId: string,
    feedback?: string
  ): Promise<{
    application: JobApplication;
    coverLetter: string;
  }> {
    const application = await this.dataStore.getApplication(applicationId);
    const profile = await this.dataStore.getProfile(application.userId);

    console.log(`📄 Generating cover letter for: ${application.jobTitle} at ${application.company}`);
    if (feedback) {
      console.log(`   Based on user feedback: "${feedback}"`);
    }

    // Generate cover letter using detailed job information
    const coverLetter = await this.coverLetterService.generateCoverLetter(
      profile,
      {
        title: application.jobTitle,
        company: application.company,
        description: application.jobDescription,
        detailedDescription: application.detailedDescription,
        requirements: application.requirements,
        responsibilities: application.responsibilities,
        skills: application.skills
      },
      feedback
    );

    // Save to history if this is a regeneration
    if (application.coverLetter && feedback) {
      if (!application.coverLetterHistory) {
        application.coverLetterHistory = [];
      }
      application.coverLetterHistory.push({
        letter: application.coverLetter,
        feedback,
        timestamp: new Date()
      });
    }

    // Update application
    application.coverLetter = coverLetter;
    application.coverLetterStatus = 'pending';

    await this.dataStore.saveApplication(application);

    console.log(`✅ Cover letter generated (${coverLetter.length} characters)`);

    return { application, coverLetter };
  }

  /**
   * Approve cover letter for an application
   */
  async approveCoverLetter(applicationId: string): Promise<void> {
    const application = await this.dataStore.getApplication(applicationId);

    application.coverLetterStatus = 'approved';
    await this.dataStore.saveApplication(application);

    console.log(`✅ Cover letter approved for: ${application.jobTitle} at ${application.company}`);
  }

  /**
   * Submit application (after cover letter is approved)
   */
  async submitApplication(applicationId: string): Promise<{
    application: JobApplication;
  }> {
    const application = await this.dataStore.getApplication(applicationId);
    const profile = await this.dataStore.getProfile(application.userId);

    if (application.coverLetterStatus !== 'approved') {
      throw new Error('Cover letter must be approved before submitting application');
    }

    console.log(`🤖 Submitting application for: ${application.jobTitle} at ${application.company}`);

    // Click Easy Apply and fill form
    await this.agiClient.executeAction({
      url: application.jobUrl,
      task: 'apply_to_job',
      instructions: `Click the Easy Apply button and fill out the application form quickly and efficiently.

INSTRUCTIONS:
1. Find and click the "Easy Apply" or "Apply" button
2. Fill in ALL form fields with the provided data:
   - Full Name: Enter the fullName
   - Email: Enter the email
   - Phone: Enter the phone
   - Cover Letter: Enter the coverLetter text
3. Work quickly - don't delay between fields
4. Click Submit/Apply to submit the application
5. Once you see submission confirmation, STOP immediately

Be efficient and accurate.`,
      data: {
        coverLetter: application.coverLetter,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone
      }
    });

    // Update application status to applied and save the timestamp
    application.status = 'applied';
    application.appliedAt = new Date();

    // Make sure all the detailed job info is saved (in case it wasn't saved during fetch)
    // This ensures we have the full job details in the application record
    await this.dataStore.saveApplication(application);

    console.log(`✅ Application submitted for: ${application.jobTitle} at ${application.company}`);

    return { application };
  }

  /**
   * Apply to a single job (legacy method - kept for backwards compatibility)
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
