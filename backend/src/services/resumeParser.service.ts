import { Anthropic } from '@anthropic-ai/sdk';
import { UserProfile } from '../types/models';

export class ResumeParserService {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  async parseResume(resumeText: string): Promise<Partial<UserProfile>> {
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Parse this resume and extract structured data. Return ONLY valid JSON with no markdown formatting.

Resume:
${resumeText}

Return JSON in this exact format:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "workExperience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "YYYY-MM"
    }
  ],
  "skills": ["string"]
}`
      }]
    });

    const responseText = (message.content[0] as any).text;
    // Clean markdown code blocks if present
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(jsonText);
  }
}
