import axios from '../lib/axios';

export interface Employee {
  _id: string;
  tradeId: string;
  employeeName: string;
  site: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  mobile: string;
  pan?: string;
  aadhaar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  tradeId: string;
  employeeName: string;
  site: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  mobile: string;
  pan?: string;
  aadhaar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  status?: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  site?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const employeeService = {
  async createEmployee(data: CreateEmployeeData) {
    const response = await axios.post('/employees', data);
    return response.data;
  },

  async getAllEmployees(filters?: EmployeeFilters) {
    const response = await axios.get('/employees', { params: filters });
    return response.data;
  },

  async getEmployeeById(id: string) {
    const response = await axios.get(`/employees/${id}`);
    return response.data;
  },

  async updateEmployee(id: string, data: Partial<CreateEmployeeData>) {
    const response = await axios.put(`/employees/${id}`, data);
    return response.data;
  },

  async deleteEmployee(id: string) {
    const response = await axios.delete(`/employees/${id}`);
    return response.data;
  },

  async getEmployeeStats() {
    const response = await axios.get('/employees/stats');
    return response.data;
  },
};
