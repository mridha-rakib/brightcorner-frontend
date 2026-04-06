import { create } from 'zustand'

import type {
  NotificationFeedItem,
  PublicUser,
  SupportRequest,
  SupportRequestCategory,
  TwoFactorSettings,
} from '@/lib/api/types'

import { apiClient, getApiErrorMessage, unwrapResponse } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

type SupportRequestInput = {
  category: SupportRequestCategory
  email: string
  fullName: string
  message: string
  subject: string
}

type SettingsState = {
  error: string | null
  isLoadingNotifications: boolean
  isSubmittingSupportRequest: boolean
  isSubmittingTwoFactor: boolean
  notifications: NotificationFeedItem[]
  twoFactorSettings: TwoFactorSettings | null
  fetchNotifications: () => Promise<NotificationFeedItem[]>
  fetchTwoFactorSettings: () => Promise<TwoFactorSettings>
  markAllNotificationsAsRead: () => Promise<void>
  sendTwoFactorCode: () => Promise<TwoFactorSettings>
  submitSupportRequest: (input: SupportRequestInput) => Promise<SupportRequest>
  verifyTwoFactor: (input: { code: string, enabled: boolean }) => Promise<PublicUser>
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  error: null,
  isLoadingNotifications: false,
  isSubmittingSupportRequest: false,
  isSubmittingTwoFactor: false,
  notifications: [],
  twoFactorSettings: null,

  fetchNotifications: async () => {
    set({ error: null, isLoadingNotifications: true })

    try {
      const notifications = await unwrapResponse<NotificationFeedItem[]>(
        apiClient.get('/notifications/me'),
      )
      set({ isLoadingNotifications: false, notifications })
      return notifications
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isLoadingNotifications: false })
      throw new Error(message)
    }
  },

  markAllNotificationsAsRead: async () => {
    set({ error: null })

    try {
      await apiClient.patch('/notifications/me/read-all')
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
      }))
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      throw new Error(message)
    }
  },

  fetchTwoFactorSettings: async () => {
    set({ error: null, isSubmittingTwoFactor: true })

    try {
      const twoFactorSettings = await unwrapResponse<TwoFactorSettings>(
        apiClient.get('/users/me/two-factor'),
      )
      set({ isSubmittingTwoFactor: false, twoFactorSettings })
      return twoFactorSettings
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmittingTwoFactor: false })
      throw new Error(message)
    }
  },

  sendTwoFactorCode: async () => {
    set({ error: null, isSubmittingTwoFactor: true })

    try {
      const twoFactorSettings = await unwrapResponse<TwoFactorSettings>(
        apiClient.post('/users/me/two-factor/send-code'),
      )
      set({ isSubmittingTwoFactor: false, twoFactorSettings })
      return twoFactorSettings
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmittingTwoFactor: false })
      throw new Error(message)
    }
  },

  verifyTwoFactor: async (input) => {
    set({ error: null, isSubmittingTwoFactor: true })

    try {
      const user = await unwrapResponse<PublicUser>(
        apiClient.post('/users/me/two-factor/verify', input),
      )
      useAuthStore.setState({ user })
      set(state => ({
        isSubmittingTwoFactor: false,
        twoFactorSettings: state.twoFactorSettings
          ? {
              ...state.twoFactorSettings,
              enabled: user.isTwoFactorEnabled,
              expiresAt: null,
            }
          : null,
      }))
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmittingTwoFactor: false })
      throw new Error(message)
    }
  },

  submitSupportRequest: async (input) => {
    set({ error: null, isSubmittingSupportRequest: true })

    try {
      const request = await unwrapResponse<SupportRequest>(
        apiClient.post('/support-requests', input),
      )
      set({ isSubmittingSupportRequest: false })
      return request
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSubmittingSupportRequest: false })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
