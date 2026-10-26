import type { Request, Response, NextFunction } from 'express'
import logger from '../logger'

interface ErrorWithCode extends Error {
  status?: number
  responseStatus?: number
  code?: string
}

export default function createErrorHandler() {
  return (error: ErrorWithCode, req: Request, res: Response, next: NextFunction): void => {
    if (error.code === 'EBADCSRFTOKEN') {
      // invalid CSRF token
      logger.error(`Invalid CSRF token from URL: ${req.originalUrl}`, error)
    }

    const status = error.status || error.responseStatus
    if (status === 401 || status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)
    res.locals.isProduction = res.locals.env === 'prod'
    if (!res.locals.isProduction) {
      res.locals.message = error.message
      res.locals.status = status
      res.locals.stack = error.stack
    }

    res.status(status || 500)

    return res.render('pages/error')
  }
}
