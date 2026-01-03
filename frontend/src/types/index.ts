// User types
export type Role = 'ADMIN' | 'EMPLOYEE';

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
  site?: string;
  status?: string;
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
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'PENDING' | 'HOLIDAY' | 'WEEKEND';

export interface Attendance {
  _id: string;
  userId: any;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  overtimeHours?: number;
  lateArrival?: number;
  earlyDeparture?: number;
  breaks?: {
    startTime: string;
    endTime?: string;
    duration?: number;
  }[];
  shiftStartTime?: string;
  shiftEndTime?: string;
  expectedWorkHours?: number;
  isRegularized?: boolean;
  regularizationReason?: string;
  regularizationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: any;
  approvedAt?: string;
  notes?: string;
  location?: {
    checkIn?: { latitude: number; longitude: number; address?: string };
    checkOut?: { latitude: number; longitude: number; address?: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceStats {
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

// Leave types
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LeaveType = 'PAID' | 'SICK' | 'UNPAID' | 'CASUAL';

export interface LeaveRequest {
  _id: string;
  userId: any;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLeaveRequestData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
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
  _id: string;
  userId: any;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  paymentFrequency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSalaryData {
  userId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  currency?: string;
  paymentFrequency?: string;
}

export interface UpdateSalaryData {
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  currency?: string;
  paymentFrequency?: string;
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
