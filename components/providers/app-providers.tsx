'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { LanguageRuntime } from '@/components/providers/language-runtime'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { useAuthStore } from '@/store/auth-store'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
    <>
      <LanguageRuntime />
      {children}
      <Toaster richColors position="top-right" />
      <LanguageSwitcher />
    </>
  )
}
