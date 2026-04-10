'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { resolveAuthenticatedRoute } from '@/lib/auth-routing'
import { useAuthStore } from '@/store/auth-store'

type GuardArea = 'admin' | 'auth' | 'chat'

type RouteGuardProps = {
  area: GuardArea
  children: React.ReactNode
}

function resolveRedirectPath(
  area: GuardArea,
  pathname: string,
  user: ReturnType<typeof useAuthStore.getState>['user'],
): string | null {
  if (area === 'admin') {
    if (!user)
      return '/sign-in'

    if (user.role !== 'admin')
      return resolveAuthenticatedRoute(user)

    return null
  }

  if (area === 'chat') {
    if (!user)
      return '/sign-in'

    if (user.role === 'admin')
      return '/dashboard'

    if (!user.onboardingCompleted)
      return '/onboarding'

    return null
  }

  if (pathname === '/onboarding') {
    if (!user)
      return '/sign-in'

    if (user.role === 'admin')
      return '/dashboard'

    if (user.onboardingCompleted)
      return '/chat'

    return null
  }

  if (user)
    return resolveAuthenticatedRoute(user)

  return null
}

export function RouteGuard({ area, children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore(state => state.user)
  const isInitializing = useAuthStore(state => state.isInitializing)
  const initializationError = useAuthStore(state => state.initializationError)
  const initialize = useAuthStore(state => state.initialize)
  const shouldHoldForInitializationError = Boolean(initializationError && area !== 'auth')

  const redirectPath = isInitializing || shouldHoldForInitializationError
    ? null
    : resolveRedirectPath(area, pathname, user)

  useEffect(() => {
    if (redirectPath)
      router.replace(redirectPath)
  }, [redirectPath, router])

  if (isInitializing || redirectPath)
    return null

  if (shouldHoldForInitializationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-neutral-950">Session check failed</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">{initializationError}</p>
          <Button className="mt-5" onClick={() => void initialize()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
