/**
 * FormInput — a styled input that integrates with react-hook-form.
 *
 * Usage:
 *   const { register, formState: { errors } } = useForm<ChangePasswordInput>({
 *     resolver: zodResolver(changePasswordSchema),
 *   })
 *
 *   <FormInput
 *     label="Current Password"
 *     type="password"
 *     icon="lock"
 *     registration={register('old_password')}
 *     error={errors.old_password?.message}
 *   />
 *
 * Design consistency: matches the existing LoginPage inputs exactly so
 * migrating other forms doesn't introduce visual diff.
 */
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: string
  error?: string
  hint?: string
  registration?: UseFormRegisterReturn
  /** Right-side adornment — e.g. a show/hide password toggle. */
  endAdornment?: React.ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, icon, error, hint, registration, endAdornment, className = '', ...rest },
  ref,
) {
  const hasError = Boolean(error)
  const inputId = rest.id ?? registration?.name ?? (rest as { name?: string }).name

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">
              {icon}
            </span>
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={`block w-full ${icon ? 'pl-11' : 'pl-4'} ${endAdornment ? 'pr-11' : 'pr-4'} py-3 bg-surface-container-lowest rounded-xl border ${
            hasError
              ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/10'
              : 'border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10'
          } focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all ${className}`}
          {...registration}
          {...rest}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{endAdornment}</div>
        )}
      </div>
      {hasError && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p className="mt-1.5 text-xs text-on-surface-variant/70">{hint}</p>
      )}
    </div>
  )
})
