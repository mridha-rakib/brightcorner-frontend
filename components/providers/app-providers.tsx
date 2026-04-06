'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { useAuthStore } from '@/store/auth-store'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}
