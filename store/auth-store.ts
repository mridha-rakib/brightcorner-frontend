import { create } from 'zustand'

import type { AuthTwoFactorChallenge, PublicUser, SignInResponse } from '@/lib/api/types'

import { apiClient, getApiErrorMessage, getApiErrorStatus, unwrapResponse } from '@/lib/api/client'

type SignUpInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

type SignInInput = {
  identifier: string
  password: string
}

const TWO_FACTOR_CHALLENGE_STORAGE_KEY = 'brightcorner:two-factor-challenge'

function readStoredTwoFactorChallenge(): AuthTwoFactorChallenge | null {
  if (typeof window === 'undefined')
    return null

  const rawValue = window.sessionStorage.getItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY)
  if (!rawValue)
    return null

  try {
    return JSON.parse(rawValue) as AuthTwoFactorChallenge
  }
  catch {
    window.sessionStorage.removeItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY)
    return null
  }
}

function persistTwoFactorChallenge(challenge: AuthTwoFactorChallenge | null) {
  if (typeof window === 'undefined')
    return

  if (!challenge) {
    window.sessionStorage.removeItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(TWO_FACTOR_CHALLENGE_STORAGE_KEY, JSON.stringify(challenge))
}

type OnboardingInput = {
  username: string
  bio?: string
  avatarUrl?: string
  privacySettings?: Partial<PublicUser['privacySettings']>
  notificationSettings?: Partial<PublicUser['notificationSettings']>
}

type UpdateProfileInput = {
  firstName?: string
  lastName?: string
  username?: string
  bio?: string
  avatarUrl?: string
}

type AuthState = {
  user: PublicUser | null
  twoFactorChallenge: AuthTwoFactorChallenge | null
  isInitializing: boolean
  isSubmitting: boolean
  error: string | null
  initializationError: string | null
  initialize: () => Promise<void>
  fetchCurrentUser: () => Promise<PublicUser | null>
  signUp: (input: SignUpInput) => Promise<PublicUser>
  signIn: (input: SignInInput) => Promise<SignInResponse>
  verifySignInTwoFactor: (code: string) => Promise<PublicUser>
  resendSignInTwoFactorCode: () => Promise<AuthTwoFactorChallenge>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  completeOnboarding: (input: OnboardingInput) => Promise<PublicUser>
  updateProfile: (input: UpdateProfileInput) => Promise<PublicUser>
  updatePrivacySettings: (
    input: Partial<PublicUser['privacySettings']>,
  ) => Promise<PublicUser>
  updateNotificationSettings: (
    input: Partial<PublicUser['notificationSettings']>,
  ) => Promise<PublicUser>
  changeEmail: (newEmail: string) => Promise<PublicUser>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  setTwoFactorChallenge: (challenge: AuthTwoFactorChallenge | null) => void
  clearError: () => void
}

async function performRequest<T>(operation: () => Promise<T>): Promise<T> {
  return operation()
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  twoFactorChallenge: readStoredTwoFactorChallenge(),
  isInitializing: true,
  isSubmitting: false,
  error: null,
  initializationError: null,

  initialize: async () => {
    set({ error: null, initializationError: null, isInitializing: true })

    try {
      const user = await unwrapResponse<PublicUser>(apiClient.get('/auth/me'))
      persistTwoFactorChallenge(null)
      set({
        user,
        error: null,
        initializationError: null,
        isInitializing: false,
        twoFactorChallenge: null,
      })
    }
    catch (error) {
      if (getApiErrorStatus(error) !== 401) {
        const message = getApiErrorMessage(error)
        set({ error: message, initializationError: message, isInitializing: false })
        return
      }

      set({ user: null, initializationError: null, isInitializing: false })
    }
  },

  fetchCurrentUser: async () => {
    try {
      const user = await unwrapResponse<PublicUser>(apiClient.get('/users/me'))
      set({ user, error: null, initializationError: null })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      return null
    }
  },

  signUp: async (input) => {
    set({ isSubmitting: true, error: null })

    try {
      const user = await performRequest(() =>
        unwrapResponse<PublicUser>(apiClient.post('/auth/sign-up', input)),
      )
      persistTwoFactorChallenge(null)
      set({ user, initializationError: null, isSubmitting: false, twoFactorChallenge: null })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  signIn: async (input) => {
    set({ isSubmitting: true, error: null })

    try {
      const result = await performRequest(() =>
        unwrapResponse<SignInResponse>(apiClient.post('/auth/sign-in', input)),
      )

      if (result.status === 'two_factor_required') {
        persistTwoFactorChallenge(result.challenge)
        set({
          user: null,
          isSubmitting: false,
          twoFactorChallenge: result.challenge,
        })
        return result
      }

      persistTwoFactorChallenge(null)
      set({
        user: result.user,
        initializationError: null,
        isSubmitting: false,
        twoFactorChallenge: null,
      })
      return result
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  verifySignInTwoFactor: async (code) => {
    const challenge = get().twoFactorChallenge
    if (!challenge) {
      const message = 'Two-factor verification has expired. Please sign in again.'
      set({ error: message })
      throw new Error(message)
    }

    set({ isSubmitting: true, error: null })

    try {
      const user = await unwrapResponse<PublicUser>(
        apiClient.post('/auth/two-factor/verify', {
          challengeToken: challenge.challengeToken,
          code,
        }),
      )
      persistTwoFactorChallenge(null)
      set({ user, initializationError: null, isSubmitting: false, twoFactorChallenge: null })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  resendSignInTwoFactorCode: async () => {
    const challenge = get().twoFactorChallenge
    if (!challenge) {
      const message = 'Two-factor verification has expired. Please sign in again.'
      set({ error: message })
      throw new Error(message)
    }

    set({ isSubmitting: true, error: null })

    try {
      const nextChallenge = await unwrapResponse<AuthTwoFactorChallenge>(
        apiClient.post('/auth/two-factor/resend', {
          challengeToken: challenge.challengeToken,
        }),
      )
      persistTwoFactorChallenge(nextChallenge)
      set({ isSubmitting: false, twoFactorChallenge: nextChallenge })
      return nextChallenge
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  signOut: async () => {
    set({ isSubmitting: true, error: null })

    try {
      await apiClient.post('/auth/sign-out')
      persistTwoFactorChallenge(null)
      set({ user: null, initializationError: null, isSubmitting: false, twoFactorChallenge: null })
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  forgotPassword: async (email) => {
    set({ isSubmitting: true, error: null })

    try {
      await apiClient.post('/auth/forgot-password', { email })
      set({ isSubmitting: false })
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  resetPassword: async (token, password) => {
    set({ isSubmitting: true, error: null })

    try {
      await apiClient.post('/auth/reset-password', { token, password })
      set({ isSubmitting: false })
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  completeOnboarding: async (input) => {
    set({ isSubmitting: true, error: null })

    try {
      const user = await unwrapResponse<PublicUser>(
        apiClient.patch('/users/me/onboarding', input),
      )
      set({ user, initializationError: null, isSubmitting: false })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  updateProfile: async (input) => {
    set({ isSubmitting: true, error: null })

    try {
      const user = await unwrapResponse<PublicUser>(apiClient.patch('/users/me/profile', input))
      set({ user, initializationError: null, isSubmitting: false })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  updatePrivacySettings: async (input) => {
    set({ isSubmitting: true, error: null })

    try {
      const user = await unwrapResponse<PublicUser>(
        apiClient.patch('/users/me/privacy-settings', input),
      )
      set({ user, initializationError: null, isSubmitting: false })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  updateNotificationSettings: async (input) => {
    set({ isSubmitting: true, error: null })

    try {
      const user = await unwrapResponse<PublicUser>(
        apiClient.patch('/users/me/notification-settings', input),
      )
      set({ user, initializationError: null, isSubmitting: false })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  changeEmail: async (newEmail) => {
    set({ isSubmitting: true, error: null })

    try {
      const user = await unwrapResponse<PublicUser>(
        apiClient.patch('/users/me/change-email', { newEmail }),
      )
      set({ user, initializationError: null, isSubmitting: false })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isSubmitting: true, error: null })

    try {
      await apiClient.patch('/users/me/change-password', {
        currentPassword,
        newPassword,
      })
      set({ isSubmitting: false })
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  deleteAccount: async (password) => {
    set({ isSubmitting: true, error: null })

    try {
      await apiClient.delete('/users/me', {
        data: { password },
      })
      persistTwoFactorChallenge(null)
      set({ user: null, initializationError: null, isSubmitting: false, twoFactorChallenge: null })
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  setTwoFactorChallenge: (challenge) => {
    persistTwoFactorChallenge(challenge)
    set({ twoFactorChallenge: challenge })
  },

  clearError: () => set({ error: null }),
}))
