import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import type { ApiSuccessEnvelope } from '@/lib/api/types'

const DEFAULT_API_URL = 'http://localhost:3001/api/v1'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
export const API_ORIGIN = new URL(API_BASE_URL).origin

type ApiErrorDetail = {
  path?: string
  message?: string
}

type ApiErrorEnvelope = {
  message?: string
  error?: {
    message?: string
    details?: ApiErrorDetail[]
  }
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshSessionRequest: Promise<void> | null = null
let conversationUnlockToken: string | null = null

export function setConversationUnlockToken(token: string | null): void {
  conversationUnlockToken = token
}

export function getConversationUnlockToken(): string | null {
  return conversationUnlockToken
}

apiClient.interceptors.request.use((config) => {
  if (conversationUnlockToken) {
    config.headers = config.headers ?? {}
    config.headers['x-conversation-unlock-token'] = conversationUnlockToken
  }

  return config
})

function shouldRefreshSession(config: RetryableRequestConfig | undefined, statusCode?: number): config is RetryableRequestConfig {
  if (statusCode !== 401 || !config || config._retry || config.skipAuthRefresh)
    return false

  const requestUrl = config.url ?? ''

  return ![
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-out',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some(pathname => requestUrl.includes(pathname))
}

async function refreshSession(): Promise<void> {
  if (!refreshSessionRequest) {
    refreshSessionRequest = apiClient
      .post('/auth/refresh', undefined, { skipAuthRefresh: true } as RetryableRequestConfig)
      .then(() => undefined)
      .finally(() => {
        refreshSessionRequest = null
      })
  }

  return refreshSessionRequest
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorEnvelope>) => {
    const config = error.config as RetryableRequestConfig | undefined

    if (!shouldRefreshSession(config, error.response?.status))
      return Promise.reject(error)

    config._retry = true

    try {
      await refreshSession()
      return apiClient(config)
    }
    catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

export async function unwrapResponse<T>(request: Promise<{ data: ApiSuccessEnvelope<T> }>): Promise<T> {
  const response = await request
  return response.data.data
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as ApiErrorEnvelope | undefined
    const errorMessage = responseData?.error?.message
    const legacyMessage = responseData?.message
    const firstDetail = responseData?.error?.details?.[0]

    if (typeof errorMessage === 'string' && errorMessage.length > 0) {
      if (typeof firstDetail?.message === 'string' && firstDetail.message.length > 0) {
        const pathPrefix = typeof firstDetail.path === 'string' && firstDetail.path.length > 0
          ? `${firstDetail.path}: `
          : ''

        return `${errorMessage}. ${pathPrefix}${firstDetail.message}`
      }

      return errorMessage
    }

    if (typeof legacyMessage === 'string' && legacyMessage.length > 0)
      return legacyMessage

    if (typeof error.message === 'string' && error.message.length > 0)
      return error.message
  }

  if (error instanceof Error)
    return error.message

  return 'Something went wrong.'
}
