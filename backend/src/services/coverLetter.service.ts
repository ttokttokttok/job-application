import { Anthropic } from '@anthropic-ai/sdk';
import { UserProfile } from '../types/models';

export class CoverLetterService {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  async generateCoverLetter(
    profile: UserProfile,
    jobDetails: {
      title: string;
      company: string;
      description: string;
      requirements: string[];
    }
  ): Promise<string> {
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a professional cover letter for this job application.

Job Details:
- Title: ${jobDetails.title}
- Company: ${jobDetails.company}
- Description: ${jobDetails.description}
- Requirements: ${jobDetails.requirements.join(', ')}

Candidate Profile:
- Name: ${profile.fullName}
- Current Location: ${profile.currentLocation}
- Skills: ${profile.skills.join(', ')}
- Recent Experience: ${profile.workExperience[0]?.company} - ${profile.workExperience[0]?.title}
- Education: ${profile.education[0]?.degree} in ${profile.education[0]?.field} from ${profile.education[0]?.institution}

Write a concise, enthusiastic cover letter (max 250 words). Focus on:
1. Why I'm excited about this specific role
2. How my skills match their requirements
3. Relevant experience that demonstrates capability
4. Professional and genuine tone

Do not use overly formal or generic language. Be authentic and specific.`
      }]
    });

    return (message.content[0] as any).text;
  }
}
