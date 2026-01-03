import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    tradeId: z.string().min(1, 'Trade ID is required'),
    employeeName: z.string().min(2, 'Employee name must be at least 2 characters'),
    site: z.string().min(1, 'Site is required'),
    department: z.string().min(1, 'Department is required'),
    designation: z.string().min(1, 'Designation is required'),
    dateOfJoining: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
    email: z.string().email('Invalid email address'),
    gender: z.enum(['Male', 'Female', 'Other'], {
      errorMap: () => ({ message: 'Gender must be Male, Female, or Other' }),
    }),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    pan: z.string().optional(),
    aadhaar: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
      })
      .optional(),
    bankDetails: z
      .object({
        accountNumber: z.string().optional(),
        ifscCode: z.string().optional(),
        bankName: z.string().optional(),
        branch: z.string().optional(),
      })
      .optional(),
    emergencyContact: z
      .object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated']).optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    tradeId: z.string().min(1).optional(),
    employeeName: z.string().min(2).optional(),
    site: z.string().min(1).optional(),
    department: z.string().min(1).optional(),
    designation: z.string().min(1).optional(),
    dateOfJoining: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      })
      .optional(),
    email: z.string().email().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    dateOfBirth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      })
      .optional(),
    mobile: z.string().min(10).optional(),
    pan: z.string().optional(),
    aadhaar: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
      })
      .optional(),
    bankDetails: z
      .object({
        accountNumber: z.string().optional(),
        ifscCode: z.string().optional(),
        bankName: z.string().optional(),
        branch: z.string().optional(),
      })
      .optional(),
    emergencyContact: z
      .object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated']).optional(),
  }),
});

export const getEmployeeByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Employee ID is required'),
  }),
});
