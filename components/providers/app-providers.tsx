'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'

import { LanguageRuntime } from '@/components/providers/language-runtime'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { useAuthStore } from '@/store/auth-store'

const SESSION_OPTIONAL_PATHS = new Set([
  '/forgot-password',
  '/reset-password',
  '/sign-in',
  '/sign-up',
  '/two-factor',
])

export function AppProviders({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(state => state.initialize)
  const skipInitialization = useAuthStore(state => state.skipInitialization)
  const pathname = usePathname()

  useEffect(() => {
    if (SESSION_OPTIONAL_PATHS.has(pathname)) {
      skipInitialization()
      return
    }

    void initialize()
  }, [initialize, pathname, skipInitialization])

  return (
    <>
      <LanguageRuntime />
      {children}
      <Toaster richColors position="top-right" />
      <LanguageSwitcher />
    </>
  )
}
