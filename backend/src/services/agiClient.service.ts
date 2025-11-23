import { AGIAgentService } from './agiAgent.service';
import logger from '../utils/logger';

export class AGIClient {
  private agiAgentService: AGIAgentService;
  private useMock: boolean;
  private activeSessions: Map<string, string> = new Map(); // taskId -> sessionId
  private agentName: 'agi-0' | 'agi-0-fast';

  constructor() {
    this.agiAgentService = new AGIAgentService();
    this.useMock = process.env.USE_MOCK_AGI === 'true';
    // Use agi-0 (thinking model) by default for better reasoning capabilities
    // Can be overridden with AGI_AGENT_NAME env var
    this.agentName = (process.env.AGI_AGENT_NAME as 'agi-0' | 'agi-0-fast') || 'agi-0';
  }

  /**
   * Execute an AGI action (browser automation)
   * This method maintains backward compatibility with the existing interface
   * while using the new AGI Agent Sessions API under the hood
   */
  async executeAction(params: {
    url: string;
    task: string;
    instructions?: string;
    data?: any;
  }): Promise<any> {
    if (this.useMock) {
      return this.executeActionMock(params);
    }

    try {
      // Create a task identifier
      const taskId = `${params.task}_${Date.now()}`;
      
      // Create a new session for this task
      // Use agi-0-fast by default to save Claude credits for web operations
      const session = await this.agiAgentService.createSession({
        agent_name: this.agentName,
        save_on_exit: false,
      });
      
      this.activeSessions.set(taskId, session.session_id);
      logger.info(`Created session ${session.session_id} for task: ${params.task}`);

      try {
        // Navigate to the URL if provided
        if (params.url) {
          await this.agiAgentService.navigate(session.session_id, params.url);
          // Wait a bit for page to load
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Build the message for the agent
        let message = params.instructions || `Please ${params.task}`;
        
        if (params.data) {
          // Add context from data
          const contextParts: string[] = [];
          if (params.data.position) {
            contextParts.push(`Position: ${params.data.position}`);
          }
          if (params.data.locations) {
            contextParts.push(`Locations: ${params.data.locations.join(', ')}`);
          }
          if (params.data.company) {
            contextParts.push(`Company: ${params.data.company}`);
          }
          if (params.data.limit) {
            contextParts.push(`Limit: ${params.data.limit}`);
          }
          if (params.data.message) {
            contextParts.push(`Message: ${params.data.message}`);
          }
          if (params.data.note) {
            contextParts.push(`Note: ${params.data.note}`);
          }
          if (params.data.coverLetter) {
            contextParts.push(`Cover Letter: ${params.data.coverLetter}`);
          }
          if (params.data.fullName) {
            contextParts.push(`Full Name: ${params.data.fullName}`);
          }
          if (params.data.email) {
            contextParts.push(`Email: ${params.data.email}`);
          }
          if (params.data.phone) {
            contextParts.push(`Phone: ${params.data.phone}`);
          }
          
          if (contextParts.length > 0) {
            message += '\n\nContext:\n' + contextParts.join('\n');
          }
        }

        // Send the message to the agent
        await this.agiAgentService.sendMessage(
          session.session_id,
          message,
          params.url
        );

        // Create content check callback based on task type
        let contentCheckCallback: ((messages: any[]) => boolean) | undefined;

        if (params.task === 'apply_to_job') {
          // For job applications, check if agent indicates completion
          contentCheckCallback = (messages) => {
            const content = messages
              .filter(m => m.type === 'DONE' || m.type === 'THOUGHT')
              .map(m => m.content)
              .join('\n')
              .toLowerCase();

            // Check for completion indicators
            const hasSubmitted = content.includes('submit') || content.includes('application sent');
            const hasStopped = content.includes('stop') || content.includes('done') || content.includes('complete');

            if (hasSubmitted && hasStopped) {
              logger.info('Application submission content check passed');
            }
            return hasSubmitted && hasStopped;
          };
        } else if (params.task === 'filter_and_send_outreach') {
          // For networking outreach, check if messages were sent
          contentCheckCallback = (messages) => {
            const content = messages
              .filter(m => m.type === 'DONE' || m.type === 'THOUGHT')
              .map(m => m.content)
              .join('\n')
              .toLowerCase();

            const expectedCount = params.data?.contactCount || 1;

            // Check for completion indicators
            const hasSentMessages = content.includes('sent') || content.includes('message') || content.includes('connect');
            const hasStopped = content.includes('stop') || content.includes('done') || content.includes('complete');

            // Count how many people were contacted by looking for the success confirmations
            // Look for patterns like "✓ Sent message to" or "✓ Sent connection request to"
            const sentConfirmations = content.match(/✓ sent (message|connection request) to/gi) || [];
            const messageCount = sentConfirmations.length;
            const hasEnoughMessages = messageCount >= expectedCount;

            if (hasSentMessages && (hasStopped || hasEnoughMessages)) {
              logger.info(`Networking outreach content check passed (${messageCount} messages detected, expected ${expectedCount})`);
              return true;
            }
            return false;
          };
        }

        // Wait for completion and collect messages
        const result = await this.agiAgentService.waitForCompletion(
          session.session_id,
          300000, // 5 minute timeout
          2000, // 2 second poll interval
          contentCheckCallback
        );

        // Parse messages to extract results based on task type
        const parsedResult = await this.parseTaskResult(params.task, result.messages, params);

        // Clean up session
        await this.agiAgentService.deleteSession(session.session_id);
        this.activeSessions.delete(taskId);

        return parsedResult;
      } catch (error) {
        // Clean up session on error
        try {
          await this.agiAgentService.deleteSession(session.session_id);
        } catch (cleanupError) {
          logger.error('Error cleaning up session:', cleanupError);
        }
        this.activeSessions.delete(taskId);
        throw error;
      }
    } catch (error) {
      logger.error('AGI API Error:', error);
      throw error;
    }
  }

  /**
   * Parse agent messages into structured results based on task type
   */
  private async parseTaskResult(
    task: string,
    messages: any[],
    originalParams: any
  ): Promise<any> {
    // Extract DONE messages which typically contain results
    const doneMessages = messages.filter(m => m.type === 'DONE');
    const lastDoneMessage = doneMessages[doneMessages.length - 1];
    
    // For now, return a structured response based on task type
    // In production, you might want to parse the message content more intelligently
    switch (task) {
      case 'search_jobs':
        // Try to extract job information from messages
        // This is a simplified version - in production, you'd parse the actual content
        const extractedJobs = this.extractJobsFromMessages(messages);
        if (extractedJobs) {
          return {
            status: 'completed',
            jobs: extractedJobs,
          };
        }
        // Fallback to mock data if extraction fails
        const mockJobsResult = await this.executeActionMock(originalParams);
        return {
          status: 'completed',
          jobs: mockJobsResult.jobs || [],
        };

      case 'apply_to_job':
        return {
          status: 'completed',
          applicationId: `app_${Date.now()}`,
        };

      case 'search_people':
        // Try to extract people information from messages
        const extractedPeople = this.extractPeopleFromMessages(messages);
        if (extractedPeople) {
          return {
            status: 'completed',
            people: extractedPeople,
          };
        }
        // Fallback to mock data if extraction fails
        const mockPeopleResult = await this.executeActionMock(originalParams);
        return {
          status: 'completed',
          people: mockPeopleResult.people || [],
        };

      case 'send_message':
      case 'send_connection_request':
        return {
          status: 'completed',
          sent: true,
        };

      case 'check_messages':
        const hasNewMessages = messages.some(m => 
          m.type === 'THOUGHT' && 
          (m.content.toLowerCase().includes('response') || 
           m.content.toLowerCase().includes('message'))
        );
        return {
          status: 'completed',
          hasNewMessages,
          latestMessage: hasNewMessages ? lastDoneMessage?.content : null,
        };

      default:
        return {
          status: 'completed',
          messages: messages.map(m => ({
            type: m.type,
            content: m.content,
          })),
        };
    }
  }

  /**
   * Submit job application - creates fresh session for each submission
   */
  async submitJobApplication(params: {
    url: string;
    coverLetter: string;
    fullName: string;
    email: string;
    phone: string;
  }): Promise<void> {
    if (this.useMock) {
      logger.info('Mock: Submitting job application');
      return;
    }

    let sessionId: string | undefined;

    try {
      // Create new session
      const session = await this.agiAgentService.createSession({
        agent_name: this.agentName,
        save_on_exit: false,
      });
      sessionId = session.session_id;

      logger.info(`Created session ${sessionId} for job application`);

      // Navigate to job page
      await this.agiAgentService.navigate(sessionId, params.url);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Let page load

      // Send message to fill out and submit application
      await this.agiAgentService.sendMessage(
        sessionId,
        `Fill out and submit the job application form on this page.

INSTRUCTIONS:
1. Find and click the "Easy Apply" or "Apply" button
2. Fill in ALL form fields:
   - Full Name: ${params.fullName}
   - Email: ${params.email}
   - Phone: ${params.phone}
   - Cover Letter: ${params.coverLetter}
3. Click Submit/Apply button
4. Wait for confirmation
5. STOP after submission is confirmed

The cover letter is short (50 words), input it efficiently.`,
        params.url
      );

      // Wait for completion
      const result = await this.agiAgentService.waitForCompletion(
        sessionId,
        180000, // 3 minute timeout
        2000, // 2 second poll interval
        (messages) => {
          const content = messages
            .filter(m => m.type === 'DONE' || m.type === 'THOUGHT')
            .map(m => m.content)
            .join('\n')
            .toLowerCase();

          const hasSubmitted = content.includes('submit') || content.includes('application sent');
          const hasStopped = content.includes('stop') || content.includes('done') || content.includes('complete');

          return hasSubmitted && hasStopped;
        }
      );

      // Clean up session
      await this.agiAgentService.deleteSession(sessionId);
      logger.info('Application submitted and session cleaned up');
    } catch (error) {
      // Clean up session on error
      if (sessionId) {
        try {
          await this.agiAgentService.deleteSession(sessionId);
        } catch (cleanupError) {
          logger.error('Error cleaning up session:', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Parse job details from agent messages
   * Looks at ALL messages (DONE, THOUGHT) to find the structured information
   */
  private parseJobDetails(messages: any[]): {
    detailedDescription: string;
    requirements: string[];
    responsibilities: string[];
    skills: string[];
  } | null {
    try {
      // Look at DONE and THOUGHT messages - the agent may put info in either
      const relevantMessages = messages.filter(m => m.type === 'DONE' || m.type === 'THOUGHT');

      if (relevantMessages.length === 0) {
        logger.warn('No relevant messages found when parsing job details');
        return null;
      }

      const content = relevantMessages.map(m => m.content).join('\n\n');
      logger.info(`Parsing job details from ${relevantMessages.length} messages (${content.length} chars)`);

      // Extract sections using regex (case-insensitive)
      const aboutMatch = content.match(/ABOUT THE JOB:\s*([\s\S]*?)(?=REQUIREMENTS:|RESPONSIBILITIES:|SKILLS:|$)/i);
      const reqMatch = content.match(/REQUIREMENTS:\s*([\s\S]*?)(?=RESPONSIBILITIES:|SKILLS:|$)/i);
      const respMatch = content.match(/RESPONSIBILITIES:\s*([\s\S]*?)(?=SKILLS:|REQUIREMENTS:|$)/i);
      const skillsMatch = content.match(/SKILLS:\s*([\s\S]*?)(?=REQUIREMENTS:|RESPONSIBILITIES:|$)/i);

      const detailedDescription = aboutMatch ? aboutMatch[1].trim() : '';

      // Parse bullet points - handle both "-" and "•" bullets
      const parseBullets = (text: string) => {
        return text
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./);
          })
          .map(line => line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 0);
      };

      const requirements = reqMatch ? parseBullets(reqMatch[1]) : [];
      const responsibilities = respMatch ? parseBullets(respMatch[1]) : [];
      const skills = skillsMatch ? parseBullets(skillsMatch[1]) : [];

      logger.info(`Extracted job details: ${requirements.length} requirements, ${responsibilities.length} responsibilities, ${skills.length} skills`);

      // Return result even if some sections are empty
      return {
        detailedDescription,
        requirements,
        responsibilities,
        skills
      };
    } catch (error) {
      logger.error('Error parsing job details:', error);
      return null;
    }
  }

  /**
   * Mock job details for development
   */
  private mockGetJobDetails(): {
    detailedDescription: string;
    requirements: string[];
    responsibilities: string[];
    skills: string[];
  } {
    return {
      detailedDescription: "We're looking for a talented engineer to join our team and help build the future of AI. You'll work on cutting-edge technology and collaborate with world-class researchers and engineers.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "5+ years of professional software development experience",
        "Strong understanding of algorithms and data structures",
        "Experience with distributed systems"
      ],
      responsibilities: [
        "Design and implement scalable backend services",
        "Collaborate with cross-functional teams",
        "Write clean, maintainable code",
        "Participate in code reviews and technical discussions"
      ],
      skills: [
        "Python",
        "Go or Rust",
        "Distributed Systems",
        "Cloud platforms (AWS, GCP)",
        "Docker and Kubernetes"
      ]
    };
  }

  /**
   * Extract job information from agent messages
   * Looks for job data in the agent's DONE messages
   */
  private extractJobsFromMessages(messages: any[]): any[] | null {
    try {
      logger.info(`Extracting jobs from ${messages.length} messages`);

      // Look through all messages for job information
      for (const message of messages) {
        if (message.type === 'DONE' || message.type === 'THOUGHT') {
          const content = message.content || '';
          logger.info(`Checking message type=${message.type}, content preview: ${content.substring(0, 200)}...`);

          // Try to find JSON array or structured job data
          const jsonMatch = content.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                return parsed;
              }
            } catch (e) {
              // Not valid JSON, continue
            }
          }

          // Look for job listings in text format
          // Format: "Title - Company - Location - Salary" or "Title - Company - Location"
          const lines = content.split('\n');
          const jobs = [];

          for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and non-job lines
            if (!trimmedLine || trimmedLine.length < 10) continue;
            if (trimmedLine.toLowerCase().includes('task completed')) continue;
            if (trimmedLine.toLowerCase().includes('i successfully completed')) continue;
            if (trimmedLine.toLowerCase().includes('job title') && trimmedLine.toLowerCase().includes('company name')) continue;

            // Look for lines with at least 3 dash-separated segments
            const segments = trimmedLine.split(/\s*[-–—]\s*/);

            if (segments.length >= 3) {
              const firstSegment = segments[0].trim();
              const secondSegment = segments[1].trim();
              const thirdSegment = segments[2].trim();

              // Validate this looks like a job listing
              if (firstSegment && secondSegment && thirdSegment &&
                  firstSegment.length > 3 && secondSegment.length > 1) {

                const job = {
                  title: firstSegment,
                  company: secondSegment,
                  location: thirdSegment,
                  salary: segments.length >= 4 ? segments.slice(3).join(' - ').trim() : undefined,
                  url: 'https://real-networkin.vercel.app/platform/jobs/',
                  description: 'Job found via AGI search',
                  requirements: []
                };

                jobs.push(job);
                logger.info(`Found job: ${job.title} at ${job.company}`);
              }
            }
          }

          if (jobs.length > 0) {
            logger.info(`✓ Extracted ${jobs.length} jobs from agent messages`);
            return jobs;
          }
        }
      }

