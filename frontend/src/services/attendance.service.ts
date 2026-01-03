import api from '../lib/axios';
import type { Attendance, ApiResponse } from '../types';

interface AttendanceResponse {
  attendances: Attendance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const attendanceService = {
  checkIn: async (): Promise<ApiResponse<{ attendance: Attendance }>> => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  checkOut: async (): Promise<ApiResponse<{ attendance: Attendance }>> => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  getMyAttendance: async (params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AttendanceResponse>> => {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  },

  getAllAttendance: async (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AttendanceResponse>> => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  getAttendanceByUser: async (
    userId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ApiResponse<{ attendances: Attendance[] }>> => {
    const response = await api.get(`/attendance/user/${userId}`, { params });
    return response.data;
  },

  updateAttendance: async (
    id: string,
    data: Partial<Attendance>
  ): Promise<ApiResponse<{ attendance: Attendance }>> => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },
};
