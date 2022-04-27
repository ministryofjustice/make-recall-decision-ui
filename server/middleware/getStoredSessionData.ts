import { NextFunction, Request, Response } from 'express'
import { transformErrorMessages } from '../utils/errors'

export const getStoredSessionData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { errors, unsavedValues } = req.session
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
    res.locals.unsavedValues = unsavedValues
    delete req.session.errors
    delete req.session.unsavedValues
  }
  next()
}
