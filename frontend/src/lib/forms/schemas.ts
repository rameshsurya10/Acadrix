/**
 * Shared zod schemas for form validation.
 *
 * These primitives are composable — build bigger schemas by combining them:
 *
 *   const loginSchema = z.object({
 *     email: emailSchema,
 *     password: passwordSchema,
 *   })
 *
 * The idea is to have ONE definition of "what is a valid email" or "what is
 * a valid Indian phone number" and reuse it everywhere. Change a rule here,
 * every form using it inherits the new rule.
 */
import { z } from 'zod'

// ── Primitive field schemas ─────────────────────────────────────────────

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')

export const strongPasswordSchema = passwordSchema
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/\d/, 'Must contain at least one number')

/** Indian mobile: 10 digits, optional +91 / 91 prefix. Strips formatting. */
export const indianPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length === 10 || (v.length === 12 && v.startsWith('91')), {
    message: 'Enter a valid 10-digit Indian mobile number',
  })
  .transform((v) => (v.length === 12 ? v.slice(2) : v))

/** 6-digit numeric OTP. */
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits')

/** Student/employee ID: "SM-2024-0001" style. Just needs non-empty + max length. */
export const idSchema = z
  .string()
  .min(1, 'ID is required')
  .max(40, 'ID is too long')

/** Login identifier: either an email OR an ID. */
export const identifierSchema = z
  .string()
  .min(1, 'Enter your email or ID')
  .max(120)

// ── Composite schemas ───────────────────────────────────────────────────

/** Passwords-match refinement. Use on objects with `password` + `confirm_password`. */
export function passwordsMatch<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data: { password?: string; confirm_password?: string }) =>
      data.password === data.confirm_password,
    {
      message: 'Passwords do not match',
      path: ['confirm_password'],
    },
  )
}

// ── Reusable composite forms ────────────────────────────────────────────

export const changePasswordSchema = passwordsMatch(
  z.object({
    old_password: z.string().min(1, 'Current password is required'),
    password: strongPasswordSchema,
    confirm_password: z.string().min(1, 'Confirm your new password'),
  }),
)
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const loginWithPasswordSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
})
export type LoginWithPasswordInput = z.infer<typeof loginWithPasswordSchema>

export const parentLoginPhoneSchema = z.object({
  phone: indianPhoneSchema,
})
export type ParentLoginPhoneInput = z.infer<typeof parentLoginPhoneSchema>

export const otpVerifySchema = z.object({
  otp: otpSchema,
})
export type OTPVerifyInput = z.infer<typeof otpVerifySchema>
