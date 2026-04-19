'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type ChatPreferencesState = {
  pinnedChatKeys: string[]
  togglePinnedChat: (chatKey: string) => void
}

export const useChatPreferencesStore = create<ChatPreferencesState>()(
  persist(
    set => ({
      pinnedChatKeys: [],
      togglePinnedChat: (chatKey) => set((state) => {
        const isPinned = state.pinnedChatKeys.includes(chatKey)

        return {
          pinnedChatKeys: isPinned
            ? state.pinnedChatKeys.filter(existingChatKey => existingChatKey !== chatKey)
            : [chatKey, ...state.pinnedChatKeys],
        }
      }),
    }),
    {
      name: 'brightcorner:chat-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ pinnedChatKeys: state.pinnedChatKeys }),
    },
  ),
)
