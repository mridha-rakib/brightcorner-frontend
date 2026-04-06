import 'server-only'

import { cookies } from 'next/headers'

import type { ApiSuccessEnvelope, PublicUser } from '@/lib/api/types'

const DEFAULT_API_URL = 'http://localhost:3001/api/v1'
const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL

async function parseUserResponse(response: Response): Promise<PublicUser | null> {
  if (!response.ok)
    return null

  const payload = await response.json() as ApiSuccessEnvelope<PublicUser>
  return payload.data
}

export async function getServerCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  if (!cookieHeader)
    return null

  const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  })

  if (meResponse.ok)
    return parseUserResponse(meResponse)

  if (meResponse.status !== 401)
    return null

  const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  })

  return parseUserResponse(refreshResponse)
}
