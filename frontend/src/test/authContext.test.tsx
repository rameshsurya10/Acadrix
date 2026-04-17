import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth, type AuthUser } from '@/contexts/AuthContext'

vi.mock('@/services/shared/authService', () => ({
  authService: {
    getMe: vi.fn().mockRejectedValue(new Error('no token')),
    logout: vi.fn().mockResolvedValue(undefined),
    googleCallback: vi.fn(),
    login: vi.fn(),
  },
}))

const fakeUser: AuthUser = {
  id: 1,
  email: 'student@test.com',
  role: 'student',
  full_name: 'Aarav Sharma',
}

function Probe() {
  const { user, isParentSession, loginWithToken, logout } = useAuth()
  return (
    <div>
      <span data-testid="user">{user?.full_name ?? 'none'}</span>
      <span data-testid="parent">{isParentSession ? 'yes' : 'no'}</span>
      <button onClick={() => loginWithToken('access', 'refresh', fakeUser, true)}>parent-login</button>
      <button onClick={() => loginWithToken('access', 'refresh', fakeUser, false)}>student-login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated when no token in storage', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(screen.getByTestId('parent').textContent).toBe('no')
  })

  it('marks parent session when loginWithToken called with isParent=true', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('parent-login').click()
    })
    expect(screen.getByTestId('user').textContent).toBe('Aarav Sharma')
    expect(screen.getByTestId('parent').textContent).toBe('yes')
    expect(localStorage.getItem('acadrix_parent_session')).toBe('1')
  })

  it('clears parent flag for normal student login', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('student-login').click()
    })
    expect(screen.getByTestId('parent').textContent).toBe('no')
    expect(localStorage.getItem('acadrix_parent_session')).toBeNull()
  })

  it('clears storage and state on logout', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('parent-login').click()
    })
    await act(async () => {
      screen.getByText('logout').click()
    })
    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(screen.getByTestId('parent').textContent).toBe('no')
    expect(localStorage.getItem('acadrix_token')).toBeNull()
    expect(localStorage.getItem('acadrix_parent_session')).toBeNull()
  })
})
