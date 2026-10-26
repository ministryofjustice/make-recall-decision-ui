import { SanitisedError as HmppsSanitisedError } from '@ministryofjustice/hmpps-rest-client'

export interface SanitisedError {
  text?: string
  status?: number
  headers?: unknown
  data?: Record<string, string>
  stack: string
  message: string
}

export type UnsanitisedError = HmppsSanitisedError | Error

export default function sanitise(error: UnsanitisedError): SanitisedError {
  if ('responseStatus' in error) {
    return {
      text: error.text,
      status: error.responseStatus,
      headers: error.headers,
      data: error.data as Record<string, string>,
      message: error.message,
      stack: error.stack,
    }
  }
  if ('response' in error && error.response) {
    const resp = error.response as { text?: string; status?: number; headers?: unknown; body?: Record<string, string> }
    return {
      text: resp.text,
      status: resp.status,
      headers: resp.headers,
      data: resp.body,
      message: error.message,
      stack: error.stack,
    }
  }
  return {
    message: error.message,
    stack: error.stack,
  }
}
