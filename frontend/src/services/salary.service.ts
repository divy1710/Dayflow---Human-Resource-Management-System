import api from '../lib/axios';
import type { Salary, ApiResponse } from '../types';

interface SalaryResponse {
  salaries: Salary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const salaryService = {
  getMySalary: async (): Promise<ApiResponse<{ salary: Salary | null }>> => {
    const response = await api.get('/salary/my');
    return response.data;
  },

  getAllSalaries: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SalaryResponse>> => {
    const response = await api.get('/salary', { params });
    return response.data;
  },

  getSalaryByUser: async (
    userId: string
  ): Promise<ApiResponse<{ salary: Salary }>> => {
    const response = await api.get(`/salary/user/${userId}`);
    return response.data;
  },

  createSalary: async (data: {
    userId: string;
    basicSalary: number;
    allowances?: number;
    deductions?: number;
    currency?: string;
    paymentFrequency?: string;
  }): Promise<ApiResponse<{ salary: Salary }>> => {
    const response = await api.post('/salary', data);
    return response.data;
  },

  updateSalary: async (
    userId: string,
    data: Partial<Salary>
  ): Promise<ApiResponse<{ salary: Salary }>> => {
    const response = await api.put(`/salary/${userId}`, data);
    return response.data;
  },

  deleteSalary: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/salary/${id}`);
    return response.data;
  },
};
