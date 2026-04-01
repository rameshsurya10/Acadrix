import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/contexts/AuthContext'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin:     '/admin/dashboard',
  principal: '/principal/dashboard',
  teacher:   '/teacher/dashboard',
  student:   '/student/dashboard',
  parent:    '/parent/payments',
}

const MOCK_ROLES: { role: UserRole; label: string; icon: string; color: string }[] = [
  { role: 'admin',     label: 'Admin',     icon: 'admin_panel_settings', color: 'text-red-500' },
  { role: 'principal', label: 'Principal', icon: 'school',               color: 'text-purple-500' },
  { role: 'teacher',   label: 'Teacher',   icon: 'person_book',          color: 'text-blue-500' },
  { role: 'student',   label: 'Student',   icon: 'face',                 color: 'text-green-500' },
  { role: 'parent',    label: 'Parent',    icon: 'family_restroom',      color: 'text-orange-500' },
]

const isDev = import.meta.env.DEV

export default function LoginPage() {
  const { login, mockLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      // AuthContext doesn't expose role after login directly, navigate via /
      navigate('/')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleMockLogin(role: UserRole) {
    mockLogin(role)
    navigate(ROLE_REDIRECTS[role])
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-primary-fixed opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-secondary-fixed opacity-30 blur-[100px]"></div>
        <div className="w-full max-w-[480px] z-10">

          {/* Branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">school</span>
              <h1 className="font-headline font-extrabold tracking-tighter text-3xl text-primary">Acadrix</h1>
            </div>
            <div className="space-y-1">
              <span className="font-label text-[0.75rem] uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Academic Intelligence Platform</span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">Welcome back to Acadrix</h2>
            </div>
          </div>

          {/* Dev Mock Login Panel — only in development */}
          {isDev && (
            <div className="mb-6 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-600 text-base">bug_report</span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-amber-700">Dev Quick Login</span>
                <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">DEV ONLY</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {MOCK_ROLES.map(({ role, label, icon, color }) => (
                  <button
                    key={role}
                    onClick={() => handleMockLogin(role)}
                    className="flex flex-col items-center gap-1 rounded-lg bg-white p-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all border border-amber-200"
                    type="button"
                  >
                    <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
                    <span className="text-[10px] font-semibold text-slate-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-surface-container-lowest rounded-xl p-8 lg:p-10 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.04)] border border-outline-variant/10">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <span className="material-symbols-outlined text-red-500 text-base">error</span>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block font-label text-sm font-semibold text-on-surface-variant" htmlFor="email">ID / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">alternate_email</span>
                  </div>
                  <input
                    className="block w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all duration-200"
                    id="email"
                    name="email"
                    placeholder="Enter your institutional ID"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-all" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">lock_open</span>
                  </div>
                  <input
                    className="block w-full pl-12 pr-12 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all duration-200"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    <span className="material-symbols-outlined text-outline text-xl hover:text-on-surface-variant">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary/20"
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <label className="ml-2 block text-sm text-on-surface-variant" htmlFor="remember">Stay signed in for 30 days</label>
              </div>
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-3.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container-high"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-surface-container-lowest text-outline font-semibold">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors group" type="button">
                <span className="material-symbols-outlined text-lg text-secondary group-hover:scale-110 transition-transform">google</span>
                <span className="font-label text-sm font-semibold text-on-secondary-container">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors group" type="button">
                <span className="material-symbols-outlined text-lg text-secondary group-hover:scale-110 transition-transform">hub</span>
                <span className="font-label text-sm font-semibold text-on-secondary-container">Institutional SSO</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">New Admissions</a>
              <div className="w-1 h-1 bg-outline-variant rounded-full"></div>
              <a className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">Contact Support</a>
            </div>
            <p className="text-[10px] text-outline text-center max-w-[280px] leading-relaxed italic">
              Acadrix empowers institutions with intelligent academic management.
            </p>
          </div>
        </div>
      </main>
      <footer className="bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-6 max-w-7xl mx-auto gap-4">
          <span className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            © 2025 Acadrix. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-all duration-200" href="#">Privacy Policy</a>
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-all duration-200" href="#">Terms of Service</a>
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-all duration-200" href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
