/**
 * ChangePasswordForm — reference implementation for Phase 2.2.
 *
 * Demonstrates the react-hook-form + zod pattern we want all future forms
 * to follow:
 *   - Schema defined in src/lib/forms/schemas.ts (single source of truth)
 *   - Form state managed by react-hook-form (no useState per field)
 *   - Validation errors wired automatically via the zodResolver
 *   - Submit disabled while isSubmitting, no race conditions
 *
 * Drop-in usage:
 *   <ChangePasswordForm onSuccess={() => toast('Password changed')} />
 */
import { useState } from 'react'
import { useForm, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/lib/api'
import { FormInput } from '@/components/forms/FormInput'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/forms/schemas'

/** Extract a plain error message from react-hook-form's union type. */
function errMsg(err: FieldError | undefined): string | undefined {
  return err?.message
}

interface Props {
  onSuccess?: () => void
}

export default function ChangePasswordForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      password: '',
      confirm_password: '',
    },
  })

  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  async function onSubmit(values: ChangePasswordInput) {
    setServerError(null)
    setServerSuccess(null)
    try {
      await api.post('/auth/change-password/', {
        old_password: values.old_password,
        new_password: values.password,
        confirm_password: values.confirm_password,
      })
      reset()
      setServerSuccess('Password changed successfully.')
      onSuccess?.()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to change password. Check your current password and try again.'
      setServerError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
          <span className="material-symbols-outlined text-error text-lg">error</span>
          <span className="text-sm text-on-error-container">{serverError}</span>
        </div>
      )}
      {serverSuccess && (
        <div role="status" className="flex items-center gap-2 rounded-lg bg-tertiary/10 border border-tertiary/30 px-4 py-3">
          <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
          <span className="text-sm text-on-surface">{serverSuccess}</span>
        </div>
      )}

      <FormInput
        label="Current Password"
        icon="lock"
        type={showOld ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Enter your current password"
        registration={register('old_password')}
        error={errMsg(errors.old_password as FieldError | undefined)}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowOld((v) => !v)}
            aria-label={showOld ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
              {showOld ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      <FormInput
        label="New Password"
        icon="lock_reset"
        type={showNew ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Min 8 chars, must include upper, lower, number"
        registration={register('password')}
        error={errMsg(errors.password as FieldError | undefined)}
        hint="Use a unique password — at least 8 characters with a mix of letters and numbers."
        endAdornment={
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
              {showNew ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      <FormInput
        label="Confirm New Password"
        icon="lock"
        type={showNew ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Re-enter the new password"
        registration={register('confirm_password')}
        error={errMsg(errors.confirm_password as FieldError | undefined)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-xl hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          'Change Password'
        )}
      </button>
    </form>
  )
}
