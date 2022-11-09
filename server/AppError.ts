type AppErrorType = 'INVALID_CRN' | 'INVALID_RECOMMENDATION_STATUS'

export interface AppErrorData {
  [key: string]: unknown
  errorType?: AppErrorType
}

export class AppError extends Error {
  public data: AppErrorData = {}

  public status: number

  constructor(message: string, data?: AppErrorData) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
    this.name = 'AppError'
    this.data = data
    if (data.status) {
      this.status = data.status as number
    }
  }
}
