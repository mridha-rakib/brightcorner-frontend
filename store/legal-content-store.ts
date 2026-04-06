import { create } from 'zustand'

import type { LegalContent } from '@/lib/api/types'

import { apiClient, getApiErrorMessage, unwrapResponse } from '@/lib/api/client'

type LegalContentType = 'privacy' | 'terms' | 'about'

type LegalContentStore = {
  contentByType: Partial<Record<LegalContentType, LegalContent>>
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchContent: (type: LegalContentType) => Promise<LegalContent>
  saveContent: (type: LegalContentType, payload: {
    title?: string
    content: string
  }) => Promise<LegalContent>
  clearError: () => void
}

export const useLegalContentStore = create<LegalContentStore>((set, get) => ({
  contentByType: {},
  isLoading: false,
  isSaving: false,
  error: null,

  fetchContent: async (type) => {
    const existingContent = get().contentByType[type]
    if (existingContent)
      return existingContent

    set({ isLoading: true, error: null })

    try {
      const content = await unwrapResponse<LegalContent>(apiClient.get(`/legal-content/${type}`))
      set((state) => ({
        contentByType: {
          ...state.contentByType,
          [type]: content,
        },
        isLoading: false,
      }))
      return content
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  saveContent: async (type, payload) => {
    set({ isSaving: true, error: null })

    try {
      const content = await unwrapResponse<LegalContent>(
        apiClient.put(`/legal-content/${type}`, payload),
      )
      set((state) => ({
        contentByType: {
          ...state.contentByType,
          [type]: content,
        },
        isSaving: false,
      }))
      return content
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message, isSaving: false })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
