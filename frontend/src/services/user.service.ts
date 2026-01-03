import api from '../lib/axios';
import type { User, ApiResponse } from '../types';

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const userService = {
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<ApiResponse<UsersResponse>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    data: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
