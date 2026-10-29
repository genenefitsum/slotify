import { z } from 'zod';

/**
 * Auth form schemas. Field shapes mirror the backend contract
 * (frontend/src/types/auth.ts: LoginPayload / RegisterPayload).
 */

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional(),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.length >= 7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Use at least 8 characters'),
  role: z.enum(['customer', 'vendor_owner']),
});

export type RegisterForm = z.infer<typeof registerSchema>;
