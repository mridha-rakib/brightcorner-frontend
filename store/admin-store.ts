import { create } from 'zustand'

import type {
  AdminDashboardSummary,
  AdminUserDetail,
  AdminUserSummary,
  PublicUser,
} from '@/lib/api/types'

import { apiClient, getApiErrorMessage, unwrapResponse } from '@/lib/api/client'

type AdminStore = {
  dashboard: AdminDashboardSummary | null
  users: AdminUserSummary[]
  selectedUser: AdminUserDetail | null
  isLoadingDashboard: boolean
  isLoadingUsers: boolean
  isLoadingSelectedUser: boolean
  isUpdatingUser: boolean
  error: string | null
  fetchDashboard: () => Promise<void>
  fetchUsers: (search?: string) => Promise<void>
  fetchUserById: (userId: string) => Promise<AdminUserDetail>
  updateUserStatus: (userId: string, status: PublicUser['status']) => Promise<AdminUserDetail>
  clearError: () => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  dashboard: null,
  users: [],
  selectedUser: null,
  isLoadingDashboard: false,
  isLoadingUsers: false,
  isLoadingSelectedUser: false,
  isUpdatingUser: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true, error: null })

    try {
      const dashboard = await unwrapResponse<AdminDashboardSummary>(apiClient.get('/admin/dashboard'))
      set({ dashboard, isLoadingDashboard: false })
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isLoadingDashboard: false,
      })
    }
  },

  fetchUsers: async (search) => {
    set({ isLoadingUsers: true, error: null })

    try {
      const users = await unwrapResponse<AdminUserSummary[]>(apiClient.get('/admin/users', {
        params: { search },
      }))
      set({ users, isLoadingUsers: false })
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isLoadingUsers: false,
      })
    }
  },

  fetchUserById: async (userId) => {
    set({ isLoadingSelectedUser: true, error: null })

    try {
      const user = await unwrapResponse<AdminUserDetail>(apiClient.get(`/admin/users/${userId}`))
      set({ selectedUser: user, isLoadingSelectedUser: false })
      return user
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({
        error: message,
        isLoadingSelectedUser: false,
      })
      throw new Error(message)
    }
  },

  updateUserStatus: async (userId, status) => {
    set({ isUpdatingUser: true, error: null })

    try {
      const updatedUser = await unwrapResponse<AdminUserDetail>(
        apiClient.patch(`/admin/users/${userId}/status`, { status }),
      )

      set(state => ({
        users: state.users.map(user => (user.id === updatedUser.id ? updatedUser : user)),
        selectedUser: state.selectedUser?.id === updatedUser.id ? updatedUser : state.selectedUser,
        isUpdatingUser: false,
      }))

      await get().fetchDashboard()
      return updatedUser
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({
        error: message,
        isUpdatingUser: false,
      })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
