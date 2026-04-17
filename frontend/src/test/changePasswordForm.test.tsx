/**
 * Integration test for ChangePasswordForm.
 *
 * Verifies: client-side validation shows errors BEFORE hitting the API,
 * and a valid submission actually posts to /auth/change-password/.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChangePasswordForm from '@/components/forms/ChangePasswordForm'

vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '@/lib/api'

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    await user.click(screen.getByRole('button', { name: /change password/i }))

    // All 3 fields should show errors
    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('shows mismatch error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/current password/i), 'OldPass12')
    await user.type(screen.getByLabelText(/^new password/i), 'Newpass99')
    await user.type(screen.getByLabelText(/confirm new password/i), 'Different99')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('posts to /auth/change-password/ on valid submission', async () => {
    const user = userEvent.setup()
    vi.mocked(api.post).mockResolvedValue({ data: {} })

    render(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/current password/i), 'OldPass12')
    await user.type(screen.getByLabelText(/^new password/i), 'NewStrong99')
    await user.type(screen.getByLabelText(/confirm new password/i), 'NewStrong99')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/change-password/', {
        old_password: 'OldPass12',
        new_password: 'NewStrong99',
        confirm_password: 'NewStrong99',
      })
    })

    expect(await screen.findByText(/password changed successfully/i)).toBeInTheDocument()
  })

  it('shows server error when API fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Current password is wrong' } },
    })

    render(<ChangePasswordForm />)

    await user.type(screen.getByLabelText(/current password/i), 'OldPass12')
    await user.type(screen.getByLabelText(/^new password/i), 'NewStrong99')
    await user.type(screen.getByLabelText(/confirm new password/i), 'NewStrong99')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText(/current password is wrong/i)).toBeInTheDocument()
  })
})
