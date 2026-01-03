// User types
export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
  profile: Profile | null;
  createdAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  employmentType?: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  profileId: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}

// Auth types
export interface SignUpData {
  employeeId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

// Attendance types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  notes?: string;
  user?: User;
}

// Leave types
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LeaveType = 'PAID' | 'SICK' | 'UNPAID' | 'CASUAL';

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  user?: User;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveType: LeaveType;
  total: number;
  used: number;
  remaining: number;
  year: number;
}

export interface ApplyLeaveData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

// Salary types
export interface Salary {
  id: string;
  userId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  paymentFrequency: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
