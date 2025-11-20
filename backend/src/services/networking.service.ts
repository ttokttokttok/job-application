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
   * Find people at company and reach out
   */
  async reachOut(
    applicationId: string,
    maxContacts: number = 5
  ): Promise<NetworkingContact[]> {
    const application = await this.dataStore.getApplication(applicationId);
    const contacts: NetworkingContact[] = [];

    console.log(`🔍 Finding people at ${application.company}...`);

    // Step 1: Navigate to people search
    const peopleResult = await this.agiClient.executeAction({
      url: 'https://real-networkin.vercel.app/platform/search/people/',
      task: 'search_people',
      instructions: `Filter by current company: "${application.company}". Find up to ${maxContacts} people.`,
      data: {
        company: application.company,
        limit: maxContacts
      }
    });

    console.log(`✅ Found ${peopleResult.people.length} people`);

    // Step 2: For each person, send message or connection request
    for (const person of peopleResult.people) {
      try {
        console.log(`📤 Reaching out to ${person.name}...`);
        const contact = await this.sendOutreach(application, person);
        contacts.push(contact);
        console.log(`✅ Sent to ${person.name}`);
      } catch (error) {
        console.error(`❌ Failed to reach out to ${person.name}:`, error);
      }
    }

    // Update application with new contacts
    application.networkingContacts.push(...contacts);
    await this.dataStore.saveApplication(application);

    return contacts;
  }

  /**
   * Send message or connection request to a person
   */
  private async sendOutreach(
    application: JobApplication,
    person: any
  ): Promise<NetworkingContact> {
    const messageText = this.generateOutreachMessage(
      application.jobTitle,
      application.company,
      person.connectionDegree
    );

    if (person.connectionDegree === '1st') {
      // Send direct message
      await this.agiClient.executeAction({
        url: person.profileUrl,
        task: 'send_message',
        instructions: 'Click Message button, type message, and send',
        data: { message: messageText }
      });
    } else {
      // Send connection request with note
      await this.agiClient.executeAction({
        url: person.profileUrl,
        task: 'send_connection_request',
        instructions: 'Click Connect, click Add Note, type message, and send',
        data: { note: messageText }
      });
    }

    // Create contact record
    const threadUrl = `https://real-networkin.vercel.app/platform/messaging/?thread=${person.name.toLowerCase().replace(/\s+/g, '')}`;

    const contact: NetworkingContact = {
      id: uuidv4(),
      applicationId: application.id,
      name: person.name,
      title: person.title,
      company: application.company,
      connectionDegree: person.connectionDegree,
      profileUrl: person.profileUrl,
      description: person.description,
      outreachType: person.connectionDegree === '1st' ? 'message' : 'connection_request',
      messageText,
      messagingThreadUrl: threadUrl,
      status: 'pending',
      sentAt: new Date()
    };

    await this.dataStore.saveContact(contact);
    return contact;
  }

  /**
   * Generate personalized outreach message
   */
  private generateOutreachMessage(
    jobTitle: string,
    company: string,
    connectionDegree: string
  ): string {
    if (connectionDegree === '1st') {
      return `Hi! I noticed you work at ${company}. I recently applied for the ${jobTitle} role and would love to chat about your experience at the company. Would you be open to a quick coffee chat?`;
    } else {
      return `Hi! I'm interested in the ${jobTitle} position at ${company}. Would you be open to connecting and sharing your insights about the company?`;
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
