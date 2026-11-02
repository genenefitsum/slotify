import { z } from 'zod';

/**
 * Auth form schemas. Field shapes mirror the backend contract
 * (frontend/src/types/auth.ts: LoginPayload / RegisterPayload).
 */

// Policy for any password a user *sets* (register / reset): at least 8 chars
// with an uppercase letter, a lowercase letter, and a number. Mirrors the
// backend (backend/src/validators/shared.js: requirePassword). Login stays lax
// so existing accounts can still sign in.
const PASSWORD_POLICY_MESSAGE =
  'At least 8 characters with an uppercase letter, a lowercase letter, and a number';

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_POLICY_MESSAGE)
  .regex(/[a-z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[A-Z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[0-9]/, PASSWORD_POLICY_MESSAGE);

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
  password: passwordSchema,
  role: z.enum(['customer', 'vendor_owner']),
});

export type RegisterForm = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code'),
  newPassword: passwordSchema,
});

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80, 'Too long'),
  lastName: z.string().trim().max(80, 'Too long').optional(),
});

export type ProfileForm = z.infer<typeof profileSchema>;
