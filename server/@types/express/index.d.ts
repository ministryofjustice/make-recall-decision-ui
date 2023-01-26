import { ConfirmationMessage, NamedFormError } from '../pagesForms'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    errors?: NamedFormError[]
    unsavedValues?: Record<string, unknown>
    confirmationMessage?: ConfirmationMessage
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
    }
  }
}
