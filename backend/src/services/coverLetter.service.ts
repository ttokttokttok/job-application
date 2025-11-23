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
      detailedDescription?: string;
      requirements?: string[];
      responsibilities?: string[];
      skills?: string[];
    },
    userFeedback?: string // Optional feedback for regeneration
  ): Promise<string> {
    // Build comprehensive job details section
    let jobDetailsSection = `Job Details:
- Title: ${jobDetails.title}
- Company: ${jobDetails.company}`;

    if (jobDetails.detailedDescription) {
      jobDetailsSection += `\n- Detailed Description: ${jobDetails.detailedDescription}`;
    } else if (jobDetails.description) {
      jobDetailsSection += `\n- Description: ${jobDetails.description}`;
    }

    if (jobDetails.requirements && jobDetails.requirements.length > 0) {
      jobDetailsSection += `\n- Requirements:\n${jobDetails.requirements.map(r => `  • ${r}`).join('\n')}`;
    }

    if (jobDetails.responsibilities && jobDetails.responsibilities.length > 0) {
      jobDetailsSection += `\n- Key Responsibilities:\n${jobDetails.responsibilities.map(r => `  • ${r}`).join('\n')}`;
    }

    if (jobDetails.skills && jobDetails.skills.length > 0) {
      jobDetailsSection += `\n- Required Skills:\n${jobDetails.skills.map(s => `  • ${s}`).join('\n')}`;
    }

    // Build candidate profile section
    const candidateSection = `Candidate Profile:
- Name: ${profile.fullName}
- Current Location: ${profile.currentLocation}
- Skills: ${profile.skills.join(', ')}
- Recent Experience: ${profile.workExperience[0]?.company} - ${profile.workExperience[0]?.title}
- Education: ${profile.education[0]?.degree} in ${profile.education[0]?.field} from ${profile.education[0]?.institution}`;

    // Build work experience details
    let experienceDetails = '';
    if (profile.workExperience && profile.workExperience.length > 0) {
      experienceDetails = '\n\nDetailed Work Experience:\n' +
        profile.workExperience.slice(0, 3).map(exp =>
          `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n  ${exp.description}\n  Key highlights: ${exp.highlights.join(', ')}`
        ).join('\n');
    }

    let prompt = `Write a professional cover letter for this job application.

${jobDetailsSection}

${candidateSection}${experienceDetails}

Write a compelling, personalized cover letter (max 300 words). Focus on:
1. Why I'm excited about this specific role and company
2. How my skills and experience directly match their requirements and responsibilities
3. Specific examples from my work history that demonstrate relevant capabilities
4. Professional yet genuine tone

IMPORTANT:
- Make it highly specific to THIS job - reference actual requirements, responsibilities, and skills listed
- Use concrete examples from my work experience
- Avoid generic phrases and clichés
- Be authentic and show genuine enthusiasm`;

    if (userFeedback) {
      prompt += `\n\nPREVIOUS FEEDBACK FROM USER:\n${userFeedback}\n\nPlease revise the cover letter based on this feedback while maintaining all the above requirements.`;
    }

    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return (message.content[0] as any).text;
  }
}
