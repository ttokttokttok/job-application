import axios from 'axios';
import { UserProfile, JobApplication, NetworkingContact } from '../types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Resume
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resumeFile', file);

    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Profile
  async createProfile(data: Partial<UserProfile>) {
    const response = await api.post('/profile', data);
    return response.data;
  },

  async getProfile(id: string) {
    const response = await api.get(`/profile/${id}`);
    return response.data;
  },

  async updateProfile(id: string, data: Partial<UserProfile>) {
    const response = await api.patch(`/profile/${id}`, data);
    return response.data;
  },

  // Jobs
  async searchAndApply(profileId: string) {
    const response = await api.post('/jobs/search-and-apply', { profileId });
    return response.data;
  },

  async getApplications(profileId: string) {
    const response = await api.get(`/jobs/applications/${profileId}`);
    return response.data;
  },

  async getApplication(id: string) {
    const response = await api.get(`/jobs/application/${id}`);
    return response.data;
  },

  // Networking
  async reachOut(applicationId: string, maxContacts: number = 5) {
    const response = await api.post('/networking/reach-out', {
      applicationId,
      maxContacts
    });
    return response.data;
  },

  async checkResponses(contactIds: string[]) {
    const response = await api.post('/networking/check-responses', { contactIds });
    return response.data;
  },

  async getContacts(applicationId: string) {
    const response = await api.get(`/networking/${applicationId}`);
    return response.data;
  },

  // Agent / Conversation
  async sendMessage(userId: string, message: string) {
    const response = await api.post('/agent/message', { userId, message });
    return response.data;
  },

  async getConversation(userId: string) {
    const response = await api.get(`/agent/conversation/${userId}`);
    return response.data;
  },

  async clearConversation(userId: string) {
    const response = await api.delete(`/agent/conversation/${userId}`);
    return response.data;
  },

  async initializeConversation(userId: string, profileData: any) {
    const response = await api.post('/agent/initialize', { userId, profileData });
    return response.data;
  },

  async startVoiceCall(userId: string, phoneNumber: string) {
    const response = await api.post('/agent/voice/call', { userId, phoneNumber });
    return response.data;
  },
};