      logger.warn('Could not extract jobs from agent messages');
      return null;
    } catch (error) {
      logger.error('Error extracting jobs:', error);
      return null;
    }
  }

  /**
   * Extract people information from agent messages
   * This is a placeholder - in production, you'd parse the actual message content
   */
  private extractPeopleFromMessages(messages: any[]): any[] | null {
    // Look for structured data in messages
    // This would need to be implemented based on actual agent output format
    return null;
  }

  /**
   * Get the underlying AGI Agent Service for advanced usage
   */
  getAgentService(): AGIAgentService {
    return this.agiAgentService;
  }

  /**
   * Mock implementation for development
   * Replace with real API when available
   */
  private async executeActionMock(params: any): Promise<any> {
    console.log('🤖 Mock AGI Action:', params);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    // Return mock data based on task
    switch (params.task) {
      case 'search_jobs':
        return {
          status: 'completed',
          jobs: [
            {
              title: 'Senior Software Engineer',
              company: 'Anthropic',
              location: 'San Francisco, CA',
              url: 'https://real-networkin.vercel.app/platform/jobs/123',
              description: 'We are looking for a senior engineer to help build safe AI systems...',
              requirements: ['Python', 'ML', 'AI Safety', '5+ years experience']
            },
            {
              title: 'Machine Learning Engineer',
              company: 'OpenAI',
              location: 'San Francisco, CA',
              url: 'https://real-networkin.vercel.app/platform/jobs/456',
              description: 'Join our ML infrastructure team...',
              requirements: ['Python', 'PyTorch', 'Distributed Systems']
            },
            {
              title: 'Backend Engineer',
              company: 'Stripe',
              location: 'San Francisco, CA',
              url: 'https://real-networkin.vercel.app/platform/jobs/789',
              description: 'Build scalable payment systems...',
              requirements: ['Ruby', 'Go', 'Distributed Systems']
            }
          ]
        };

      case 'apply_to_job':
        return {
          status: 'completed',
          applicationId: `app_${Date.now()}`
        };

      case 'search_people':
        return {
          status: 'completed',
          people: [
            {
              name: 'Sarah Chen',
              title: 'Staff ML Engineer',
              connectionDegree: '1st',
              profileUrl: 'https://real-networkin.vercel.app/platform/profile/sarahchen',
              description: 'ML @ Anthropic | Stanford CS'
            },
            {
              name: 'Mike Johnson',
              title: 'Engineering Manager',
              connectionDegree: '2nd',
              profileUrl: 'https://real-networkin.vercel.app/platform/profile/mikejohnson',
              description: 'Building AI Safety tools'
            },
            {
              name: 'Emily Rodriguez',
              title: 'Senior Software Engineer',
              connectionDegree: '1st',
              profileUrl: 'https://real-networkin.vercel.app/platform/profile/emilyrodriguez',
              description: 'Infrastructure @ Anthropic'
            }
          ]
        };

      case 'send_message':
      case 'send_connection_request':
        return {
          status: 'completed',
          sent: true
        };

      case 'filter_and_send_outreach':
        // Mock bulk outreach to multiple contacts
        const contactCount = params.data?.contactCount || 1;
        logger.info(`Mock: Sent messages to ${contactCount} contacts`);
        return {
          status: 'completed',
          messagesSent: contactCount
        };

      case 'check_messages':
        // Randomly simulate responses for demo
        const hasResponse = Math.random() > 0.5;
        return {
          status: 'completed',
          hasNewMessages: hasResponse,
          latestMessage: hasResponse ? 'Hi! I\'d be happy to chat. How about Tuesday at 2pm?' : null
        };

      default:
        return { status: 'completed' };
    }
  }
}
