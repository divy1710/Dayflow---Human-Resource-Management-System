import api from '../lib/axios';
import type { LeaveRequest, LeaveBalance, ApplyLeaveData, ApiResponse } from '../types';

interface LeaveResponse {
  leaves: LeaveRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const leaveService = {
  applyLeave: async (
    data: ApplyLeaveData
  ): Promise<ApiResponse<{ leave: LeaveRequest }>> => {
    const response = await api.post('/leave/apply', data);
    return response.data;
  },

  getMyLeaves: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LeaveResponse>> => {
    const response = await api.get('/leave/my', { params });
    return response.data;
  },

  // Alias for getMyLeaves
  getMyLeaveRequests: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LeaveResponse>> => {
    const response = await api.get('/leave/my', { params });
    return response.data;
  },

  getAllLeaves: async (params?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LeaveResponse>> => {
    const response = await api.get('/leave', { params });
    return response.data;
  },

  getLeaveById: async (
    id: string
  ): Promise<ApiResponse<{ leave: LeaveRequest }>> => {
    const response = await api.get(`/leave/${id}`);
    return response.data;
  },

  approveLeave: async (
    id: string,
    comments?: string
  ): Promise<ApiResponse<{ leave: LeaveRequest }>> => {
    const response = await api.put(`/leave/${id}/approve`, { comments });
    return response.data;
  },

  rejectLeave: async (
    id: string,
    comments?: string
  ): Promise<ApiResponse<{ leave: LeaveRequest }>> => {
    const response = await api.put(`/leave/${id}/reject`, { comments });
    return response.data;
  },

  cancelLeave: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/leave/${id}`);
    return response.data;
  },

  // Alias for cancelLeave to match component usage
  deleteLeave: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/leave/${id}`);
    return response.data;
  },

  getLeaveBalance: async (): Promise<
    ApiResponse<{ balances: LeaveBalance[] }>
  > => {
    const response = await api.get('/leave/balance');
    return response.data;
  },
};
