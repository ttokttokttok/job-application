import { AGIClient } from './agiClient.service';
import { DataStore } from '../data/store';
import { JobApplication, NetworkingContact } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export class NetworkingService {
  private agiClient: AGIClient;
  private dataStore: DataStore;

  constructor() {
    this.agiClient = new AGIClient();
    this.dataStore = new DataStore();
  }

  /**
   * Find people at company and automatically reach out to all of them
   * Does EVERYTHING in a single AGI session: filter by company → message/connect all people found
   *
   * This is the main method for the coffee chat demo - it automatically:
   * 1. Searches for people at the company
   * 2. Filters to find relevant contacts
   * 3. Messages/connects with all of them
   * 4. Updates contacts.json
   *
   * @param applicationId - The job application ID
   * @param maxContacts - Maximum number of people to reach out to (default: 3)
   */
  async findAndReachOutToAll(
    applicationId: string,
    maxContacts: number = 3
  ): Promise<NetworkingContact[]> {
    const application = await this.dataStore.getApplication(applicationId);

    console.log(`🔍 Finding and reaching out to people at ${application.company}...`);

    // Single AGI session that does EVERYTHING:
    // 1. Navigate to search page
    // 2. Filter by company
    // 3. Extract people info
    // 4. Message/connect with ALL of them
    const instructions = `You are automating a networking outreach workflow. Here's what you need to do:

STEP 1: FILTER AND FIND PEOPLE
1. Navigate to https://real-networkin.vercel.app/platform/search/people/
2. Click the company filter in the top middle to open the "Select companies" modal
3. Check the box for "${application.company}"
4. Close the modal to apply the filter
5. Wait for the filtered results to load

STEP 2: EXTRACT PEOPLE INFO
6. From the FILTERED PAGE, identify up to ${maxContacts} people visible on the page
7. For each person, note their:
   - name
   - title
   - connection degree (1st, 2nd, or 3rd)
   - description/bio (the text under their name)

STEP 3: MESSAGE/CONNECT WITH EVERYONE
8. For EACH person you found, do the following:
   - If they are a 1st degree connection:
     * Click their "Message" button
     * Type this message: "Hi! I noticed you work at ${application.company}. I recently applied for the ${this.cleanJobTitle(application.jobTitle)} role and would love to chat about your experience at the company. Would you be open to a quick coffee chat?"
     * Click Send
     * Say "✓ Sent message to [their name]"

   - If they are a 2nd or 3rd degree connection:
     * Click their "Connect" button
     * If there's an "Add a note" option, click it
     * Type this message: "Hi! I'm interested in the ${this.cleanJobTitle(application.jobTitle)} position at ${application.company}. Would you be open to connecting and sharing your insights about the company?"
     * Click Send
     * Say "✓ Sent connection request to [their name]"

STEP 4: RETURN DATA
9. After messaging/connecting with everyone, return a structured list with all people you contacted, including:
   - name
   - title
   - connectionDegree
   - description

When finished with all contacts, say "DONE".`;

    try {
      console.log(`\n📋 AGI Instructions:\n${instructions}\n`);

      const result = await this.agiClient.executeAction({
        url: 'https://real-networkin.vercel.app/platform/search/people/',
        task: 'find_and_message_all',
        instructions: instructions,
        data: {
          company: application.company,
          maxContacts: maxContacts
        }
      });

      // Extract people from result
      const people = result.people || [];
      console.log(`✅ Contacted ${people.length} people`);

      // Create contact records for everyone we reached out to
      const contacts: NetworkingContact[] = [];
      for (const person of people) {
        const threadUrl = `https://real-networkin.vercel.app/platform/messaging/?thread=${person.name.toLowerCase().replace(/\s+/g, '')}`;
        const profileUrl = `https://real-networkin.vercel.app/platform/profile/${person.name.toLowerCase().replace(/\s+/g, '')}`;

        const messageText = this.generateOutreachMessage(
          application.jobTitle,
          application.company,
          person.connectionDegree
        );

        const contact: NetworkingContact = {
          id: uuidv4(),
          applicationId: application.id,
          name: person.name,
          title: person.title,
          company: application.company,
          connectionDegree: person.connectionDegree,
          profileUrl: profileUrl,
          description: person.description,
          outreachType: person.connectionDegree === '1st' ? 'message' : 'connection_request',
          messageText,
          messagingThreadUrl: threadUrl,
          status: 'pending',
          sentAt: new Date()
        };

        contacts.push(contact);
        await this.dataStore.saveContact(contact);
        console.log(`✅ Saved contact: ${contact.name}`);
      }

      // Update application with new contacts
      application.networkingContacts.push(...contacts);
      await this.dataStore.saveApplication(application);

      console.log(`✅ Successfully completed automated outreach to ${contacts.length} people`);
      return contacts;

    } catch (error) {
      console.error(`❌ Failed to complete outreach:`, error);
      throw error;
    }
  }

  /**
   * Helper to clean job title (remove markdown and numbering)
   */
  private cleanJobTitle(jobTitle: string): string {
    return jobTitle
      .replace(/^\d+\.\s*/, '') // Remove "1. " or "2. " prefix
      .replace(/\*\*/g, '')      // Remove ** markdown bold
      .trim();
  }


  /**
   * Generate personalized outreach message
   */
  private generateOutreachMessage(
    jobTitle: string,
    company: string,
    connectionDegree: string
  ): string {
    // Clean job title - remove markdown formatting and numbering
    const cleanTitle = jobTitle
      .replace(/^\d+\.\s*/, '') // Remove "1. " or "2. " prefix
      .replace(/\*\*/g, '')      // Remove ** markdown bold
      .trim();

    if (connectionDegree === '1st') {
      return `Hi! I noticed you work at ${company}. I recently applied for the ${cleanTitle} role and would love to chat about your experience at the company. Would you be open to a quick coffee chat?`;
    } else {
      return `Hi! I'm interested in the ${cleanTitle} position at ${company}. Would you be open to connecting and sharing your insights about the company?`;
    }
  }

  /**
   * Check if people responded
   */
  async checkResponses(contactIds: string[]): Promise<NetworkingContact[]> {
    const updatedContacts: NetworkingContact[] = [];

    console.log(`🔍 Checking responses for ${contactIds.length} contacts...`);

    for (const contactId of contactIds) {
      const contact = await this.dataStore.getContact(contactId);

      console.log(`  Checking ${contact.name}...`);

      // Navigate to messaging thread
      const threadResult = await this.agiClient.executeAction({
        url: contact.messagingThreadUrl!,
        task: 'check_messages',
        instructions: 'Check if there are new messages from the other person'
      });

      // Update contact status
      if (threadResult.hasNewMessages) {
        contact.status = 'responded';
        contact.responseText = threadResult.latestMessage;
        console.log(`  ✅ ${contact.name} responded!`);
      } else {
        contact.status = 'no_response';
        console.log(`  ⏳ ${contact.name} hasn't responded yet`);
      }

      contact.lastCheckedAt = new Date();
      await this.dataStore.saveContact(contact);
      updatedContacts.push(contact);
    }

    return updatedContacts;
  }
}
