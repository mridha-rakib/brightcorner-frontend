'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { LanguageCode } from '@/lib/i18n'

import { isSupportedLanguage } from '@/lib/i18n'

type LanguageState = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      language: 'en',
      setLanguage: language => set({ language }),
    }),
    {
      name: 'brightcorner:language',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (!state || isSupportedLanguage(state.language))
          return

        state.setLanguage('en')
      },
    },
  ),
)

