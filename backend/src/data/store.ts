import fs from 'fs/promises';
import path from 'path';
import { UserProfile, JobApplication, NetworkingContact } from '../types/models';

const DATA_DIR = path.join(__dirname, '../../data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

export class DataStore {
  constructor() {
    this.ensureDataFilesExist();
  }

  /**
   * Ensure data directory and files exist
   */
  private async ensureDataFilesExist(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    const files = [PROFILES_FILE, APPLICATIONS_FILE, CONTACTS_FILE];
    for (const file of files) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify([]), 'utf-8');
      }
    }
  }

  /**
   * Read JSON file
   */
  private async readFile<T>(filePath: string): Promise<T[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T[];
  }

  /**
   * Write JSON file
   */
  private async writeFile<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ============ Profile Methods ============

  async getProfile(id: string): Promise<UserProfile> {
    const profiles = await this.readFile<UserProfile>(PROFILES_FILE);
    const profile = profiles.find(p => p.id === id);
    if (!profile) {
      throw new Error(`Profile not found: ${id}`);
    }
    return profile;
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    return this.readFile<UserProfile>(PROFILES_FILE);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const profiles = await this.readFile<UserProfile>(PROFILES_FILE);
    const index = profiles.findIndex(p => p.id === profile.id);

    if (index >= 0) {
      // Update existing
      profiles[index] = {
        ...profile,
        updatedAt: new Date()
      };
    } else {
      // Add new
      profiles.push({
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await this.writeFile(PROFILES_FILE, profiles);
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile(id);
    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };
    await this.saveProfile(updated);
    return updated;
  }

  async deleteProfile(id: string): Promise<void> {
    const profiles = await this.readFile<UserProfile>(PROFILES_FILE);
    const filtered = profiles.filter(p => p.id !== id);
    await this.writeFile(PROFILES_FILE, filtered);
  }

  // ============ Application Methods ============

  async getApplication(id: string): Promise<JobApplication> {
    const applications = await this.readFile<JobApplication>(APPLICATIONS_FILE);
    const application = applications.find(a => a.id === id);
    if (!application) {
      throw new Error(`Application not found: ${id}`);
    }
    return application;
  }

  async getApplicationsByUser(userId: string): Promise<JobApplication[]> {
    const applications = await this.readFile<JobApplication>(APPLICATIONS_FILE);
    return applications.filter(a => a.userId === userId);
  }

  async getAllApplications(): Promise<JobApplication[]> {
    return this.readFile<JobApplication>(APPLICATIONS_FILE);
  }

  async saveApplication(application: JobApplication): Promise<void> {
    const applications = await this.readFile<JobApplication>(APPLICATIONS_FILE);
    const index = applications.findIndex(a => a.id === application.id);

    if (index >= 0) {
      // Update existing
      applications[index] = application;
    } else {
      // Add new
      applications.push(application);
    }

    await this.writeFile(APPLICATIONS_FILE, applications);
  }

  async deleteApplication(id: string): Promise<void> {
    const applications = await this.readFile<JobApplication>(APPLICATIONS_FILE);
    const filtered = applications.filter(a => a.id !== id);
    await this.writeFile(APPLICATIONS_FILE, filtered);
  }

  // ============ Contact Methods ============

  async getContact(id: string): Promise<NetworkingContact> {
    const contacts = await this.readFile<NetworkingContact>(CONTACTS_FILE);
    const contact = contacts.find(c => c.id === id);
    if (!contact) {
      throw new Error(`Contact not found: ${id}`);
    }
    return contact;
  }

  async getContactsByApplication(applicationId: string): Promise<NetworkingContact[]> {
    const contacts = await this.readFile<NetworkingContact>(CONTACTS_FILE);
    return contacts.filter(c => c.applicationId === applicationId);
  }

  async getAllContacts(): Promise<NetworkingContact[]> {
    return this.readFile<NetworkingContact>(CONTACTS_FILE);
  }

  async saveContact(contact: NetworkingContact): Promise<void> {
    const contacts = await this.readFile<NetworkingContact>(CONTACTS_FILE);
    const index = contacts.findIndex(c => c.id === contact.id);

    if (index >= 0) {
      // Update existing
      contacts[index] = contact;
    } else {
      // Add new
      contacts.push(contact);
    }

    await this.writeFile(CONTACTS_FILE, contacts);
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = await this.readFile<NetworkingContact>(CONTACTS_FILE);
    const filtered = contacts.filter(c => c.id !== id);
    await this.writeFile(CONTACTS_FILE, filtered);
  }
}
