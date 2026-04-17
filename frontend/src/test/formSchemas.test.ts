/**
 * Unit tests for the shared zod schemas.
 *
 * Tests exercise the validation rules directly. No React involved —
 * pure schema parsing. Fast and deterministic.
 */
import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  indianPhoneSchema,
  otpSchema,
  changePasswordSchema,
  parentLoginPhoneSchema,
} from '@/lib/forms/schemas'

describe('emailSchema', () => {
  it('accepts valid email', () => {
    expect(emailSchema.safeParse('ravi@school.edu').success).toBe(true)
  })

  it('rejects empty string', () => {
    const r = emailSchema.safeParse('')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Email is required')
  })

  it('rejects missing @', () => {
    expect(emailSchema.safeParse('ravi').success).toBe(false)
  })
})

describe('passwordSchema', () => {
  it('accepts 8+ chars', () => {
    expect(passwordSchema.safeParse('password123').success).toBe(true)
  })

  it('rejects < 8 chars', () => {
    const r = passwordSchema.safeParse('short')
    expect(r.success).toBe(false)
  })
})

describe('strongPasswordSchema', () => {
  it('accepts strong password', () => {
    expect(strongPasswordSchema.safeParse('Hunter12Safe').success).toBe(true)
  })

  it('rejects all lowercase', () => {
    const r = strongPasswordSchema.safeParse('hunter12safe')
    expect(r.success).toBe(false)
  })

  it('rejects no digits', () => {
    const r = strongPasswordSchema.safeParse('HunterOnlyLetters')
    expect(r.success).toBe(false)
  })
})

describe('indianPhoneSchema', () => {
  it('accepts 10 digit number', () => {
    const r = indianPhoneSchema.safeParse('9876543210')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('9876543210')
  })

  it('strips +91 country code', () => {
    const r = indianPhoneSchema.safeParse('+919876543210')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('9876543210')
  })

  it('strips formatting', () => {
    const r = indianPhoneSchema.safeParse('98765 43210')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('9876543210')
  })

  it('rejects 9 digits', () => {
    expect(indianPhoneSchema.safeParse('987654321').success).toBe(false)
  })

  it('rejects empty', () => {
    expect(indianPhoneSchema.safeParse('').success).toBe(false)
  })
})

describe('otpSchema', () => {
  it('accepts 6 digits', () => {
    expect(otpSchema.safeParse('123456').success).toBe(true)
  })

  it('rejects 5 digits', () => {
    expect(otpSchema.safeParse('12345').success).toBe(false)
  })

  it('rejects letters', () => {
    expect(otpSchema.safeParse('abc123').success).toBe(false)
  })
})

describe('changePasswordSchema', () => {
  it('accepts matching passwords', () => {
    const r = changePasswordSchema.safeParse({
      old_password: 'oldPass123',
      password: 'NewStrong99',
      confirm_password: 'NewStrong99',
    })
    expect(r.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const r = changePasswordSchema.safeParse({
      old_password: 'oldPass123',
      password: 'NewStrong99',
      confirm_password: 'Different99',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      const mismatchIssue = r.error.issues.find((i) => i.path.includes('confirm_password'))
      expect(mismatchIssue?.message).toBe('Passwords do not match')
    }
  })

  it('rejects missing old password', () => {
    const r = changePasswordSchema.safeParse({
      old_password: '',
      password: 'NewStrong99',
      confirm_password: 'NewStrong99',
    })
    expect(r.success).toBe(false)
  })

  it('rejects weak new password', () => {
    const r = changePasswordSchema.safeParse({
      old_password: 'oldPass123',
      password: 'weak',
      confirm_password: 'weak',
    })
    expect(r.success).toBe(false)
  })
})

describe('parentLoginPhoneSchema', () => {
  it('normalizes phone on success', () => {
    const r = parentLoginPhoneSchema.safeParse({ phone: '+91 98765 43210' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.phone).toBe('9876543210')
  })
})
