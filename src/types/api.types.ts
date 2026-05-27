/**
 * Tipos padrão de resposta da API
 */

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}
