const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

type ApiRequestOptions = RequestInit & {
  token?: string | null
}

type LaravelValidationErrors = Record<string, string[]>

export class ApiError extends Error {
  status: number
  errors?: LaravelValidationErrors

  constructor(message: string, status: number, errors?: LaravelValidationErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') return fallback
  const data = payload as { errors?: LaravelValidationErrors; message?: string }
  const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
  return firstError || data.message || fallback
}

export async function apiRequest<T>(path: string, { token, ...options }: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null as T

  const payload = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    const errors =
      payload && typeof payload === 'object'
        ? (payload as { errors?: LaravelValidationErrors }).errors
        : undefined

    throw new ApiError(getErrorMessage(payload, 'Request failed.'), response.status, errors)
  }

  return payload as T
}
