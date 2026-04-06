import { create } from 'zustand'

import type { PublicUser } from '@/lib/api/types'

import { apiClient, getApiErrorMessage, unwrapResponse } from '@/lib/api/client'

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
  isInitializing: boolean
  isSubmitting: boolean
  error: string | null
  initialize: () => Promise<void>
  fetchCurrentUser: () => Promise<PublicUser | null>
  signUp: (input: SignUpInput) => Promise<PublicUser>
  signIn: (input: SignInInput) => Promise<PublicUser>
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
  clearError: () => void
}

async function performRequest<T>(operation: () => Promise<T>): Promise<T> {
  return operation()
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,
  isSubmitting: false,
  error: null,

  initialize: async () => {
    set({ isInitializing: true })

    try {
      const user = await unwrapResponse<PublicUser>(apiClient.get('/auth/me'))
      set({ user, error: null, isInitializing: false })
    }
    catch {
      set({ user: null, isInitializing: false })
    }
  },

  fetchCurrentUser: async () => {
    try {
      const user = await unwrapResponse<PublicUser>(apiClient.get('/users/me'))
      set({ user, error: null })
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
      set({ user, isSubmitting: false })
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
      const user = await performRequest(() =>
        unwrapResponse<PublicUser>(apiClient.post('/auth/sign-in', input)),
      )
      set({ user, isSubmitting: false })
      return user
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
      set({ user: null, isSubmitting: false })
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
      set({ user, isSubmitting: false })
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
      set({ user, isSubmitting: false })
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
      set({ user, isSubmitting: false })
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
      set({ user, isSubmitting: false })
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
      set({ user, isSubmitting: false })
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
      set({ user: null, isSubmitting: false })
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmitting: false })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
