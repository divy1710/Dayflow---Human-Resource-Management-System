import { z } from 'zod';

export const signUpSchema = z.object({
  body: z.object({
    employeeId: z
      .string()
      .min(3, 'Employee ID must be at least 3 characters'),
    email: z
      .string()
      .email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters'),
    role: z
      .enum(['EMPLOYEE', 'HR', 'ADMIN'])
      .optional()
      .default('EMPLOYEE'),
  }),
});

export const signInSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address'),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});
