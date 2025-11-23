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
   * Search for people at company (without sending messages yet)
   * This creates a session, filters, and returns people data
   * The session is CLOSED after this, so use searchAndStayOnPage if you plan to message them
   */
  async searchContacts(
    applicationId: string,
    maxContacts: number = 5
  ): Promise<any[]> {
    const application = await this.dataStore.getApplication(applicationId);

    console.log(`🔍 Finding people at ${application.company}...`);

    // Navigate to people search page and filter by company
    const peopleResult = await this.agiClient.executeAction({
      url: 'https://real-networkin.vercel.app/platform/search/people/',
      task: 'search_people',
      instructions: `
1. Navigate to https://real-networkin.vercel.app/platform/search/people/
2. Click the company filter in the top middle to open the "Select companies" modal
3. Check the box for "${application.company}"
4. Close the modal to apply the filter
5. Wait for the filtered results to load
6. From the FILTERED PAGE (do NOT click into individual profiles), extract up to ${maxContacts} people visible on the page
7. For each person, extract:
   - name
   - title
   - connection degree (1st, 2nd, or 3rd)
   - description/bio (the text under their name)
   - their index position on the page (0-based)
8. Return the people as a structured list

IMPORTANT: Stay on the filtered search results page. Do NOT click into individual profiles.`,
      data: {
        company: application.company,
        limit: maxContacts
      }
    });

    console.log(`✅ Found ${peopleResult.people?.length || 0} people`);

    return peopleResult.people || [];
  }

  /**
   * Find people at company and reach out to selected contacts
   * Does EVERYTHING in a single AGI session: filter page → message/connect selected people
   *
   * @param applicationId - The job application ID
   * @param selectedPeopleIndexes - Array of indexes (0-based) of people to contact
   * @param allPeople - The full list of people found (from searchContacts)
   */
  async reachOut(
    applicationId: string,
    selectedPeopleIndexes: number[],
    allPeople: any[]
  ): Promise<NetworkingContact[]> {
    const application = await this.dataStore.getApplication(applicationId);
    const contacts: NetworkingContact[] = [];

    const selectedPeople = selectedPeopleIndexes.map(i => ({ person: allPeople[i], index: i })).filter(p => p.person);

    console.log(`📤 Reaching out to ${selectedPeople.length} people from the filtered page...`);

    // Build clear, step-by-step instructions
    let instructions = `You are on a LinkedIn-style networking page. Send ${selectedPeople.length} message${selectedPeople.length > 1 ? 's' : ''} to the following people:

`;

    for (let i = 0; i < selectedPeople.length; i++) {
      const { person, index } = selectedPeople[i];
      const messageText = this.generateOutreachMessage(
        application.jobTitle,
        application.company,
        person.connectionDegree
      );

      if (person.connectionDegree === '1st') {
        instructions += `
${i + 1}. Find "${person.name}" on the page
   - Click their "Message" button
   - Type: ${messageText}
   - Click Send
   - Say "✓ Sent message to ${person.name}"

`;
      } else {
        instructions += `
${i + 1}. Find "${person.name}" on the page
   - Click their "Connect" button
   - If there's an "Add a note" option, click it
   - Type: ${messageText}
   - Click Send
   - Say "✓ Sent connection request to ${person.name}"

`;
      }

      // Create contact record
      const threadUrl = `https://real-networkin.vercel.app/platform/messaging/?thread=${person.name.toLowerCase().replace(/\s+/g, '')}`;
      const profileUrl = `https://real-networkin.vercel.app/platform/profile/${person.name.toLowerCase().replace(/\s+/g, '')}`;

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
    }

    instructions += `
After sending all ${selectedPeople.length} message${selectedPeople.length > 1 ? 's' : ''}, say "DONE" and stop.`;

    // Execute EVERYTHING in a single AGI session
    try {
      console.log(`\n📋 AGI Instructions:\n${instructions}\n`);

      await this.agiClient.executeAction({
        url: 'https://real-networkin.vercel.app/platform/search/people/',
        task: 'filter_and_send_outreach',
        instructions: instructions,
        data: {
          company: application.company,
          contactCount: selectedPeople.length
        }
      });

      // Save all contacts
      for (const contact of contacts) {
        await this.dataStore.saveContact(contact);
        console.log(`✅ Saved contact: ${contact.name}`);
      }

      // Update application with new contacts
      application.networkingContacts.push(...contacts);
      await this.dataStore.saveApplication(application);

      console.log(`✅ Successfully reached out to ${contacts.length} people in one session`);
    } catch (error) {
      console.error(`❌ Failed to complete outreach:`, error);
      throw error;
    }

    return contacts;
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
