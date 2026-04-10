import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Bone } from '@/components/shared/Skeleton'

interface ProfileFormState {
  first_name: string
  last_name: string
  phone: string
}

interface PasswordFormState {
  current_password: string
  new_password: string
  confirm_password: string
}

export default function ProfileEditPage() {
  const { user } = useAuth()

  // ── Profile form ────────────────────────────────────────────────────
  const nameParts = user?.full_name?.split(' ') ?? []
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    first_name: nameParts[0] ?? '',
    last_name: nameParts.slice(1).join(' ') ?? '',
    phone: '',
  })
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // ── Password form ───────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // ── Helpers ─────────────────────────────────────────────────────────
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  function clearMessage(setter: (v: string) => void) {
    setTimeout(() => setter(''), 4000)
  }

  // ── Profile submit ──────────────────────────────────────────────────
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      setProfileError('First name and last name are required.')
      return
    }

    setProfileSubmitting(true)
    try {
      await api.patch('/auth/me/', {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        phone: profileForm.phone.trim(),
      })
      setProfileSuccess('Profile updated successfully.')
      clearMessage(setProfileSuccess)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile. Please try again.'
      setProfileError(message)
    } finally {
      setProfileSubmitting(false)
    }
  }

  // ── Password submit ─────────────────────────────────────────────────
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordError('All password fields are required.')
      return
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setPasswordSubmitting(true)
    try {
      await api.post('/auth/change-password/', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setPasswordSuccess('Password changed successfully.')
      clearMessage(setPasswordSuccess)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to change password. Check your current password and try again.'
      setPasswordError(message)
    } finally {
      setPasswordSubmitting(false)
    }
  }

  if (!user) {
    return (
      <PageLayout>
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32 space-y-8">
          <Bone className="w-32 h-3 rounded-md" />
          <Bone className="w-64 h-8 rounded-md" />
          <Bone className="w-full h-64 rounded-xl" />
          <Bone className="w-full h-48 rounded-xl" />
        </main>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">
        {/* Header */}
        <section className="mb-8 md:mb-10">
          <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
            Account
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
            Edit Profile
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-xl text-sm md:text-base">
            Update your personal information and security settings.
          </p>
        </section>

        {/* Current user info card */}
        <section className="bg-surface-container-lowest rounded-xl p-5 md:p-8 mb-8 md:mb-10 flex flex-col md:flex-row gap-5 md:gap-8 items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24" />
          <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl md:text-4xl font-bold text-primary">
                {getInitials(user.full_name)}
              </span>
            )}
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <div className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
              {user.role.replace('_', ' ')}
            </div>
            <h3 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface truncate">{user.full_name}</h3>
            <p className="text-on-surface-variant font-medium text-sm md:text-base">{user.email}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">badge</span>
              ID: #{user.id}
            </div>
          </div>
        </section>

        {/* Profile form */}
        <section className="bg-surface-container-lowest rounded-xl p-5 md:p-8 mb-8 md:mb-10">
          <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Personal Information
          </h3>

          {profileSuccess && (
            <div className="mb-4 flex items-center gap-3 bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mb-4 flex items-center gap-3 bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-lg">error</span>
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="profile-first-name" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  First Name *
                </label>
                <input
                  id="profile-first-name"
                  type="text"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="First name"
                  value={profileForm.first_name}
                  onChange={e => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="profile-last-name" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Last Name *
                </label>
                <input
                  id="profile-last-name"
                  type="text"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="Last name"
                  value={profileForm.last_name}
                  onChange={e => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-phone" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                className="w-full md:w-1/2 px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                placeholder="+1 (555) 000-0000"
                value={profileForm.phone}
                onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="bg-primary text-on-primary py-3 px-8 rounded-lg font-headline font-bold text-sm hover:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {profileSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Password form */}
        <section className="bg-surface-container-lowest rounded-xl p-5 md:p-8">
          <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            Change Password
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            For security, enter your current password before setting a new one.
          </p>

          {passwordSuccess && (
            <div className="mb-4 flex items-center gap-3 bg-tertiary/10 text-tertiary px-4 py-3 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 flex items-center gap-3 bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-lg">error</span>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Current password */}
            <div>
              <label htmlFor="pw-current" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                Current Password *
              </label>
              <div className="relative w-full md:w-1/2">
                <input
                  id="pw-current"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="Enter current password"
                  value={passwordForm.current_password}
                  onChange={e => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showCurrentPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* New password + confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="pw-new" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="pw-new"
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-12 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                    placeholder="Min 8 characters"
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="pw-confirm" className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Confirm New Password *
                </label>
                <input
                  id="pw-confirm"
                  type="password"
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="Repeat new password"
                  value={passwordForm.confirm_password}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                />
              </div>
            </div>

            {/* Password strength hint */}
            {passwordForm.new_password.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex gap-1 flex-1 max-w-xs">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordForm.new_password.length >= level * 3
                          ? level <= 2
                            ? 'bg-error'
                            : level === 3
                            ? 'bg-primary'
                            : 'bg-tertiary'
                          : 'bg-surface-container-high'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-on-surface-variant">
                  {passwordForm.new_password.length < 6
                    ? 'Too short'
                    : passwordForm.new_password.length < 10
                    ? 'Fair'
                    : 'Strong'}
                </span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="bg-primary text-on-primary py-3 px-8 rounded-lg font-headline font-bold text-sm hover:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {passwordSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </PageLayout>
  )
}
