import api from '../lib/axios';
import type { SignUpData, SignInData, AuthResponse, User } from '../types';

export const authService = {
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signin', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  signOut: async (): Promise<void> => {
    await api.post('/auth/signout');
    localStorage.removeItem('token');
  },

  getMe: async (): Promise<{ data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
