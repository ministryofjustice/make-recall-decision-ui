import { RequestHandler } from 'express'
import logger from '../../logger'
import { Check } from './check'

export function authorisationCheck(statusCheck?: Check): RequestHandler {
  return (req, res, next) => {
    if (statusCheck && !statusCheck(res.locals)) {
      logger.error(`User ${req.user?.username} is not authorised to access this: ${req.originalUrl}`)
      return res.redirect('/authError')
    }

    return next()
  }
}
