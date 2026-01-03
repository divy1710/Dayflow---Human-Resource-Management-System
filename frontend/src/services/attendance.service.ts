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

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  pending: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  averageWorkHours: number;
  lateArrivals: number;
  earlyDepartures: number;
  attendanceRate: number;
}

export const attendanceService = {
  checkIn: async (location?: { latitude: number; longitude: number; address?: string }): Promise<ApiResponse<{ attendance: Attendance; message: string }>> => {
    const response = await api.post('/attendance/check-in', { location });
    return response.data;
  },

  checkOut: async (location?: { latitude: number; longitude: number; address?: string }): Promise<ApiResponse<{ attendance: Attendance; message: string }>> => {
    const response = await api.post('/attendance/check-out', { location });
    return response.data;
  },

  startBreak: async (): Promise<ApiResponse<{ attendance: Attendance }>> => {
    const response = await api.post('/attendance/break/start');
    return response.data;
  },

  endBreak: async (): Promise<ApiResponse<{ attendance: Attendance }>> => {
    const response = await api.post('/attendance/break/end');
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

  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<ApiResponse<{ stats: AttendanceStats }>> => {
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },

  requestRegularization: async (data: {
    date: string;
    reason: string;
    checkIn?: string;
    checkOut?: string;
  }): Promise<ApiResponse<{ attendance: Attendance; message: string }>> => {
    const response = await api.post('/attendance/regularization', data);
    return response.data;
  },

  processRegularization: async (
    id: string,
    action: 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<ApiResponse<{ attendance: Attendance; message: string }>> => {
    const response = await api.put(`/attendance/regularization/${id}`, { action, notes });
    return response.data;
  },

  markAbsentees: async (date?: string): Promise<ApiResponse<{ marked: number; absent: number; onLeave: number; date: Date }>> => {
    const response = await api.post('/attendance/mark-absentees', { date });
    return response.data;
  },

  getRegularizationRequests: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    requests: Attendance[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/attendance/regularization/requests', { params });
    return response.data;
  },
};
