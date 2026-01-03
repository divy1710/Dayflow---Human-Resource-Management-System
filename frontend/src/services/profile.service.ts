import api from '../lib/axios';
import type { Profile, ApiResponse } from '../types';

export const profileService = {
  getProfile: async (userId?: string): Promise<ApiResponse<{ profile: Profile }>> => {
    const url = userId ? `/profile/${userId}` : '/profile';
    const response = await api.get(url);
    return response.data;
  },

  getMyProfile: async (): Promise<ApiResponse<{ profile: Profile }>> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (
    data: Partial<Profile>,
    userId?: string
  ): Promise<ApiResponse<{ profile: Profile }>> => {
    const url = userId ? `/profile/${userId}` : '/profile';
    const response = await api.put(url, data);
    return response.data;
  },

  uploadProfilePicture: async (
    file: File
  ): Promise<ApiResponse<{ profile: Profile }>> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<ApiResponse<{ document: any }>> => {
    const response = await api.post('/profile/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadDocument: async (documentId: string): Promise<any> => {
    const response = await api.get(`/profile/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  deleteDocument: async (
    documentId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/profile/documents/${documentId}`);
    return response.data;
  },
};
