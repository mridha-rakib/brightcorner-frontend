import type { PublicUser } from '@/lib/api/types'

export function resolveAuthenticatedRoute(user: PublicUser): string {
  if (user.role === 'admin')
    return '/dashboard'

  return user.onboardingCompleted ? '/chat' : '/onboarding'
}
