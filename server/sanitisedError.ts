import type { ResponseError } from 'superagent'

export interface SanitisedError {
  text?: string
  status?: number
  headers?: unknown
  data?: Record<string, string>
  stack: string
  message: string
}

export type UnsanitisedError = ResponseError

export default function sanitise(error: UnsanitisedError): SanitisedError {
  if (error.response) {
    return {
      text: error.response.text,
      status: error.response.status,
      headers: error.response.headers,
      data: error.response.body,
      message: error.message,
      stack: error.stack,
    }
  }
  return {
    message: error.message,
    stack: error.stack,
  }
}
