import { useState, FormEvent, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authService, type ParentChild } from '@/services/shared/authService'
import ParticleNetwork from '@/components/shared/ParticleNetwork'

type Step =
  | 'identify' | 'password' | 'set_password' | 'otp' | 'forgot' | 'reset'
  | 'parent_phone' | 'parent_otp' | 'parent_select_child'

function ErrorAlert({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
      <span className="material-symbols-outlined text-error text-lg">error</span>
      <span className="text-sm text-on-error-container">{error}</span>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
      <span className="material-symbols-outlined text-lg">arrow_back</span>
      Back
    </button>
  )
}

function SubmitButton({ children, isLoading, disabled }: { children: React.ReactNode; isLoading: boolean; disabled?: boolean }) {
  return (
    <button type="submit" disabled={isLoading || disabled}
      className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-xl hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1">
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
          Please wait...
        </span>
      ) : children}
    </button>
  )
}

function OTPInputs({ digits, onChange, onKeyDown, onPaste, inputRefs }: {
  digits: string[]
  onChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent) => void
  onPaste: (e: React.ClipboardEvent) => void
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
}) {
  return (
    <div className="flex gap-2 sm:gap-3 justify-center mb-4" onPaste={onPaste}>
      {digits.map((digit, i) => (
        <input key={i} ref={el => { inputRefs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface transition-all"
        />
      ))}
    </div>
  )
}

export default function LoginPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('identify')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [_userRole, setUserRole] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [forgotEmail, setForgotEmail] = useState('')

  // Parent flow state
  const [parentPhone, setParentPhone] = useState('')
  const [parentMaskedPhone, setParentMaskedPhone] = useState('')
  const [parentChildren, setParentChildren] = useState<ParentChild[]>([])

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  function resetForm() {
    setStep('identify')
    setPassword('')
    setConfirmPassword('')
    setOtpDigits(['', '', '', '', '', ''])
    setError(null)
    setUserName('')
    setUserRole('')
    setEmailHint('')
    setForgotEmail('')
    setParentPhone('')
    setParentMaskedPhone('')
    setParentChildren([])
  }

  async function handleParentRequestOTP(e: FormEvent) {
    e.preventDefault()
    const cleaned = parentPhone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Enter a valid 10-digit mobile number.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const result = await authService.parentRequestOTP(cleaned)
      setParentMaskedPhone(result.masked_phone)
      setStep('parent_otp')
      setResendCountdown(30)
      setOtpDigits(['', '', '', '', '', ''])
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Could not send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleParentVerifyOTP(e: FormEvent) {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length !== 6) { setError('Enter all 6 digits.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const cleaned = parentPhone.replace(/\D/g, '')
      const result = await authService.parentVerifyOTP(cleaned, code)
      if ('requires_child_selection' in result && result.requires_child_selection) {
        setParentChildren(result.children)
        setStep('parent_select_child')
      } else {
        loginWithToken(result.access, result.refresh, result.user, true)
        navigate('/')
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Invalid OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelectChild(child: ParentChild) {
    setError(null)
    setIsLoading(true)
    try {
      const cleaned = parentPhone.replace(/\D/g, '')
      const code = otpDigits.join('')
      const result = await authService.parentVerifyOTP(cleaned, code, child.student_user_id)
      if ('requires_child_selection' in result && result.requires_child_selection) {
        setError('Selection failed. Please request a new OTP.')
        return
      }
      loginWithToken(result.access, result.refresh, result.user, true)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Could not switch to selected child.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleParentResendOTP() {
    if (resendCountdown > 0) return
    setError(null)
    try {
      const cleaned = parentPhone.replace(/\D/g, '')
      await authService.parentRequestOTP(cleaned)
      setResendCountdown(30)
      setOtpDigits(['', '', '', '', '', ''])
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Failed to resend OTP.')
    }
  }

  async function handleIdentify(e: FormEvent) {
    e.preventDefault()
    if (!identifier.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      const result = await authService.identify(identifier.trim())
      setUserName(result.name)
      setUserRole(result.role)
      if (result.hint) setEmailHint(result.hint)
      setStep(result.method)
      if (result.method === 'otp') setResendCountdown(30)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      const msg = axiosErr.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.login(identifier.trim(), password)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; non_field_errors?: string[] } } }
      setError(axiosErr.response?.data?.error || axiosErr.response?.data?.non_field_errors?.[0] || 'Invalid credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.setPassword(identifier.trim(), password, confirmPassword)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; password?: string[] } } }
      setError(axiosErr.response?.data?.error || axiosErr.response?.data?.password?.[0] || 'Failed to set password.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOTP(e: FormEvent) {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length !== 6) { setError('Enter all 6 digits.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.verifyOTP(identifier.trim(), code)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Invalid OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    if (resendCountdown > 0) return
    setError(null)
    try {
      await authService.identify(identifier.trim())
      setResendCountdown(30)
      setOtpDigits(['', '', '', '', '', ''])
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Failed to resend OTP.')
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      const result = await authService.forgotPassword(forgotEmail.trim())
      setEmailHint(result.hint)
      setStep('reset')
      setResendCountdown(30)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Email not found.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length !== 6) { setError('Enter all 6 digits.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.resetPassword(forgotEmail.trim(), code, password, confirmPassword)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOTPChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value
    setOtpDigits(newDigits)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleOTPKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOTPPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newDigits = [...otpDigits]
    for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || ''
    setOtpDigits(newDigits)
    const focusIndex = Math.min(pasted.length, 5)
    otpRefs.current[focusIndex]?.focus()
  }

  // ── Step Content ──

  function renderStep() {
    switch (step) {
      case 'identify':
        return (
          <form onSubmit={handleIdentify} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="identifier">
                ID or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">badge</span>
                </div>
                <input id="identifier" placeholder="Enter your ID or Email"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={identifier} onChange={e => setIdentifier(e.target.value)} required autoFocus
                />
              </div>
            </div>
            <SubmitButton isLoading={isLoading}>Continue</SubmitButton>
            <div className="text-center pt-1">
              <button type="button" onClick={() => { setError(null); setStep('parent_phone') }}
                className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">family_restroom</span>
                Login as Parent
              </button>
            </div>
          </form>
        )

      case 'password':
        return (
          <form onSubmit={handlePasswordLogin} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">Signing in as</p>
              <p className="text-on-surface font-semibold">{userName} <span className="text-xs text-on-surface-variant">({identifier})</span></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="password">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input id="password" placeholder="Enter your password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-11 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="flex justify-end mt-2.5">
                <button type="button" onClick={() => { setForgotEmail(identifier.includes('@') ? identifier : ''); setStep('forgot') }}
                  className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all">
                  Forgot Password?
                </button>
              </div>
            </div>
            <SubmitButton isLoading={isLoading}>Sign In</SubmitButton>
          </form>
        )

      case 'set_password':
        return (
          <form onSubmit={handleSetPassword} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">Welcome! Set up your account</p>
              <p className="text-on-surface font-semibold">{userName} <span className="text-xs text-on-surface-variant">({identifier})</span></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Create Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input placeholder="Create a password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-11 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock_reset</span>
                </div>
                <input placeholder="Confirm your password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                />
              </div>
            </div>
            <SubmitButton isLoading={isLoading}>Create Account & Sign In</SubmitButton>
          </form>
        )

      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">OTP sent to</p>
              <p className="text-on-surface font-semibold">{emailHint}</p>
            </div>
            <OTPInputs digits={otpDigits} onChange={handleOTPChange} onKeyDown={handleOTPKeyDown} onPaste={handleOTPPaste} inputRefs={otpRefs} />
            <SubmitButton isLoading={isLoading}>Verify & Sign In</SubmitButton>
            <div className="text-center mt-3">
              {resendCountdown > 0 ? (
                <p className="text-xs text-on-surface-variant">Resend OTP in {resendCountdown}s</p>
              ) : (
                <button type="button" onClick={handleResendOTP}
                  className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )

      case 'forgot':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4 md:space-y-5">
            <BackButton onClick={() => setStep(identifier.includes('@') ? 'identify' : 'password')} />
            <div className="text-center mb-4">
              <h2 className="text-on-surface font-headline font-bold text-lg">Forgot Password?</h2>
              <p className="text-on-surface-variant text-xs mt-1">Enter your email to receive a reset code</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">mail</span>
                </div>
                <input type="email" placeholder="name@institution.edu"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus
                />
              </div>
            </div>
            <SubmitButton isLoading={isLoading}>Send Reset Code</SubmitButton>
          </form>
        )

      case 'parent_phone':
        return (
          <form onSubmit={handleParentRequestOTP} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <h2 className="text-on-surface font-headline font-bold text-lg">Parent Login</h2>
              <p className="text-on-surface-variant text-xs mt-1">Enter the mobile number registered with your child's school</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="parent-phone">
                Mobile Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">smartphone</span>
                </div>
                <div className="absolute inset-y-0 left-11 flex items-center pointer-events-none">
                  <span className="text-sm text-on-surface-variant font-medium">+91</span>
                </div>
                <input id="parent-phone" placeholder="98765 43210" type="tel" inputMode="numeric" maxLength={10}
                  className="block w-full pl-[4.75rem] pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={parentPhone} onChange={e => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required autoFocus
                />
              </div>
            </div>
            <SubmitButton isLoading={isLoading}>Send OTP</SubmitButton>
          </form>
        )

      case 'parent_otp':
        return (
          <form onSubmit={handleParentVerifyOTP} className="space-y-4 md:space-y-5">
            <BackButton onClick={() => setStep('parent_phone')} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">OTP sent via SMS to</p>
              <p className="text-on-surface font-semibold">+91 {parentMaskedPhone}</p>
            </div>
            <OTPInputs digits={otpDigits} onChange={handleOTPChange} onKeyDown={handleOTPKeyDown} onPaste={handleOTPPaste} inputRefs={otpRefs} />
            <SubmitButton isLoading={isLoading}>Verify & Continue</SubmitButton>
            <div className="text-center mt-3">
              {resendCountdown > 0 ? (
                <p className="text-xs text-on-surface-variant">Resend OTP in {resendCountdown}s</p>
              ) : (
                <button type="button" onClick={handleParentResendOTP}
                  className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )

      case 'parent_select_child':
        return (
          <div className="space-y-4 md:space-y-5">
            <BackButton onClick={() => setStep('parent_otp')} />
            <div className="text-center mb-4">
              <h2 className="text-on-surface font-headline font-bold text-lg">Select Child</h2>
              <p className="text-on-surface-variant text-xs mt-1">You have {parentChildren.length} children. Pick one to view their dashboard.</p>
            </div>
            <div className="space-y-2">
              {parentChildren.map(child => (
                <button key={child.student_user_id} type="button" disabled={isLoading}
                  onClick={() => handleSelectChild(child)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-surface-container-lowest hover:bg-primary/5 rounded-xl border border-outline-variant/25 hover:border-primary/30 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface font-semibold text-sm truncate">{child.name}</p>
                    <p className="text-on-surface-variant text-xs truncate">
                      {child.student_id}{child.section ? ` · ${child.section}` : ''}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline/40 text-lg">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-5">
            <BackButton onClick={() => setStep('forgot')} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">Reset code sent to</p>
              <p className="text-on-surface font-semibold">{emailHint}</p>
            </div>
            <OTPInputs digits={otpDigits} onChange={handleOTPChange} onKeyDown={handleOTPKeyDown} onPaste={handleOTPPaste} inputRefs={otpRefs} />
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input placeholder="New password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-11 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock_reset</span>
                </div>
                <input placeholder="Confirm password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                />
              </div>
            </div>
            <SubmitButton isLoading={isLoading}>Reset Password & Sign In</SubmitButton>
          </form>
        )
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-3 py-4 sm:px-6 sm:py-8 bg-primary-fixed/40">
      <ParticleNetwork particleCount={120} connectionDistance={200} mouseRadius={250} color="59,108,231" />

      <div className="relative z-10 w-full max-w-[900px] lg:max-w-[960px] bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-primary/8 overflow-hidden flex flex-col md:flex-row min-h-[540px] md:min-h-[580px]">

        {/* ── Left Brand Panel ── */}
        <div className="hidden md:flex md:w-[44%] relative flex-col items-center justify-center p-8 lg:p-10 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #D4DFFF 0%, #BFCFFA 40%, #A8BDF7 70%, #93ADF4 100%)' }}>
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <img src="/logo_name.png" alt="Acadrix" className="w-full max-w-[260px] lg:max-w-[290px] h-auto" />
            <div>
              <h2 className="font-headline font-extrabold text-[1.45rem] lg:text-[1.65rem] text-on-primary-fixed leading-tight tracking-tight mb-1">
                Your Campus, Smarter.
              </h2>
              <p className="text-on-primary-fixed-variant/50 text-[0.78rem] leading-relaxed">
                One platform for academics, analytics,<br />and assessments
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'monitoring', label: 'Analytics' },
                { icon: 'quiz', label: 'Exams' },
                { icon: 'groups', label: 'Campus' },
                { icon: 'school', label: 'Academics' },
              ].map(f => (
                <div key={f.label}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/35 backdrop-blur-sm border border-white/40 text-on-primary-fixed/70">
                  <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '0.9rem' }}>{f.icon}</span>
                  <span className="text-[0.68rem] font-semibold">{f.label}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="material-symbols-outlined fill-icon text-amber-500" style={{ fontSize: '0.8rem' }}>star</span>
                ))}
              </div>
              <p className="text-on-primary-fixed-variant/40 text-[0.62rem] font-medium">Trusted by 50+ institutions</p>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-6 sm:px-10 md:px-12 lg:px-14">
          <div className="mb-6 md:hidden flex justify-center">
            <img src="/logo_name.png" alt="Acadrix" className="h-44 sm:h-52 w-auto" />
          </div>

          {step === 'identify' && (
            <>
              <h1 className="font-headline font-extrabold text-lg sm:text-xl text-on-surface mb-0.5 tracking-tight md:text-left text-center md:text-2xl">
                Welcome Back
              </h1>
              <p className="text-on-surface-variant text-xs mb-5 md:text-left text-center md:text-sm md:mb-8">
                Sign in to your account to continue
              </p>
            </>
          )}

          <ErrorAlert error={error} />
          {renderStep()}

          {/* Google OAuth — only on identify step */}
          {step === 'identify' && (
            <>
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white/90 text-outline/70 font-medium">or continue with</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button type="button" disabled={isLoading}
                  onClick={async () => {
                    try {
                      const url = await authService.getGoogleAuthURL()
                      window.location.href = url
                    } catch {
                      setError('Unable to connect to Google. Please try again.')
                    }
                  }}
                  className="flex-1 max-w-[200px] h-11 rounded-xl border border-outline-variant/25 flex items-center justify-center gap-2.5 hover:bg-surface-container-low hover:border-outline-variant/40 hover:shadow-sm transition-all group disabled:opacity-60"
                  aria-label="Sign in with Google">
                  <svg aria-hidden="true" className="w-[1.125rem] h-[1.125rem] group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-xs font-medium text-on-surface-variant">Google</span>
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-on-surface-variant/70 mt-8">
            Don't have an account?{' '}
            <a href="#" className="text-primary font-semibold hover:underline underline-offset-4 transition-all">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  )
}
