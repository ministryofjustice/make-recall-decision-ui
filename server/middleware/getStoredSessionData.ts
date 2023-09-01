import { NextFunction, Request, Response } from 'express'
import { transformErrorMessages } from '../utils/errors'

export const getStoredSessionData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { errors, unsavedValues, confirmationMessage } = req.session
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
    delete req.session.errors
  }
  if (unsavedValues) {
    res.locals.unsavedValues = unsavedValues
    delete req.session.unsavedValues
  }
  if (confirmationMessage) {
    res.locals.confirmationMessage = confirmationMessage
    delete req.session.confirmationMessage
  }
  next()
}
