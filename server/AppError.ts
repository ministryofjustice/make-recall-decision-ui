import { ObjectMap } from './@types'

export class AppError extends Error {
  public data = {}

  public status: number

  constructor(message: string, data?: ObjectMap<unknown>) {
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
